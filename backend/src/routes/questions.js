import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Question from '../models/Question.js';
import Domain from '../models/Domain.js';
import User from '../models/User.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { domain, difficulty, search, status = 'approved' } = req.query;
    const q = { status };
    if (domain) {
      const d = mongoose.isValidObjectId(domain)
        ? await Domain.findById(domain)
        : await Domain.findOne({ slug: domain });
      if (d) q.domain = d._id;
    }
    if (difficulty && difficulty !== 'all') q.difficultyLevel = difficulty;
    if (search) q.questionText = { $regex: search, $options: 'i' };
    const list = await Question.find(q).populate('domain', 'name slug').sort({ createdAt: -1 }).limit(200);
    res.json({ questions: list, count: list.length });
  } catch (e) {
    next(e);
  }
});

router.get('/bookmarked', requireAuth, async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id).populate({
      path: 'bookmarkedQuestions',
      populate: { path: 'domain', select: 'name slug' }
    });
    res.json({ questions: u.bookmarkedQuestions || [] });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/bookmark', requireAuth, async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id);
    const id = req.params.id;
    const has = u.bookmarkedQuestions.some((x) => x.toString() === id);
    if (has) {
      u.bookmarkedQuestions = u.bookmarkedQuestions.filter((x) => x.toString() !== id);
    } else {
      u.bookmarkedQuestions.push(id);
    }
    await u.save();
    res.json({ bookmarked: !has });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id).populate('domain', 'name slug');
    if (!q) return res.status(404).json({ error: 'Not found' });
    res.json({ question: q });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const q = await Question.create({ ...req.body, createdBy: req.user._id });
    res.json({ question: q });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/approve', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    res.json({ question: q });
  } catch (e) {
    next(e);
  }
});

export default router;
