import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

function Toggle({ value, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      <span className="slider" />
      <span className="knob" />
    </label>
  );
}

function Row({ icon, title, desc, value, onChange }) {
  return (
    <div className="between" style={{ padding: '16px 0', borderBottom: '1px solid var(--divider)' }}>
      <div className="flex items-center gap-md">
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <div className="muted" style={{ fontSize: 13 }}>{desc}</div>
        </div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

export default function InterviewSetup() {
  const nav = useNavigate();
  const { state } = useLocation();
  const domain = state?.domain;
  const [textInput, setText] = useState(true);
  const [voiceInput, setVoice] = useState(true);
  const [webcam, setWebcam] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(15);
  const [loading, setLoading] = useState(false);

  if (!domain) {
    nav('/interview', { replace: true });
    return null;
  }

  async function start() {
    if (!textInput && !voiceInput && !webcam) {
      return alert('Enable at least one input method (text, voice, or webcam) to start.');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/sessions', {
        domain: domain.slug || domain._id,
        difficulty,
        targetQuestions: count,
        mode: { textInput, voiceInput, webcam }
      });
      nav('/interview/session', {
        state: {
          sessionId: data.sessionId,
          question: data.question,
          index: data.index,
          total: data.total,
          domain: data.domain,
          mode: { textInput, voiceInput, webcam }
        }
      });
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout narrow>
      <p className="link-muted" onClick={() => nav('/interview')}>← Back to domains</p>
      <h1 className="mt-sm">Interview Setup</h1>
      <p className="subtitle mt-sm">
        Configure how you'd like to take your <strong style={{ color: 'var(--primary)' }}>{domain.name}</strong> interview.
      </p>

      <div className="card mt-lg">
        <h3>Input options</h3>
        <Row icon="⌨️" title="Text input" desc="Type your responses." value={textInput} onChange={setText} />
        <Row icon="🗣" title="Voice input" desc="Speak your responses (mic required)." value={voiceInput} onChange={setVoice} />
        <Row icon="📷" title="WebCam" desc="Record video for body language analysis (optional)." value={webcam} onChange={setWebcam} />
      </div>

      <div className="card mt-lg">
        <h3>Interview parameters</h3>
        <label className="label">Starting difficulty</label>
        <div className="flex gap-sm">
          {['easy', 'medium', 'hard'].map((d) => (
            <button key={d} className={'chip' + (difficulty === d ? ' active' : '')} onClick={() => setDifficulty(d)}>
              {d}
            </button>
          ))}
        </div>
        <label className="label">Number of questions</label>
        <div className="flex gap-sm">
          {[5, 10, 15].map((n) => (
            <button key={n} className={'chip' + (count === n ? ' active' : '')} onClick={() => setCount(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button className="btn lg block mt-lg" onClick={start} disabled={loading}>
        {loading ? 'Starting interview…' : '▶ Begin Interview'}
      </button>
    </AppLayout>
  );
}
