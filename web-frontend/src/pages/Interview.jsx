import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout.jsx';
import { api } from '../api.js';

export default function Interview() {
  const nav = useNavigate();
  const { state } = useLocation();
  const init = state || {};
  const [sessionId] = useState(init.sessionId);
  const [question, setQuestion] = useState(init.question || '');
  const [index, setIndex] = useState(init.index ?? 0);
  const [total] = useState(init.total ?? 15);
  const [domain] = useState(init.domain);
  const [mode] = useState(init.mode || { textInput: true, voiceInput: false, webcam: false });
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const isLast = index + 1 >= total;
  const progress = ((index + 1) / total) * 100;

  if (!sessionId) {
    nav('/interview', { replace: true });
    return null;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e) {
      alert('Mic permission denied');
    }
  }

  function stopRecording() {
    recRef.current?.stop();
    setRecording(false);
  }

  async function submit() {
    if (!text && !recordedBlob) return alert('Type or record an answer first.');
    setBusy(true);
    try {
      const form = new FormData();
      if (recordedBlob) form.append('audio', recordedBlob, 'answer.webm');
      if (text) form.append('textFallback', text);
      const { data } = await api.post(`/sessions/${sessionId}/answer`, form);
      if (data.done) {
        nav(`/feedback/${sessionId}`);
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setText('');
        setRecordedBlob(null);
      }
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function endSession() {
    if (!confirm('End interview? Your progress so far will be saved.')) return;
    try {
      await api.post(`/sessions/${sessionId}/abandon`);
    } catch (_) {}
    nav('/home');
  }

  return (
    <AppLayout narrow>
      <div className="between">
        <div>
          <p className="muted" style={{ fontSize: 13 }}>{domain?.name || 'General'}</p>
          <h1>Question {index + 1} of {total}</h1>
        </div>
        <button className="btn sm secondary" onClick={endSession}>End session</button>
      </div>
      <div className="progress-track mt-md">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card alt mt-lg">
        <p style={{ fontSize: 18, lineHeight: 1.5, margin: 0 }}>{question}</p>
      </div>

      <div className="grid-2 mt-lg" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'flex-start' }}>
        <div className="card">
          <h3>📝 Your answer</h3>
          {mode.textInput !== false && (
            <textarea
              className="textarea mt-sm"
              placeholder="Type your answer here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {mode.voiceInput !== false && (
            <div className="mt-md">
              <h4 className="muted" style={{ fontSize: 13 }}>OR RECORD VOICE</h4>
              {recording ? (
                <button className="btn block danger mt-sm" onClick={stopRecording}>
                  ⏹ Stop recording
                </button>
              ) : recordedBlob ? (
                <>
                  <button className="btn block outline mt-sm" onClick={startRecording}>
                    🎤 Re-record
                  </button>
                  <p style={{ color: 'var(--green)', fontSize: 13, marginTop: 8 }}>✓ Voice recorded</p>
                </>
              ) : (
                <button className="btn block outline mt-sm" onClick={startRecording}>
                  🎤 Record voice
                </button>
              )}
            </div>
          )}

          <button className="btn block lg mt-md" onClick={submit} disabled={busy}>
            {busy ? 'Analyzing…' : isLast ? 'Finish interview ✓' : 'Submit & next →'}
          </button>
        </div>

        <div className="card center" style={{ padding: '40px 20px' }}>
          <div style={{ fontSize: 96 }}>🤖</div>
          <h3 className="mt-md">Your AI interviewer</h3>
          <p className="subtitle mt-sm">
            Take your time — answer technically and clearly. The follow-ups adapt to your answer.
          </p>
          {recording && (
            <p className="mt-md" style={{ color: 'var(--danger)', fontWeight: 700 }}>
              🔴 Recording in progress…
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
