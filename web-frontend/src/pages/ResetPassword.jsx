import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function ResetPassword() {
  const nav = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!/^(?=.*[!@#$%^&*]).{6,}$/.test(newPassword)) {
      return setError('Password must be at least 6 characters and include a special character (!@#$%^&*).');
    }

    setLoading(true);
    try {
      await api.post('/auth/password/reset', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      setInfo('Password reset. Redirecting to sign in…');
      setTimeout(() => nav('/login'), 900);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    setInfo('');
    if (!email) return setError('Enter your email first.');
    setLoading(true);
    try {
      await api.post('/auth/password/forgot', { email: email.trim() });
      setInfo('A new code has been sent if the account exists.');
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heroTitle={
        <>
          Set a <span>new password</span>
        </>
      }
      heroSubtitle="Enter the 6-digit code we emailed you and choose a new password."
    >
      <h2>Reset password</h2>
      <p className="subtitle mt-sm">Codes expire after 5 minutes.</p>

      {error && (
        <div className="card alt mt-md" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}
      {info && (
        <div className="card alt mt-md" style={{ borderColor: 'var(--green)' }}>
          <p style={{ color: 'var(--green)' }}>{info}</p>
        </div>
      )}

      <form onSubmit={submit}>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="label">6-digit code</label>
        <input
          className="input"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
          style={{ letterSpacing: 4, fontWeight: 700 }}
        />

        <label className="label">New password</label>
        <div className="password-wrap">
          <input
            className="input"
            type={showPwd ? 'text' : 'password'}
            placeholder="At least 6 chars + a special character"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="button" className="toggle" onClick={() => setShowPwd((s) => !s)}>
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>

        <label className="label">Confirm password</label>
        <input
          className="input"
          type={showPwd ? 'text' : 'password'}
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="btn block lg mt-lg" disabled={loading}>
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button type="button" className="link" onClick={resend} disabled={loading}>
          Didn't get a code? Resend
        </button>
      </div>

      <div className="divider" />
      <p className="center" style={{ fontSize: 14 }}>
        <Link to="/login" className="link">← Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
