import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import InterviewSession from '../models/InterviewSession.js';
import QuestionAttempt from '../models/QuestionAttempt.js';

const router = Router();

function publicUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    isPremium: u.isPremium,
    domainPreference: u.domainPreference,
    settings: u.settings
  };
}

router.get('/', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/', requireAuth, async (req, res, next) => {
  try {
    const { name, avatarUrl, domainPreference } = req.body;
    if (name) req.user.name = name;
    if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
    if (domainPreference !== undefined) req.user.domainPreference = domainPreference;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (e) {
    next(e);
  }
});

router.patch('/settings', requireAuth, async (req, res, next) => {
  try {
    const { darkMode, learningMode, notificationsEnabled } = req.body;
    if (darkMode !== undefined) req.user.settings.darkMode = darkMode;
    if (learningMode !== undefined) req.user.settings.learningMode = learningMode;
    if (notificationsEnabled !== undefined)
      req.user.settings.notificationsEnabled = notificationsEnabled;
    await req.user.save();
    res.json({ settings: req.user.settings });
  } catch (e) {
    next(e);
  }
});

router.post('/upgrade', requireAuth, async (req, res, next) => {
  try {
    req.user.isPremium = true;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id, status: 'completed' });
    const totalQuestions = await QuestionAttempt.countDocuments({ user: req.user._id });
    const totalSessions = sessions.length;
    const avgScore =
      sessions.length > 0
        ? Math.round(sessions.reduce((s, x) => s + (x.overallScore || 0), 0) / sessions.length)
        : 0;
    res.json({
      stats: {
        totalQuestions,
        totalSessions,
        accuracy: avgScore,
        recentSessions: sessions
          .slice(-5)
          .map((s) => ({
            id: s._id,
            domainSlug: s.domainSlug,
            overallScore: s.overallScore,
            createdAt: s.createdAt
          }))
      }
    });
  } catch (e) {
    next(e);
  }
});

export default router;
