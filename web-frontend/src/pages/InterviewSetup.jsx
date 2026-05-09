import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

function Toggle({ value, onChange }) {
  return (
    <label style={{ position: 'relative', width: 50, height: 28, display: 'inline-block' }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
      <span style={{ position: 'absolute', inset: 0, background: value ? 'var(--danger)' : 'var(--card)', borderRadius: 999 }} />
      <span style={{ position: 'absolute', left: value ? 24 : 2, top: 2, width: 24, height: 24, borderRadius: 12, background: '#fff' }} />
    </label>
  );
}

export default function InterviewSetup() {
  const nav = useNavigate();
  const { state } = useLocation();
  const domain = state?.domain;
  const [textInput, setText] = useState(true);
  const [voiceInput, setVoice] = useState(false); // voice less practical on web by default
  const [webcam, setWebcam] = useState(false);
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!domain) return alert('No domain selected.');
    setLoading(true);
    try {
      const { data } = await api.post('/sessions', {
        domain: domain.slug || domain._id,
        difficulty: 'medium',
        targetQuestions: 15,
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
    <PhoneLayout>
      <Brand />
      <h1 className="title">Interview Setup</h1>

      <div className="card card-alt" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🖱</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Allow text input for answers</div>
          <div className="muted" style={{ fontSize: 12 }}>Type your responses</div>
        </div>
        <Toggle value={textInput} onChange={setText} />
      </div>

      <h3 style={{ marginTop: 16 }}>Input Preferences</h3>
      <div className="card card-alt" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🗣</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Allow voice input for answers</div>
          <div className="muted" style={{ fontSize: 12 }}>Speak your responses</div>
        </div>
        <Toggle value={voiceInput} onChange={setVoice} />
      </div>

      <div className="card card-alt" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>📷</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Enable WebCam</div>
          <div className="muted" style={{ fontSize: 12 }}>Record video for body language analysis (Optional)</div>
        </div>
        <Toggle value={webcam} onChange={setWebcam} />
      </div>

      <button className="btn mt-lg" onClick={start} disabled={loading}>
        {loading ? 'Starting…' : '▶ Begin Interview'}
      </button>
    </PhoneLayout>
  );
}
