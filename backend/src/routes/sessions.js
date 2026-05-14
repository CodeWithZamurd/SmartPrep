import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import InterviewSession from '../models/InterviewSession.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import Response from '../models/Response.js';
import Feedback from '../models/Feedback.js';
import Domain from '../models/Domain.js';
import * as ai from '../services/aiClient.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function saveBuffer(prefix, ext, buf) {
  const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const full = path.join(UPLOAD_DIR, name);
  fs.writeFileSync(full, buf);
  return `/uploads/${name}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function checkDailyLimit(user) {
  if (user.isPremium) return;
  const limit = parseInt(process.env.DAILY_SESSION_LIMIT || '3', 10);
  const today = todayKey();
  if (user.dailySessionDate !== today) {
    user.dailySessionDate = today;
    user.dailySessionCount = 0;
  }
  if (user.dailySessionCount >= limit) {
    const err = new Error('Daily session limit reached. Upgrade to premium for unlimited sessions.');
    err.status = 429;
    throw err;
  }
  user.dailySessionCount += 1;
  await user.save();
}

async function resolveDomain(input) {
  if (!input) return null;
  if (mongoose.isValidObjectId(input)) return Domain.findById(input);
  return Domain.findOne({ slug: input });
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      domain,
      difficulty = 'medium',
      targetQuestions = 15,
      mode = { textInput: true, voiceInput: true, webcam: false }
    } = req.body;
    const d = await resolveDomain(domain);
    if (!d) return res.status(400).json({ error: 'Invalid domain' });
    await checkDailyLimit(req.user);
    const session = await InterviewSession.create({
      user: req.user._id,
      domain: d._id,
      domainSlug: d.slug,
      difficulty,
      targetQuestions,
      mode,
      startTime: new Date()
    });
    const q = await ai.generateQuestion({ domain: d.slug, difficulty, history: [] });
    session.turns.push({ questionIndex: 0, question: q.question, difficulty });
    await session.save();
    res.json({
      sessionId: session._id,
      question: q.question,
      index: 0,
      total: targetQuestions,
      domain: { id: d._id, name: d.name, slug: d.slug }
    });
  } catch (e) {
    next(e);
  }
});

const answerUpload = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'frame', maxCount: 1 }
]);

router.post('/:id/answer', requireAuth, answerUpload, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ error: 'Session not active' });

    const turn = session.turns[session.turns.length - 1];
    if (!turn || turn.transcript) return res.status(400).json({ error: 'No pending question' });

    const audioFile = req.files?.audio?.[0];
    const videoFile = req.files?.video?.[0];
    const frameFile = req.files?.frame?.[0];

    let transcript = (req.body && req.body.textFallback) || '';
    if (audioFile) {
      const tx = await ai.transcribeAudio(audioFile.buffer, audioFile.originalname || 'answer.webm');
      transcript = tx.text || '';
    }
    if (!transcript) return res.status(400).json({ error: 'No transcript or audio' });

    // Persist video for replay/evidence (optional — skipped if not provided)
    if (videoFile) {
      const ext = (videoFile.mimetype && videoFile.mimetype.includes('mp4')) ? '.mp4' : '.webm';
      turn.videoUrl = saveBuffer('video', ext, videoFile.buffer);
    }

    // Analyze a snapshot frame using the AI service's Vision endpoint
    if (frameFile) {
      try {
        const ext = (frameFile.mimetype && frameFile.mimetype.includes('png')) ? '.png' : '.jpg';
        turn.frameUrl = saveBuffer('frame', ext, frameFile.buffer);
        const metrics = await ai.analyzeFrame(
          frameFile.buffer,
          frameFile.originalname || `frame${ext}`,
          frameFile.mimetype || 'image/jpeg'
        );
        turn.bodyFrameMetrics = {
          eyeContact: metrics.eyeContact ?? null,
          facialSentiment: metrics.facialSentiment ?? null,
          fidgeting: metrics.fidgeting ?? null,
          posture: metrics.posture ?? null,
          reason: metrics.reason || ''
        };
        if (metrics.eyeContact != null) turn.eyeContactPct = metrics.eyeContact;
      } catch (frameErr) {
        // Don't fail the whole turn if frame analysis fails
        console.error('frame analysis failed:', frameErr.message);
      }
    }

    const eyeContactPct =
      req.body && req.body.eyeContactPct ? Number(req.body.eyeContactPct) : undefined;

    const evalRes = await ai.evaluateAnswer({
      question: turn.question,
      transcript,
      domain: session.domainSlug,
      difficulty: turn.difficulty
    });

    turn.transcript = transcript;
    turn.technicalScore = evalRes.technicalScore;
    turn.clarityScore = evalRes.clarityScore;
    turn.confidenceScore = evalRes.confidenceScore;
    turn.suggestion = evalRes.suggestion;
    turn.correct = (evalRes.technicalScore || 0) >= 60;
    if (eyeContactPct !== undefined) turn.eyeContactPct = eyeContactPct;

    const responseDoc = await Response.create({
      user: req.user._id,
      session: session._id,
      answerText: transcript,
      marksObtained: evalRes.technicalScore || 0
    });
    await QuestionAttempt.create({
      user: req.user._id,
      session: session._id,
      questionText: turn.question,
      response: responseDoc._id,
      confidenceScore: evalRes.confidenceScore,
      difficultyLevel: turn.difficulty
    });

    const nextIndex = session.turns.length;
    if (nextIndex >= session.targetQuestions) {
      const fb = await ai.generateFeedback({ domain: session.domainSlug, turns: session.turns });
      session.overallTechnical = fb.overallTechnical;
      session.overallClarity = fb.overallClarity;
      session.overallConfidence = fb.overallConfidence;
      session.overallVoice =
        fb.overallVoice ||
        Math.round(((fb.overallClarity || 0) + (fb.overallConfidence || 0)) / 2);
      session.overallBodyLanguage = fb.overallBodyLanguage || 0;
      session.overallScore = Math.round(
        0.6 * (session.overallTechnical || 0) +
          0.2 * (session.overallVoice || 0) +
          0.2 * (session.overallBodyLanguage || 0)
      );
      session.voiceMetrics = fb.voiceMetrics || {
        fillerWords: session.overallClarity || 0,
        pacing: 80,
        clarity: session.overallClarity || 0,
        toneConfidence: session.overallConfidence || 0
      };
      session.bodyMetrics = fb.bodyMetrics || {
        eyeContact: 80,
        facialSentiment: 80,
        fidgeting: 80,
        posture: 80
      };
      session.summary = fb.summary;
      session.tips = fb.tips || [];
      session.suggestions = fb.suggestions || { technical: '', voice: '', bodyLanguage: '' };
      session.status = 'completed';
      session.endTime = new Date();
      session.sessionDuration = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
      await session.save();
      await Feedback.create({
        user: req.user._id,
        session: session._id,
        technicalScore: session.overallTechnical,
        voiceScore: session.overallVoice,
        bodyLanguageScore: session.overallBodyLanguage,
        toneConfidence: session.overallConfidence,
        communicationScore: session.overallClarity,
        overallScore: session.overallScore,
        suggestion: (session.tips || []).join('\n')
      });
      const correct = session.turns.filter((t) => t.correct).length;
      return res.json({ done: true, sessionId: session._id, correctCount: correct });
    } else {
      const nextDifficulty = evalRes.nextDifficulty || turn.difficulty;
      const history = session.turns.map((t) => ({ question: t.question, transcript: t.transcript }));
      const nq = await ai.generateQuestion({
        domain: session.domainSlug,
        difficulty: nextDifficulty,
        history
      });
      session.turns.push({
        questionIndex: nextIndex,
        question: nq.question,
        difficulty: nextDifficulty
      });
      await session.save();
      return res.json({
        done: false,
        question: nq.question,
        index: nextIndex,
        total: session.targetQuestions,
        lastEvaluation: {
          technicalScore: evalRes.technicalScore,
          clarityScore: evalRes.clarityScore,
          confidenceScore: evalRes.confidenceScore,
          suggestion: evalRes.suggestion
        }
      });
    }
  } catch (e) {
    next(e);
  }
});

router.post('/:id/abandon', requireAuth, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Not found' });
    if (session.status === 'active') {
      session.status = 'abandoned';
      session.endTime = new Date();
      await session.save();
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('domain', 'name slug')
      .select(
        'domain domainSlug difficulty status overallTechnical overallScore overallClarity overallConfidence createdAt'
      )
      .limit(50);
    res.json({ sessions: list });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('domain', 'name slug');
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json({ session });
  } catch (e) {
    next(e);
  }
});

export default router;
