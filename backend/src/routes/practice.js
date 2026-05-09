import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import * as ai from '../services/aiClient.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Single question, no persistence
router.get('/question', requireAuth, async (req, res, next) => {
  try {
    const { domain = 'web', difficulty = 'medium' } = req.query;
    const q = await ai.generateQuestion({ domain, difficulty, history: [] });
    res.json({ question: q.question, domain, difficulty });
  } catch (e) {
    next(e);
  }
});

router.post('/evaluate', requireAuth, upload.single('audio'), async (req, res, next) => {
  try {
    const { question, domain = 'web', difficulty = 'medium' } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing question' });
    let transcript = req.body.textFallback || '';
    if (req.file) {
      const tx = await ai.transcribeAudio(req.file.buffer, req.file.originalname || 'answer.m4a');
      transcript = tx.text || '';
    }
    if (!transcript) return res.status(400).json({ error: 'No transcript or audio' });
    const evalRes = await ai.evaluateAnswer({ question, transcript, domain, difficulty });
    res.json({ transcript, evaluation: evalRes });
  } catch (e) {
    next(e);
  }
});

export default router;
