import PDFDocument from 'pdfkit';

// SmartPrep brand colors (kept close to the app theme)
const COLOR = {
  navy: '#0A1331',
  panel: '#1A2548',
  primary: '#5AC8FA',
  text: '#FFFFFF',
  muted: '#9BA4C2',
  green: '#4ADE80',
  yellow: '#FACC15',
  red: '#F87171',
  orange: '#FB923C',
  divider: '#2A3458'
};

function pct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function verdictFor(overall) {
  if (overall >= 75) return 'Strong Candidate';
  if (overall >= 60) return 'Promising';
  return 'Needs Practice';
}

function fmtDate(d) {
  if (!d) return '';
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
  doc.roundedRect(x, y, width, 8, 4).fill(COLOR.divider);
  doc.roundedRect(x, y, (width * v) / 100, 8, 4).fill(color);
  doc.restore();
}

function sectionTitle(doc, text) {
  doc.moveDown(0.6);
  doc.fillColor(COLOR.primary).font('Helvetica-Bold').fontSize(14).text(text);
  doc.moveTo(doc.page.margins.left, doc.y + 2)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
    .strokeColor(COLOR.divider)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.6);
}

function metricRow(doc, label, value, color) {
  const startX = doc.page.margins.left;
  const innerW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  doc.fillColor(COLOR.text).font('Helvetica').fontSize(10).text(label, startX, doc.y, { width: innerW * 0.55, continued: false });
  const lineY = doc.y - 12;
  doc.fillColor(color).font('Helvetica-Bold').fontSize(10).text(`${pct(value)}/100`, startX + innerW * 0.6, lineY, { width: innerW * 0.4, align: 'right' });
  bar(doc, startX + innerW * 0.55, lineY + 4, innerW * 0.4 - 50, value, color);
  doc.moveDown(0.4);
}

function scoreCard(doc, x, y, w, h, label, value, color) {
  doc.save();
  doc.roundedRect(x, y, w, h, 8).fill(COLOR.panel);
  doc.fillColor(COLOR.muted).font('Helvetica').fontSize(9).text(label, x + 12, y + 10, { width: w - 24 });
  doc.fillColor(color).font('Helvetica-Bold').fontSize(28).text(`${pct(value)}%`, x + 12, y + 26, { width: w - 24 });
  bar(doc, x + 12, y + h - 18, w - 24, value, color);
  doc.restore();
}

export function buildSessionReportPdf({ session, feedback, user }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, info: {
    Title: `SmartPrep Interview Report — ${session?.domainSlug || ''}`,
    Author: 'SmartPrep AI',
    Subject: 'AI mock-interview performance report'
  }});

  // ---------- Cover header ----------
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  doc.rect(0, 0, pageW, 110).fill(COLOR.navy);
  doc.fillColor(COLOR.primary).font('Helvetica-Bold').fontSize(28).text('SmartPrep', 40, 36);
  doc.fillColor(COLOR.text).font('Helvetica').fontSize(11).text('AI Mock-Interview Report', 40, 70);
  doc.fillColor(COLOR.muted).font('Helvetica').fontSize(9).text(fmtDate(new Date()), pageW - 200, 40, { width: 160, align: 'right' });

  doc.fillColor(COLOR.text);
  doc.y = 130;

  // ---------- Candidate + session meta ----------
  const domainName = (session.domain && session.domain.name) || session.domainSlug || 'General';
  const overall = pct(session.overallScore);
  const verdict = verdictFor(overall);
  const correct = (session.turns || []).filter((t) => t.correct).length;
  const total = (session.turns || []).length || session.targetQuestions || 0;
  const duration = session.sessionDuration || (session.endTime && session.startTime
    ? (new Date(session.endTime) - new Date(session.startTime)) / 1000 : 0);

  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR.text).text('Session Summary');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor(COLOR.muted);
  const metaLines = [
    ['Candidate', user?.name || '—'],
    ['Email', user?.email || '—'],
    ['Domain', domainName],
    ['Difficulty', (session.difficulty || 'medium').replace(/^./, c => c.toUpperCase())],
    ['Questions', `${correct}/${total} correct`],
    ['Duration', fmtDuration(duration)],
    ['Date', fmtDate(session.createdAt || session.startTime)]
  ];
  metaLines.forEach(([k, v]) => {
    const y = doc.y;
    doc.fillColor(COLOR.muted).text(k, 40, y, { width: 110 });
    doc.fillColor(COLOR.text).text(String(v), 150, y);
    doc.moveDown(0.2);
  });

  // ---------- Big overall score band ----------
  doc.moveDown(0.8);
  const overallY = doc.y;
  doc.roundedRect(40, overallY, pageW - 80, 78, 10).fill(COLOR.panel);
  doc.fillColor(COLOR.muted).font('Helvetica').fontSize(10).text('Overall Performance', 56, overallY + 12);
  const overallColor = overall >= 75 ? COLOR.green : overall >= 60 ? COLOR.yellow : COLOR.red;
  doc.fillColor(overallColor).font('Helvetica-Bold').fontSize(36).text(`${overall}%`, 56, overallY + 28);
  doc.fillColor(COLOR.text).font('Helvetica-Bold').fontSize(14).text(verdict, 56 + 110, overallY + 38);
  bar(doc, 56, overallY + 60, pageW - 112, overall, overallColor);
  doc.y = overallY + 90;

  // ---------- Three-up score cards ----------
  doc.moveDown(0.4);
  const cardsY = doc.y;
  const cardW = (pageW - 80 - 20) / 3;
  scoreCard(doc, 40,                        cardsY, cardW, 80, 'Technical Accuracy', feedback?.technicalScore, COLOR.green);
  scoreCard(doc, 40 + cardW + 10,           cardsY, cardW, 80, 'Voice Analysis',     feedback?.voiceScore,     COLOR.primary);
  scoreCard(doc, 40 + (cardW + 10) * 2,     cardsY, cardW, 80, 'Body Language',      feedback?.bodyLanguageScore, COLOR.orange);
  doc.y = cardsY + 92;

  // ---------- Voice metrics ----------
  sectionTitle(doc, 'Voice metrics');
  const vm = session.voiceMetrics || {};
  metricRow(doc, 'Filler words',       vm.fillerWords,    COLOR.yellow);
  metricRow(doc, 'Pacing',             vm.pacing,         COLOR.green);
  metricRow(doc, 'Clarity',            vm.clarity,        COLOR.red);
  metricRow(doc, 'Tone & confidence',  vm.toneConfidence, COLOR.green);

  // ---------- Body metrics ----------
  sectionTitle(doc, 'Body language metrics');
  const bm = session.bodyMetrics || {};
  metricRow(doc, 'Eye contact',        bm.eyeContact,     COLOR.green);
  metricRow(doc, 'Facial sentiment',   bm.facialSentiment,COLOR.yellow);
  metricRow(doc, 'Fidgeting',          bm.fidgeting,      COLOR.red);
  metricRow(doc, 'Posture',            bm.posture,        COLOR.green);

  // ---------- Suggestions / tips ----------
  if ((session.tips && session.tips.length) || feedback?.suggestion) {
    sectionTitle(doc, 'Coach suggestions');
    doc.font('Helvetica').fontSize(10).fillColor(COLOR.text);
    const tips = session.tips && session.tips.length
      ? session.tips
      : (feedback.suggestion || '').split('\n').filter(Boolean);
    tips.forEach((t) => {
      doc.fillColor(COLOR.primary).text('•  ', { continued: true });
      doc.fillColor(COLOR.text).text(t);
      doc.moveDown(0.15);
    });
  }

  // ---------- Per-question breakdown ----------
  if (session.turns && session.turns.length) {
    doc.addPage();
    doc.rect(0, 0, pageW, 60).fill(COLOR.navy);
    doc.fillColor(COLOR.primary).font('Helvetica-Bold').fontSize(18).text('Question-by-question', 40, 22);
    doc.fillColor(COLOR.text);
    doc.y = 80;

    session.turns.forEach((t, i) => {
      if (doc.y > pageH - 140) doc.addPage();
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR.primary)
        .text(`Q${i + 1}.`, 40, doc.y, { continued: true })
        .fillColor(COLOR.text).text(` ${t.question || ''}`);
      doc.moveDown(0.2);

      if (t.transcript) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLOR.muted).text(`"${t.transcript}"`, { indent: 12 });
        doc.moveDown(0.2);
      }

      doc.font('Helvetica').fontSize(9).fillColor(COLOR.text);
      const cells = [
        ['Technical', t.technicalScore, COLOR.green],
        ['Clarity',   t.clarityScore,   COLOR.yellow],
        ['Confidence',t.confidenceScore,COLOR.primary],
        ['Eye contact', t.eyeContactPct, COLOR.orange]
      ];
      const rowY = doc.y;
      const colW = (pageW - 80) / cells.length;
      cells.forEach(([label, val, color], idx) => {
        const x = 40 + colW * idx;
        doc.fillColor(COLOR.muted).text(label, x, rowY, { width: colW - 10 });
        doc.fillColor(color).font('Helvetica-Bold').text(`${pct(val)}%`, x, rowY + 12);
        doc.font('Helvetica');
      });
      doc.y = rowY + 32;

      if (t.suggestion) {
        doc.font('Helvetica').fontSize(9).fillColor(COLOR.muted).text(`Suggestion: ${t.suggestion}`, { indent: 12 });
      }
      doc.moveDown(0.6);
      doc.moveTo(40, doc.y).lineTo(pageW - 40, doc.y).strokeColor(COLOR.divider).lineWidth(0.4).stroke();
      doc.moveDown(0.4);
    });
  }

  // ---------- Footer on every page ----------
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.muted).text(
      `SmartPrep AI · Confidential · Page ${i - range.start + 1} of ${range.count}`,
      40, pageH - 30,
      { width: pageW - 80, align: 'center' }
    );
  }

  return doc;
}
