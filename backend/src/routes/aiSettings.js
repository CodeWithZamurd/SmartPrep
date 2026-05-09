import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import AISetting from '../models/AISetting.js';

const router = Router();

const DEFAULT_NAME = 'default';

async function getOrCreate() {
  let s = await AISetting.findOne({ name: DEFAULT_NAME });
  if (!s) s = await AISetting.create({ name: DEFAULT_NAME });
  return s;
}

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const s = await getOrCreate();
    res.json({ setting: s });
  } catch (e) {
    next(e);
  }
});

router.patch('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const s = await getOrCreate();
    const { difficultyMin, difficultyMax, followUpFrequency, weights } = req.body;
    if (difficultyMin) s.difficultyMin = difficultyMin;
    if (difficultyMax) s.difficultyMax = difficultyMax;
    if (followUpFrequency !== undefined) s.followUpFrequency = followUpFrequency;
    if (weights) s.weights = { ...s.weights.toObject?.() || s.weights, ...weights };
    s.lastUpdated = new Date();
    await s.save();
    res.json({ setting: s });
  } catch (e) {
    next(e);
  }
});

export default router;
