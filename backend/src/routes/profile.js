import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, email: u.email, domainPreference: u.domainPreference } });
});

router.patch('/', requireAuth, async (req, res, next) => {
  try {
    const { name, domainPreference } = req.body;
    if (name) req.user.name = name;
    if (domainPreference && ['software', 'ai_ds'].includes(domainPreference)) {
      req.user.domainPreference = domainPreference;
    }
    await req.user.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
