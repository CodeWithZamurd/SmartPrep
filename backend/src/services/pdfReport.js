import PDFDocument from 'pdfkit';

// Light theme tuned for paper / standard PDF viewers.
// Dark navy is used only as an accent band; body text stays dark on white
// so it prints well and is readable in any viewer.
const COLOR = {
  navy: '#0A1331',
  navySoft: '#1A2548',
  primary: '#2563EB',     // strong blue — good contrast on white
  primarySoft: '#DBEAFE',
  text: '#0F172A',        // slate-900
  subtext: '#475569',     // slate-600
  muted: '#94A3B8',       // slate-400
  divider: '#E2E8F0',     // slate-200
  panel: '#F1F5F9',       // slate-100
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  yellow: '#D97706',
  yellowSoft: '#FEF3C7',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  orange: '#EA580C',
  orangeSoft: '#FFEDD5',
  white: '#FFFFFF'
};

const M = 40;              // page margin
const PAGE_W = 595.28;     // A4 width in pt
const PAGE_H = 841.89;     // A4 height in pt
const CONTENT_W = PAGE_W - M * 2;

// ---------- helpers ----------

function pct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function verdictFor(o) {
  if (o >= 75) return 'Strong Candidate';
  if (o >= 60) return 'Promising';
  return 'Needs Practice';
}

function verdictColor(o) {
  if (o >= 75) return COLOR.green;
  if (o >= 60) return COLOR.yellow;
  return COLOR.red;
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString();
}

function fmtDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function bar(doc, x, y, width, value, color) {
  const v = pct(value);
  doc.save();
  doc.roundedRect(x, y, width, 6, 3).fill(COLOR.divider);
  if (v > 0) doc.roundedRect(x, y, (width * v) / 100, 6, 3).fill(color);
  doc.restore();
}

// Print a section title with an underline.
// Always resets doc.x to the left margin so subsequent text stays aligned.
function sectionTitle(doc, text) {
  doc.x = M;
  doc.moveDown(0.5);
  doc.fillColor(COLOR.text).font('Helvetica-Bold').fontSize(13).text(text, M, doc.y);
  doc.x = M;
  doc.moveTo(M, doc.y + 2).lineTo(PAGE_W - M, doc.y + 2)
    .strokeColor(COLOR.divider).lineWidth(0.6).stroke();
  doc.moveDown(0.5);
  doc.x = M;
}

// One metric row: label · bar · score, single line.
function metricRow(doc, label, value, color) {
  const labelW = 150;
  const valueW = 60;
  const barW = CONTENT_W - labelW - valueW - 16;
  const y = doc.y;

  doc.font('Helvetica').fontSize(10).fillColor(COLOR.subtext)
    .text(label, M, y, { width: labelW });

  bar(doc, M + labelW, y + 4, barW, value, color);

  doc.font('Helvetica-Bold').fontSize(10).fillColor(color)
    .text(`${pct(value)}/100`, M + labelW + barW + 8, y, { width: valueW, align: 'right' });

  doc.x = M;
  doc.y = y + 16;
}

// One headline score card (used for the three big numbers on top).
function scoreCard(doc, x, y, w, h, label, value, color) {
  doc.save();
  doc.roundedRect(x, y, w, h, 8).fillAndStroke(COLOR.panel, COLOR.divider);
  doc.fillColor(COLOR.subtext).font('Helvetica').fontSize(9)
    .text(label.toUpperCase(), x + 12, y + 10, { width: w - 24, characterSpacing: 0.5 });
  doc.fillColor(color).font('Helvetica-Bold').fontSize(28)
    .text(`${pct(value)}%`, x + 12, y + 24, { width: w - 24 });
  bar(doc, x + 12, y + h - 16, w - 24, value, color);
  doc.restore();
}

// Two-column key/value block (used for session summary).
function kvRow(doc, x, y, w, key, value) {
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.muted)
    .text(key, x, y, { width: 90 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.text)
    .text(String(value || '—'), x + 95, y, { width: w - 95 });
}

// Ring/circle showing the overall score.
function scoreRing(doc, cx, cy, r, value, color) {
  const v = pct(value);
  doc.save();
  // outer ring background
  doc.lineWidth(10).strokeColor(COLOR.divider).circle(cx, cy, r).stroke();
  // foreground arc
  if (v > 0) {
    const start = -Math.PI / 2;
    const end = start + (v / 100) * Math.PI * 2;
    doc.lineWidth(10).strokeColor(color);
    // PDFKit's path API: build an arc manually with many small segments
    const steps = Math.max(8, Math.floor((v / 100) * 64));
    const stepAngle = (end - start) / steps;
    doc.moveTo(cx + r * Math.cos(start), cy + r * Math.sin(start));
    for (let i = 1; i <= steps; i++) {
      const a = start + stepAngle * i;
      doc.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    doc.stroke();
  }
  // centre text
  doc.fillColor(COLOR.text).font('Helvetica-Bold').fontSize(28)
    .text(`${v}%`, cx - r, cy - 18, { width: r * 2, align: 'center' });
  doc.fillColor(COLOR.subtext).font('Helvetica').fontSize(9)
    .text(verdictFor(v), cx - r, cy + 12, { width: r * 2, align: 'center' });
  doc.restore();
}

// Renders a pill badge at an absolute position WITHOUT mutating the document
// cursor — the previous text-flow cursor is restored on exit so the caller
// can continue writing normally.
function pillBadge(doc, x, y, label, color, softBg) {
  const padX = 8;
  const padY = 3;
  const prevX = doc.x;
  const prevY = doc.y;
  doc.font('Helvetica-Bold').fontSize(9);
  const w = doc.widthOfString(label) + padX * 2;
  doc.save();
  doc.roundedRect(x, y, w, 16, 8).fill(softBg);
  doc.fillColor(color).text(label, x + padX, y + padY, { lineBreak: false });
  doc.restore();
  doc.x = prevX;
  doc.y = prevY;
  return w;
}

// Ensure there is enough vertical room for `needed` pt before drawing —
// otherwise emit a manual page break. Prevents footer overlap and orphans.
function ensureSpace(doc, needed) {
  if (doc.y + needed > PAGE_H - 60) {
    doc.addPage();
    doc.x = M;
    doc.y = M;
  }
}

// ---------- main ----------

export function buildSessionReportPdf({ session, feedback, user }) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: M,
    bufferPages: true,
    info: {
      Title: `SmartPrep Interview Report — ${session?.domainSlug || ''}`,
      Author: 'SmartPrep AI',
      Subject: 'AI mock-interview performance report'
    }
  });

  // ============ Header band ============
  doc.rect(0, 0, PAGE_W, 90).fill(COLOR.navy);
  doc.fillColor(COLOR.white).font('Helvetica-Bold').fontSize(24).text('SmartPrep', M, 28);
  doc.fillColor('#9BA4C2').font('Helvetica').fontSize(10).text('AI Mock-Interview Report', M, 58);
  doc.fillColor('#9BA4C2').font('Helvetica').fontSize(9)
    .text(`Generated ${fmtDate(new Date())}`, PAGE_W - M - 200, 32, { width: 200, align: 'right' });

  doc.fillColor(COLOR.text);
  doc.y = 110;
  doc.x = M;

  // ============ Session summary + overall score (two columns) ============
  const domainName = (session.domain && session.domain.name) || session.domainSlug || 'General';
  const overall = pct(session.overallScore);
  const ovColor = verdictColor(overall);
  const correct = (session.turns || []).filter((t) => t.correct).length;
  const total = (session.turns || []).length || session.targetQuestions || 0;
  const duration = session.sessionDuration || (session.endTime && session.startTime
    ? (new Date(session.endTime) - new Date(session.startTime)) / 1000 : 0);

  const summaryY = doc.y;
  const summaryW = CONTENT_W * 0.6;

  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR.text)
    .text('Session Summary', M, summaryY);
  doc.moveDown(0.4);

  const rows = [
    ['Candidate', user?.name],
    ['Email', user?.email],
    ['Domain', domainName],
    ['Difficulty', (session.difficulty || 'medium').replace(/^./, c => c.toUpperCase())],
    ['Questions', `${correct}/${total} correct`],
    ['Duration', fmtDuration(duration)],
    ['Date', fmtDate(session.createdAt || session.startTime)]
  ];
  let kvY = doc.y;
  rows.forEach(([k, v]) => {
    kvRow(doc, M, kvY, summaryW, k, v);
    kvY += 17;
  });

  // Right column: score ring
  scoreRing(doc, PAGE_W - M - 70, summaryY + 70, 50, overall, ovColor);

  doc.y = Math.max(kvY, summaryY + 160);
  doc.x = M;

  // ============ Three headline score cards ============
  doc.moveDown(0.4);
  ensureSpace(doc, 100);
  const cardsY = doc.y;
  const cardW = (CONTENT_W - 20) / 3;
  scoreCard(doc, M,                      cardsY, cardW, 80, 'Technical accuracy', feedback?.technicalScore,    COLOR.green);
  scoreCard(doc, M + cardW + 10,         cardsY, cardW, 80, 'Voice analysis',     feedback?.voiceScore,        COLOR.primary);
  scoreCard(doc, M + (cardW + 10) * 2,   cardsY, cardW, 80, 'Body language',      feedback?.bodyLanguageScore, COLOR.orange);
  doc.y = cardsY + 92;
  doc.x = M;

  // ============ Voice metrics ============
  ensureSpace(doc, 120);
  sectionTitle(doc, 'Voice metrics');
  const vm = session.voiceMetrics || {};
  metricRow(doc, 'Filler words',       vm.fillerWords,    COLOR.yellow);
  metricRow(doc, 'Pacing',             vm.pacing,         COLOR.green);
  metricRow(doc, 'Clarity',            vm.clarity,        COLOR.red);
  metricRow(doc, 'Tone & confidence',  vm.toneConfidence, COLOR.primary);

  // ============ Body language metrics ============
  ensureSpace(doc, 120);
  sectionTitle(doc, 'Body language metrics');
  const bm = session.bodyMetrics || {};
  metricRow(doc, 'Eye contact',        bm.eyeContact,     COLOR.green);
  metricRow(doc, 'Facial sentiment',   bm.facialSentiment,COLOR.yellow);
  metricRow(doc, 'Fidgeting',          bm.fidgeting,      COLOR.red);
  metricRow(doc, 'Posture',            bm.posture,        COLOR.green);

  // ============ Coach suggestions ============
  const tips = (session.tips && session.tips.length
    ? session.tips
    : (feedback?.suggestion || '').split('\n').filter(Boolean));

  if (tips.length) {
    ensureSpace(doc, 80);
    sectionTitle(doc, 'Coach suggestions');
    doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
    tips.forEach((t) => {
      ensureSpace(doc, 28);
      const y = doc.y;
      doc.fillColor(COLOR.primary).font('Helvetica-Bold').fontSize(11).text('•', M, y - 1);
      doc.fillColor(COLOR.text).font('Helvetica').fontSize(10)
        .text(t, M + 14, y, { width: CONTENT_W - 14 });
      doc.x = M;
      doc.moveDown(0.25);
    });
  }

  // ============ Per-question breakdown ============
  if (session.turns && session.turns.length) {
    doc.addPage();
    doc.x = M;
    doc.y = M;

    doc.rect(0, 0, PAGE_W, 60).fill(COLOR.navy);
    doc.fillColor(COLOR.white).font('Helvetica-Bold').fontSize(16)
      .text('Question-by-question', M, 22);
    doc.fillColor('#9BA4C2').font('Helvetica').fontSize(9)
      .text(`${total} questions · ${correct} correct`, PAGE_W - M - 200, 28, { width: 200, align: 'right' });

    doc.fillColor(COLOR.text);
    doc.y = 80;
    doc.x = M;

    session.turns.forEach((t, i) => {
      ensureSpace(doc, 140);

      // Header row: Q# + status pill on first line, then question text below it.
      const headerY = doc.y;
      const qNumColor = t.correct === true ? COLOR.green : t.correct === false ? COLOR.red : COLOR.primary;
      doc.font('Helvetica-Bold').fontSize(12).fillColor(qNumColor)
        .text(`Q${i + 1}`, M, headerY, { width: 40, lineBreak: false });

      if (t.correct === true) {
        pillBadge(doc, M + 36, headerY + 1, 'Correct', COLOR.green, COLOR.greenSoft);
      } else if (t.correct === false) {
        pillBadge(doc, M + 36, headerY + 1, 'Incorrect', COLOR.red, COLOR.redSoft);
      }

      // Question text on its own block, full width — guarantees no overlap with the pill.
      doc.x = M;
      doc.y = headerY + 20;
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR.text)
        .text(t.question || '—', M, doc.y, { width: CONTENT_W });

      doc.x = M;
      doc.moveDown(0.3);

      // Transcript — italic, indented, muted
      if (t.transcript) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLOR.subtext)
          .text(`"${t.transcript}"`, M + 16, doc.y, { width: CONTENT_W - 16 });
        doc.x = M;
        doc.moveDown(0.4);
      }

      // Score row (compact, 4 columns) — explicit y management
      const rowY = doc.y;
      const cells = [
        ['Technical',  t.technicalScore,  COLOR.green],
        ['Clarity',    t.clarityScore,    COLOR.yellow],
        ['Confidence', t.confidenceScore, COLOR.primary],
        ['Eye contact',t.eyeContactPct,   COLOR.orange]
      ];
      const colW = CONTENT_W / cells.length;
      cells.forEach(([label, val, color], idx) => {
        const cx = M + colW * idx;
        doc.font('Helvetica').fontSize(8).fillColor(COLOR.muted)
          .text(label.toUpperCase(), cx, rowY, { width: colW - 8, characterSpacing: 0.4, lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(14).fillColor(color)
          .text(`${pct(val)}%`, cx, rowY + 12, { width: colW - 8, lineBreak: false });
      });
      doc.x = M;
      doc.y = rowY + 34;

      // Suggestion
      if (t.suggestion) {
        doc.font('Helvetica').fontSize(9).fillColor(COLOR.subtext)
          .text(`Suggestion: ${t.suggestion}`, M + 16, doc.y, { width: CONTENT_W - 16 });
        doc.x = M;
        doc.moveDown(0.3);
      }

      // Divider between questions (skip after the last one)
      if (i < session.turns.length - 1) {
        doc.moveDown(0.2);
        doc.moveTo(M, doc.y).lineTo(PAGE_W - M, doc.y)
          .strokeColor(COLOR.divider).lineWidth(0.4).stroke();
        doc.moveDown(0.5);
      }
    });
  }

  // ============ Footer on every page ============
  // Writing text below the page's bottom margin makes PDFKit auto-paginate,
  // which produces empty trailing pages. Temporarily clear the bottom margin
  // for each footer write, then restore it.
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const origBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.muted)
      .text(
        `SmartPrep AI · Confidential · Page ${i - range.start + 1} of ${range.count}`,
        M, PAGE_H - 30,
        { width: CONTENT_W, align: 'center', lineBreak: false }
      );
    doc.page.margins.bottom = origBottom;
  }

  return doc;
}
