import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ai from '../services/aiClient.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { domain = 'ai' } = req.query;
    const data = await ai.generateChallenge({ domain });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
