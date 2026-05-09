import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Domain from '../models/Domain.js';

const router = Router();

const SEED = [
  { name: 'Frontend Development', slug: 'frontend', icon: 'code', description: 'HTML/CSS/JS, frameworks, accessibility.' },
  { name: 'Data Science', slug: 'data-science', icon: 'chart', description: 'Statistics, ML pipelines, data wrangling.' },
  { name: 'DevOps', slug: 'devops', icon: 'cogs', description: 'CI/CD, infra, observability.' },
  { name: 'Cyber Security', slug: 'cyber-security', icon: 'shield', description: 'Security fundamentals, AppSec.' },
  { name: 'Artificial Intelligence', slug: 'ai', icon: 'brain', description: 'ML, deep learning, LLMs.' },
  { name: 'Quality Assurance', slug: 'qa', icon: 'check', description: 'Testing strategies, bug triage.' },
  { name: 'Web Development', slug: 'web', icon: 'globe', description: 'Full-stack web engineering.' }
];

router.get('/', requireAuth, async (_req, res, next) => {
  try {
    let list = await Domain.find().sort({ name: 1 });
    if (list.length === 0) {
      list = await Domain.insertMany(SEED);
    }
    res.json({ domains: list });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const d = await Domain.create(req.body);
    res.json({ domain: d });
  } catch (e) {
    next(e);
  }
});

export default router;
