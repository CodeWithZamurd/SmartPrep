import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

function Section({ title, body, suggestion }) {
  return (
    <div className="card card-alt">
      <h3 className="center" style={{ margin: 0 }}>{title}</h3>
      <p className="subtitle center">{body}</p>
      {suggestion && (
        <>
          <h4 className="center" style={{ color: 'var(--primary)', margin: 0 }}>Suggestion:</h4>
          <p className="center" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{suggestion}</p>
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

  if (!session) return <PhoneLayout><p className="center mt-xl">Loading…</p></PhoneLayout>;
  const s = session.suggestions || {};

  return (
    <PhoneLayout hideTabs>
      <Brand />
      <h1 className="title center">AI Personalized Suggestions</h1>
      <Section
        title="Technical Focus"
        body={`Your accuracy was ${session.overallTechnical || 0}%.`}
        suggestion={s.technical || 'Review fundamentals and edge cases on the categories you missed.'}
      />
      <Section
        title="Voice Analysis"
        body={`Voice score: ${session.overallVoice || 0}%.`}
        suggestion={s.voice || 'Practice short pauses instead of filler words.'}
      />
      <Section
        title="Body Language Analysis"
        body={`Body language score: ${session.overallBodyLanguage || 0}%.`}
        suggestion={s.bodyLanguage || 'Maintain steady eye contact and relaxed posture.'}
      />
      <button className="btn mt-md" onClick={() => nav(-1)}>Back to Feedback</button>
    </PhoneLayout>
  );
}
