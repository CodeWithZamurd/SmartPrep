import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import { api } from '../api.js';

function MetricRow({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((m) => (
        <div key={m.label} style={{ flex: '1 1 45%' }}>
          <div style={{ color: m.color, fontSize: 12, fontWeight: 700 }}>{m.label}</div>
          <div style={{ fontWeight: 700 }}>{m.value}/100</div>
        </div>
      ))}
    </div>
  );
}

function ScoreCard({ icon, title, score, color = 'var(--green)', children }) {
  return (
    <div className="card card-alt">
      <div className="between">
        <span style={{ fontWeight: 900 }}>
          {icon} {title}
        </span>
        <span style={{ color, fontWeight: 900 }}>{score}%</span>
      </div>
      <div className="muted">Score:</div>
      <div className="card mt-md">{children}</div>
    </div>
  );
}

export default function Feedback() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/feedback/session/${sessionId}`).then((r) => setData(r.data)).catch(() => {});
  }, [sessionId]);

  if (!data) {
    return (
      <PhoneLayout>
        <p className="center mt-xl">Loading…</p>
      </PhoneLayout>
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
    <PhoneLayout>
      <Brand />
      <h1 className="title">AI Interview Feedback</h1>

      {tab === 'overview' && (
        <>
          <p className="subtitle">Here's a complete feedback of your interview</p>
          <p>
            <span style={{ fontWeight: 700 }}>Category: </span>
            <span style={{ color: 'var(--star)', fontWeight: 900 }}>
              {session.domain?.name || session.domainSlug}
            </span>
          </p>
          <h3>Overall Performance</h3>
          <div className="center"><ProgressRing value={overall} label={verdict} /></div>

          <h3>Detailed Feedback</h3>
          <ScoreCard icon="📈" title="Technical Accuracy" score={feedback.technicalScore || 0}>
            <div>
              Question Correct:{' '}
              <span style={{ color: 'var(--green)', fontWeight: 900 }}>{correct}/{total}</span>
            </div>
          </ScoreCard>
          <ScoreCard icon="🎤" title="Voice Analysis" score={feedback.voiceScore || 0}>
            <MetricRow
              items={[
                { label: 'Filler Words', value: session.voiceMetrics?.fillerWords ?? 0, color: 'var(--yellow)' },
                { label: 'Pacing', value: session.voiceMetrics?.pacing ?? 0, color: 'var(--green)' },
                { label: 'Clarity', value: session.voiceMetrics?.clarity ?? 0, color: 'var(--red)' },
                { label: 'Tone and Confidence', value: session.voiceMetrics?.toneConfidence ?? 0, color: 'var(--green)' }
              ]}
            />
          </ScoreCard>
          <p className="link" onClick={() => setTab('detailed')} style={{ textAlign: 'right' }}>
            See Detailed →
          </p>
        </>
      )}

      {tab === 'detailed' && (
        <>
          <h3>Detailed Feedback</h3>
          <ScoreCard icon="📈" title="Technical Accuracy" score={feedback.technicalScore || 0}>
            <div>
              Question Correct:{' '}
              <span style={{ color: 'var(--green)', fontWeight: 900 }}>{correct}/{total}</span>
            </div>
          </ScoreCard>
          <ScoreCard icon="🎤" title="Voice Analysis" score={feedback.voiceScore || 0}>
            <MetricRow
              items={[
                { label: 'Filler Words', value: session.voiceMetrics?.fillerWords ?? 0, color: 'var(--yellow)' },
                { label: 'Pacing', value: session.voiceMetrics?.pacing ?? 0, color: 'var(--green)' },
                { label: 'Clarity', value: session.voiceMetrics?.clarity ?? 0, color: 'var(--red)' },
                { label: 'Tone and Confidence', value: session.voiceMetrics?.toneConfidence ?? 0, color: 'var(--green)' }
              ]}
            />
          </ScoreCard>
          <ScoreCard icon="🧍" title="Body Language Analysis" score={feedback.bodyLanguageScore || 0}>
            <MetricRow
              items={[
                { label: 'Eye Contact', value: session.bodyMetrics?.eyeContact ?? 0, color: 'var(--green)' },
                { label: 'Facial Sentiment', value: session.bodyMetrics?.facialSentiment ?? 0, color: 'var(--yellow)' },
                { label: 'Fidgeting Detection', value: session.bodyMetrics?.fidgeting ?? 0, color: 'var(--red)' },
                { label: 'Posture', value: session.bodyMetrics?.posture ?? 0, color: 'var(--green)' }
              ]}
            />
          </ScoreCard>
          <p className="link" onClick={() => nav(`/question-details/${sessionId}`)} style={{ textAlign: 'right' }}>
            See Question Details →
          </p>
          <div className="btn-row mt-lg">
            <button className="btn" onClick={() => nav(`/suggestions/${sessionId}`)}>See Suggestions</button>
            <button className="btn outline" onClick={downloadReport}>Download Report</button>
          </div>
        </>
      )}
    </PhoneLayout>
  );
}
