import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Report from '../models/Report.js';
import Feedback from '../models/Feedback.js';
import InterviewSession from '../models/InterviewSession.js';
import { buildSessionReportPdf } from '../services/pdfReport.js';

const router = Router();

function safeFilename(s) {
  return String(s || 'report').replace(/[^a-z0-9-_]+/gi, '-').slice(0, 60);
}

async function loadSessionAndFeedback(sessionId, userId) {
  const session = await InterviewSession.findOne({ _id: sessionId, user: userId })
    .populate('domain');
  if (!session) return { error: 'Session not found' };
  let feedback = await Feedback.findOne({ session: session._id });
  if (!feedback) {
    feedback = await Feedback.create({
      user: userId,
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
  return { session, feedback };
}

// Stream the PDF for a given session.
// Mounted at /reports/session/:sessionId/pdf
router.get('/session/:sessionId/pdf', requireAuth, async (req, res, next) => {
  try {
    const { session, feedback, error } = await loadSessionAndFeedback(req.params.sessionId, req.user._id);
    if (error) return res.status(404).json({ error });

    const domainName = (session.domain && session.domain.name) || session.domainSlug || 'general';
    const dateStr = new Date(session.createdAt || session.startTime || Date.now())
      .toISOString().slice(0, 10);
    const filename = `SmartPrep-${safeFilename(domainName)}-${dateStr}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    const doc = buildSessionReportPdf({ session, feedback, user: req.user });
    doc.pipe(res);
    doc.end();

    // Best-effort history record (fire and forget — failure should not break the download)
    Report.create({
      user: req.user._id,
      session: session._id,
      feedback: feedback._id,
      filePath: filename,
      format: 'pdf',
      generatedAt: new Date()
    }).catch(() => {});
  } catch (e) {
    next(e);
  }
});

// Legacy: keep a JSON "generate" stub for any callers that still hit it.
router.post('/generate/:sessionId', requireAuth, async (req, res, next) => {
  try {
    const { session, feedback, error } = await loadSessionAndFeedback(req.params.sessionId, req.user._id);
    if (error) return res.status(404).json({ error });
    const filename = `report-${session._id}-${Date.now()}.pdf`;
    const r = await Report.create({
      user: req.user._id,
      session: session._id,
      feedback: feedback._id,
      filePath: filename,
      format: 'pdf',
      generatedAt: new Date()
    });
    res.json({ report: r, downloadUrl: `/reports/session/${session._id}/pdf` });
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
