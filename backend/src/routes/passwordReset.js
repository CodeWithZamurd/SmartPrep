import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import SystemLog from '../models/SystemLog.js';

const router = Router();

const OTP_TTL_MS = 5 * 60 * 1000;          // 5 minutes
const MAX_OTP_ATTEMPTS = 5;                // wrong-OTP attempts before invalidation
const PASSWORD_REGEX = /^(?=.*[!@#$%^&*]).{6,}$/;

// ---------- nodemailer (lazy singleton) ----------
let _transporter = null;
function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}
function getTransporter() {
  if (_transporter) return _transporter;
  const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env');
  }
  _transporter = nodemailer.createTransport(
    EMAIL_HOST
      ? {
          host: EMAIL_HOST,
          port: Number(EMAIL_PORT) || 587,
          secure: Number(EMAIL_PORT) === 465,
          auth: { user: EMAIL_USER, pass: EMAIL_PASS }
        }
      : { service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } }
  );
  return _transporter;
}

// In development, if email isn't configured, log the OTP to the server console
// instead of failing. This keeps the UI flow testable without Gmail App Passwords.
// In production we always require real email — silently logging would be a foot-gun.
async function sendOtpEmail(to, otp) {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email is not configured on the server.');
    }
    console.log('\n========================================');
    console.log('  [DEV] EMAIL NOT CONFIGURED — OTP BELOW');
    console.log(`  to:    ${to}`);
    console.log(`  code:  ${otp}`);
    console.log(`  ttl:   5 minutes`);
    console.log('  Set EMAIL_USER/EMAIL_PASS in backend/.env to send real emails.');
    console.log('========================================\n');
    return;
  }
  const from = process.env.EMAIL_FROM || `"SmartPrep AI" <${process.env.EMAIL_USER}>`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;background:#0A1331;color:#fff;border-radius:12px">
      <h2 style="color:#5AC8FA;margin:0 0 12px">SmartPrep — Password Reset</h2>
      <p>Use the one-time code below to reset your password. It expires in <b>5 minutes</b>.</p>
      <div style="font-size:32px;font-weight:900;letter-spacing:8px;background:#1A2548;border-radius:8px;padding:18px;text-align:center;margin:18px 0;color:#5AC8FA">${otp}</div>
      <p style="color:#9BA4C2;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
  await getTransporter().sendMail({
    from,
    to,
    subject: 'SmartPrep — Your password reset code',
    text: `Your SmartPrep password reset code is ${otp}. It expires in 5 minutes.`,
    html
  });
}

// ---------- rate limiters ----------
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again in a few minutes.' }
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' }
});

// Generic response so attackers cannot probe which emails are registered.
const GENERIC_FORGOT_OK = { message: 'If an account exists for that email, a code has been sent.' };

// ---------- POST /auth/password/forgot ----------
router.post('/forgot', forgotLimiter, async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.json(GENERIC_FORGOT_OK); // do not leak

    const otp = String(crypto.randomInt(100000, 1000000)); // 6 digits, cryptographically random
    const otpHash = await bcrypt.hash(otp, 10);

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.passwordResetAttempts = 0;
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.error('OTP email failed:', mailErr.message);
      return res.status(500).json({ error: 'Could not send the email. Try again later.' });
    }

    SystemLog.create({ user: user._id, action: 'password_reset_requested' }).catch(() => {});
    res.json(GENERIC_FORGOT_OK);
  } catch (e) {
    next(e);
  }
});

// ---------- POST /auth/password/verify-otp ----------
// Optional intermediate step so the UI can validate the code before asking
// for the new password. Returns { ok: true } without modifying state.
router.post('/verify-otp', resetLimiter, async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (user.passwordResetOtpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (user.passwordResetAttempts >= MAX_OTP_ATTEMPTS) {
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiry = null;
      await user.save();
      return res.status(429).json({ error: 'Too many wrong attempts. Request a new code.' });
    }
    const ok = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!ok) {
      user.passwordResetAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---------- POST /auth/password/reset ----------
router.post('/reset', resetLimiter, async (req, res, next) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = req.body?.newPassword || '';
    const confirmPassword = req.body?.confirmPassword || '';

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters and include a special character (!@#$%^&*)'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (user.passwordResetOtpExpiry.getTime() < Date.now()) {
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    if (user.passwordResetAttempts >= MAX_OTP_ATTEMPTS) {
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiry = null;
      await user.save();
      return res.status(429).json({ error: 'Too many wrong attempts. Request a new code.' });
    }
    const ok = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!ok) {
      user.passwordResetAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiry = null;
    user.passwordResetAttempts = 0;
    await user.save();

    SystemLog.create({ user: user._id, action: 'password_reset_completed' }).catch(() => {});
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    next(e);
  }
});

export default router;
