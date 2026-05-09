import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { PhoneLayout } from '../components/Layout.jsx';
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
    if (!sessionId) return;
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
    <PhoneLayout>
      <Brand />
      <h1 className="title">AI Interview</h1>
      <p>
        <span style={{ fontWeight: 700 }}>Category: </span>
        <span style={{ color: 'var(--star)', fontWeight: 900 }}>{domain?.name || 'General'}</span>
      </p>
      <p style={{ fontWeight: 700 }}>
        Question {index + 1} of {total}
      </p>

      <div className="card card-alt">
        <p style={{ margin: 0 }}>{question}</p>
      </div>

      <div className="center" style={{ fontSize: 64, margin: '12px 0' }}>
        🤖
        {recording && <div style={{ fontSize: 14, color: 'var(--danger)' }}>🔴 Recording…</div>}
      </div>

      {mode.textInput !== false && (
        <textarea
          className="textarea"
          placeholder="Type your answer……"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {mode.voiceInput !== false && (
        <div className="mt-md">
          {recording ? (
            <button className="btn danger" onClick={stopRecording}>⏹ Stop Recording</button>
          ) : recordedBlob ? (
            <>
              <button className="btn outline" onClick={startRecording}>🎤 Re-record</button>
              <p style={{ color: 'var(--green)', fontSize: 12, marginTop: 6 }}>✓ Voice recorded</p>
            </>
          ) : (
            <button className="btn outline" onClick={startRecording}>🎤 Record Voice</button>
          )}
        </div>
      )}

      <button className="btn mt-md" onClick={submit} disabled={busy}>
        {busy ? 'Analyzing…' : isLast ? 'End Interview' : 'Next Question'}
      </button>

      <p className="center mt-md" onClick={endSession} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
        End session
      </p>
    </PhoneLayout>
  );
}
