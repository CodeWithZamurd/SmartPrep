import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import InterviewSession from '../models/InterviewSession.js';
import * as ai from '../services/aiClient.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function checkDailyLimit(user) {
  const limit = parseInt(process.env.DAILY_SESSION_LIMIT || '10', 10);
  const today = todayKey();
  if (user.dailySessionDate !== today) {
    user.dailySessionDate = today;
    user.dailySessionCount = 0;
  }
  if (user.dailySessionCount >= limit) {
    const err = new Error('Daily session limit reached');
    err.status = 429;
    throw err;
  }
  user.dailySessionCount += 1;
  await user.save();
}

// Create session and return first question
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { domain = 'software', difficulty = 'medium', targetQuestions = 5 } = req.body;
    await checkDailyLimit(req.user);
    const session = await InterviewSession.create({
      user: req.user._id,
      domain,
      difficulty,
      targetQuestions
    });
    const q = await ai.generateQuestion({ domain, difficulty, history: [] });
    session.turns.push({ questionIndex: 0, question: q.question, difficulty });
    await session.save();
    res.json({ sessionId: session._id, question: q.question, index: 0, total: targetQuestions });
  } catch (e) {
    next(e);
  }
});

// Submit audio for current question
router.post('/:id/answer', requireAuth, upload.single('audio'), async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ error: 'Session not active' });

    const turn = session.turns[session.turns.length - 1];
    if (!turn || turn.transcript) {
      return res.status(400).json({ error: 'No pending question' });
    }

    let transcript = (req.body && req.body.textFallback) || '';
    if (req.file) {
      const tx = await ai.transcribeAudio(req.file.buffer, req.file.originalname || 'answer.m4a');
      transcript = tx.text || '';
    }
    if (!transcript) return res.status(400).json({ error: 'No transcript or audio' });

    const eyeContactPct = req.body && req.body.eyeContactPct ? Number(req.body.eyeContactPct) : undefined;

    const evalRes = await ai.evaluateAnswer({
      question: turn.question,
      transcript,
      domain: session.domain,
      difficulty: turn.difficulty
    });

    turn.transcript = transcript;
    turn.technicalScore = evalRes.technicalScore;
    turn.clarityScore = evalRes.clarityScore;
    turn.confidenceScore = evalRes.confidenceScore;
    turn.suggestion = evalRes.suggestion;
    if (eyeContactPct !== undefined) turn.eyeContactPct = eyeContactPct;

    const nextIndex = session.turns.length;
    if (nextIndex >= session.targetQuestions) {
      // finish
      const fb = await ai.generateFeedback({ domain: session.domain, turns: session.turns });
      session.overallTechnical = fb.overallTechnical;
      session.overallClarity = fb.overallClarity;
      session.overallConfidence = fb.overallConfidence;
      session.summary = fb.summary;
      session.tips = fb.tips || [];
      session.status = 'completed';
      await session.save();
      return res.json({ done: true, sessionId: session._id });
    } else {
      const nextDifficulty = evalRes.nextDifficulty || turn.difficulty;
      const history = session.turns.map((t) => ({ question: t.question, transcript: t.transcript }));
      const nq = await ai.generateQuestion({ domain: session.domain, difficulty: nextDifficulty, history });
      session.turns.push({ questionIndex: nextIndex, question: nq.question, difficulty: nextDifficulty });
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

// Abandon
router.post('/:id/abandon', requireAuth, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Not found' });
    if (session.status === 'active') {
      session.status = 'abandoned';
      await session.save();
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// History
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('domain difficulty status overallTechnical overallClarity overallConfidence createdAt')
      .limit(50);
    res.json({ sessions: list });
  } catch (e) {
    next(e);
  }
});

// Detail
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json({ session });
  } catch (e) {
    next(e);
  }
});

export default router;
