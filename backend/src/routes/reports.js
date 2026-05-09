import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Report from '../models/Report.js';
import Feedback from '../models/Feedback.js';
import InterviewSession from '../models/InterviewSession.js';

const router = Router();

router.post('/generate/:sessionId', requireAuth, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const feedback = await Feedback.findOne({ session: session._id });
    const filename = `report-${session._id}-${Date.now()}.json`;
    const r = await Report.create({
      user: req.user._id,
      session: session._id,
      feedback: feedback ? feedback._id : null,
      filePath: `/reports/${filename}`,
      format: 'json',
      generatedAt: new Date()
    });
    res.json({ report: r });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Report.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ reports: list });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const r = await Report.findOne({ _id: req.params.id, user: req.user._id })
      .populate('session')
      .populate('feedback');
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ report: r });
  } catch (e) {
    next(e);
  }
});

export default router;
