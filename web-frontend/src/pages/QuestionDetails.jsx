import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function QuestionDetails() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get(`/sessions/${sessionId}`).then((r) => setSession(r.data.session));
  }, [sessionId]);

  if (!session) {
    return (
      <AppLayout narrow>
        <p className="center mt-xl">Loading…</p>
      </AppLayout>
    );
  }

  const turn = session.turns[idx] || {};
  const total = session.turns.length;

  return (
    <AppLayout>
      <p className="link-muted" onClick={() => nav(-1)}>← Back to feedback</p>
      <h1 className="mt-sm">Question Details</h1>
      <p className="subtitle mt-sm">Review each answer alongside the AI feedback.</p>

      <div className="grid-2 mt-lg" style={{ gridTemplateColumns: '240px 1fr', alignItems: 'start' }}>
        <aside className="card">
          <h3>Questions</h3>
          <div className="flex-col gap-sm mt-md">
            {session.turns.map((t, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={'chip' + (idx === i ? ' active' : '')}
                style={{ textAlign: 'left', padding: '8px 12px' }}
              >
                <span className="muted" style={{ marginRight: 6 }}>Q{i + 1}</span>
                <span className={'badge ' + (t.correct ? 'green' : 'red')} style={{ fontSize: 10 }}>
                  {t.correct ? '✓' : '✗'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section>
          <div className="card">
            <div className="between">
              <h2>Question {idx + 1} of {total}</h2>
              <span className={'badge ' + (turn.correct ? 'green' : 'red')}>
                {turn.correct ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p className="mt-md">{turn.question}</p>

            <h4 className="mt-lg" style={{ color: 'var(--primary)' }}>Your answer</h4>
            <div className="card alt tight mt-sm">
              <p>{turn.transcript || 'No answer recorded.'}</p>
            </div>

            <h4 className="mt-lg" style={{ color: 'var(--primary)' }}>AI Feedback</h4>
            <p className="subtitle mt-sm">
              {turn.suggestion ||
                (turn.correct
                  ? "Your answer is correct. You've identified the key distinctions clearly."
                  : 'Review the relevant fundamentals and try to be more precise next time.')}
            </p>

            <div className="btn-row mt-lg">
              <button className="btn secondary" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
                ◀ Previous
              </button>
              <button className="btn secondary" disabled={idx >= total - 1} onClick={() => setIdx((i) => i + 1)}>
                Next ▶
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
