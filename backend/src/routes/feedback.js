import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Feedback from '../models/Feedback.js';
import InterviewSession from '../models/InterviewSession.js';

const router = Router();

router.get('/session/:sessionId', requireAuth, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    let fb = await Feedback.findOne({ session: session._id });
    if (!fb) {
      fb = await Feedback.create({
        user: req.user._id,
        session: session._id,
        technicalScore: session.overallTechnical || 0,
        voiceScore: session.overallVoice || 0,
        bodyLanguageScore: session.overallBodyLanguage || 0,
        toneConfidence: session.overallConfidence || 0,
        communicationScore: session.overallClarity || 0,
        overallScore: session.overallScore || 0,
        suggestion: (session.tips || []).join('\n')
      });
    }
    res.json({ feedback: fb, session });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ feedback: list });
  } catch (e) {
    next(e);
  }
});

export default router;
