import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import { api } from '../api.js';

function ScoreBox({ icon, title, score, color = 'var(--green)' }) {
  return (
    <div className="card">
      <div className="between">
        <h3>{icon} {title}</h3>
        <span style={{ color, fontWeight: 900, fontSize: 22 }}>{score}%</span>
      </div>
      <div className="progress-track mt-md">
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function MetricGrid({ items }) {
  return (
    <div className="grid-2 mt-md">
      {items.map((m) => (
        <div key={m.label} className="card alt tight">
          <div className="between">
            <span className="muted" style={{ fontSize: 13 }}>{m.label}</span>
            <span style={{ color: m.color, fontWeight: 700 }}>{m.value}/100</span>
          </div>
          <div className="progress-track mt-sm" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${m.value}%`, background: m.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/feedback/session/${sessionId}`).then((r) => setData(r.data)).catch(() => {});
  }, [sessionId]);

  if (!data) {
    return (
      <AppLayout narrow>
        <p className="center mt-xl">Loading feedback…</p>
      </AppLayout>
    );
  }

  const { feedback, session } = data;
  const overall = session.overallScore || 0;
  const correct = (session.turns || []).filter((t) => t.correct).length;
  const total = session.turns?.length || session.targetQuestions;
  const verdict = overall >= 75 ? 'Strong Candidate' : overall >= 60 ? 'Promising' : 'Needs Practice';

  async function downloadReport() {
    try {
      await api.post(`/reports/generate/${sessionId}`);
      alert('Report saved.');
    } catch (e) {}
  }

  return (
    <AppLayout>
      <div className="between">
        <div>
          <h1>AI Interview Feedback</h1>
          <p className="subtitle mt-sm">
            Category: <strong style={{ color: 'var(--star)' }}>{session.domain?.name || session.domainSlug}</strong>
          </p>
        </div>
        <div className="btn-row">
          <button className="btn secondary" onClick={() => nav(`/question-details/${sessionId}`)}>
            See question details
          </button>
          <button className="btn secondary" onClick={() => nav(`/suggestions/${sessionId}`)}>
            See suggestions
          </button>
          <button className="btn outline" onClick={downloadReport}>Download report</button>
        </div>
      </div>

      <div className="grid-2 mt-lg" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>
        <div className="card center">
          <h3>Overall Performance</h3>
          <div className="mt-lg" style={{ display: 'flex', justifyContent: 'center' }}>
            <ProgressRing value={overall} label={verdict} size={200} />
          </div>
          <p className="muted mt-md" style={{ fontSize: 13 }}>
            {correct}/{total} questions correct
          </p>
        </div>

        <div className="flex-col gap-md">
          <ScoreBox icon="📈" title="Technical Accuracy" score={feedback.technicalScore || 0} />
          <ScoreBox icon="🎤" title="Voice Analysis" score={feedback.voiceScore || 0} color="var(--primary)" />
          <ScoreBox icon="🧍" title="Body Language" score={feedback.bodyLanguageScore || 0} color="var(--orange)" />
        </div>
      </div>

      <h2 className="section-title mt-xl">Detailed metrics</h2>
      <div className="grid-2">
        <div className="card">
          <h3>🎤 Voice analysis</h3>
          <MetricGrid
            items={[
              { label: 'Filler Words', value: session.voiceMetrics?.fillerWords ?? 0, color: 'var(--yellow)' },
              { label: 'Pacing', value: session.voiceMetrics?.pacing ?? 0, color: 'var(--green)' },
              { label: 'Clarity', value: session.voiceMetrics?.clarity ?? 0, color: 'var(--red)' },
              { label: 'Tone & Confidence', value: session.voiceMetrics?.toneConfidence ?? 0, color: 'var(--green)' }
            ]}
          />
        </div>
        <div className="card">
          <h3>🧍 Body language</h3>
          <MetricGrid
            items={[
              { label: 'Eye Contact', value: session.bodyMetrics?.eyeContact ?? 0, color: 'var(--green)' },
              { label: 'Facial Sentiment', value: session.bodyMetrics?.facialSentiment ?? 0, color: 'var(--yellow)' },
              { label: 'Fidgeting', value: session.bodyMetrics?.fidgeting ?? 0, color: 'var(--red)' },
              { label: 'Posture', value: session.bodyMetrics?.posture ?? 0, color: 'var(--green)' }
            ]}
          />
        </div>
      </div>
    </AppLayout>
  );
}
