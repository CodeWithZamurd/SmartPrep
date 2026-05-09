import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ notifications: list });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json({ notification: n });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, message, type = 'system', userId } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });
    const target = userId && req.user.role === 'admin' ? userId : req.user._id;
    const n = await Notification.create({ user: target, title, message, type });
    res.json({ notification: n });
  } catch (e) {
    next(e);
  }
});

router.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
