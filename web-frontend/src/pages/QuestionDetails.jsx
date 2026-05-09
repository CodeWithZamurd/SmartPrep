import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function QuestionDetails() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get(`/sessions/${sessionId}`).then((r) => setSession(r.data.session));
  }, [sessionId]);

  if (!session) return <PhoneLayout><p className="center mt-xl">Loading…</p></PhoneLayout>;
  const turn = session.turns[idx] || {};
  const total = session.turns.length;

  return (
    <PhoneLayout hideTabs>
      <Brand />
      <h1 className="title center">Question Details</h1>

      <div className="card card-alt">
        <p className="center" style={{ fontWeight: 700 }}>
          Question no <span style={{ color: 'var(--primary)' }}>{idx + 1}</span> of {total}
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 999,
            background: turn.correct ? 'var(--green-dark)' : 'var(--danger)',
            margin: '0 auto',
            fontWeight: 900
          }}
        >
          {turn.correct ? 'Correct' : 'Incorrect'}
        </div>
        <p className="center mt-md">{turn.question}</p>
        <div style={{ background: '#fff', color: '#222', borderRadius: 12, padding: 12, minHeight: 80 }}>
          {turn.transcript || 'No answer recorded.'}
        </div>
        <h4 className="center" style={{ color: 'var(--primary)', marginTop: 12 }}>AI Feedback</h4>
        <p className="subtitle center">
          {turn.suggestion ||
            (turn.correct ? "Your answer is correct. You've correctly identified the distinction." : 'Review the relevant fundamentals and try to be more precise.')}
        </p>
      </div>

      <div className="btn-row mt-md">
        <button className="btn secondary" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
          ◀ Prev
        </button>
        <button className="btn secondary" disabled={idx >= total - 1} onClick={() => setIdx((i) => i + 1)}>
          Next ▶
        </button>
      </div>
      <button className="btn mt-md" onClick={() => nav(-1)}>Back to Feedback</button>
    </PhoneLayout>
  );
}
