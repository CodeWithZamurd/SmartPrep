import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

function Section({ icon, title, body, suggestion, color }) {
  return (
    <div className="card">
      <h3 style={{ color }}>{icon} {title}</h3>
      <p className="subtitle mt-sm">{body}</p>
      {suggestion && (
        <>
          <div className="divider" />
          <h4 style={{ color: 'var(--primary)' }}>Suggestion</h4>
          <p style={{ color: 'var(--primary)', fontStyle: 'italic', marginTop: 6 }}>{suggestion}</p>
        </>
      )}
    </div>
  );
}

export default function Suggestions() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);

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
  const s = session.suggestions || {};

  return (
    <AppLayout narrow>
      <p className="link-muted" onClick={() => nav(-1)}>← Back to feedback</p>
      <h1 className="mt-sm">AI Personalized Suggestions</h1>
      <p className="subtitle mt-sm">Targeted advice based on your interview performance.</p>

      <div className="flex-col gap-md mt-lg">
        <Section
          icon="📈"
          title="Technical Focus"
          body={`Your accuracy was ${session.overallTechnical || 0}%.`}
          suggestion={s.technical || 'Review fundamentals and edge cases on the categories you missed.'}
          color="var(--green)"
        />
        <Section
          icon="🎤"
          title="Voice Analysis"
          body={`Voice score: ${session.overallVoice || 0}%.`}
          suggestion={s.voice || 'Practice short pauses instead of filler words.'}
          color="var(--primary)"
        />
        <Section
          icon="🧍"
          title="Body Language Analysis"
          body={`Body language score: ${session.overallBodyLanguage || 0}%.`}
          suggestion={s.bodyLanguage || 'Maintain steady eye contact and relaxed posture.'}
          color="var(--orange)"
        />
      </div>
    </AppLayout>
  );
}
