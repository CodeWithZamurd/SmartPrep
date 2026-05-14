import { useEffect, useRef, useState } from 'react';
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
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoStreamReady, setVideoStreamReady] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [busy, setBusy] = useState(false);

  const audioRecRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRecRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoEl = useRef(null);
  const videoStreamRef = useRef(null);

  const isLast = index + 1 >= total;
  const progress = ((index + 1) / total) * 100;

  if (!sessionId) {
    nav('/interview', { replace: true });
    return null;
  }

  // ----- Webcam stream setup (only when webcam enabled) -----
  useEffect(() => {
    if (!mode.webcam) return;

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoStreamRef.current = stream;
        if (videoEl.current) {
          videoEl.current.srcObject = stream;
          videoEl.current.play().catch(() => {});
        }
        setVideoStreamReady(true);
      } catch (e) {
        setVideoError(e.message || 'Camera permission denied');
      }
    })();

    return () => {
      cancelled = true;
      if (videoRecRef.current && videoRecRef.current.state !== 'inactive') {
        try { videoRecRef.current.stop(); } catch (_) {}
      }
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
    };
  }, [mode.webcam]);

  // Auto-start a fresh video recording for each turn
  useEffect(() => {
    if (!mode.webcam || !videoStreamReady) return;
    startVideoRecording();
    return () => {
      if (videoRecRef.current && videoRecRef.current.state === 'recording') {
        try { videoRecRef.current.stop(); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, videoStreamReady, mode.webcam]);

  function startVideoRecording() {
    if (!videoStreamRef.current) return;
    try {
      videoChunksRef.current = [];
      const rec = new MediaRecorder(videoStreamRef.current, { mimeType: 'video/webm' });
      rec.ondataavailable = (e) => e.data.size > 0 && videoChunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
      };
      rec.start();
      videoRecRef.current = rec;
    } catch (e) {
      // Some browsers may not support video/webm — fallback silently
    }
  }

  async function stopVideoAndGrabFrame() {
    let frameBlob = null;
    if (videoEl.current && videoEl.current.readyState >= 2) {
      const v = videoEl.current;
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth || 640;
      canvas.height = v.videoHeight || 480;
      canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
      frameBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    }
    if (videoRecRef.current && videoRecRef.current.state === 'recording') {
      await new Promise((resolve) => {
        const rec = videoRecRef.current;
        const prev = rec.onstop;
        rec.onstop = (e) => {
          prev?.(e);
          resolve();
        };
        try { rec.stop(); } catch (_) { resolve(); }
      });
    }
    return frameBlob;
  }

  // ----- Audio recording (voice answer) -----
  async function startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      audioRecRef.current = rec;
      setAudioRecording(true);
    } catch (e) {
      alert('Mic permission denied');
    }
  }

  function stopAudioRecording() {
    audioRecRef.current?.stop();
    setAudioRecording(false);
  }

  // ----- Submit -----
  async function submit() {
    if (!text && !audioBlob) return alert('Type or record an answer first.');
    setBusy(true);
    try {
      let frameBlob = null;
      let finalVideoBlob = null;
      if (mode.webcam && videoStreamReady) {
        frameBlob = await stopVideoAndGrabFrame();
        finalVideoBlob = videoBlob; // set by onstop
      }

      const form = new FormData();
      if (audioBlob) form.append('audio', audioBlob, 'answer.webm');
      if (text) form.append('textFallback', text);
      if (frameBlob) form.append('frame', frameBlob, 'frame.jpg');
      if (finalVideoBlob) form.append('video', finalVideoBlob, 'answer.webm');

      const { data } = await api.post(`/sessions/${sessionId}/answer`, form);
      if (data.done) {
        nav(`/feedback/${sessionId}`);
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setText('');
        setAudioBlob(null);
        setVideoBlob(null);
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
      if (videoRecRef.current && videoRecRef.current.state === 'recording') videoRecRef.current.stop();
      if (videoStreamRef.current) videoStreamRef.current.getTracks().forEach((t) => t.stop());
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
              {audioRecording ? (
                <button className="btn block danger mt-sm" onClick={stopAudioRecording}>
                  ⏹ Stop recording
                </button>
              ) : audioBlob ? (
                <>
                  <button className="btn block outline mt-sm" onClick={startAudioRecording}>
                    🎤 Re-record
                  </button>
                  <p style={{ color: 'var(--green)', fontSize: 13, marginTop: 8 }}>✓ Voice recorded</p>
                </>
              ) : (
                <button className="btn block outline mt-sm" onClick={startAudioRecording}>
                  🎤 Record voice
                </button>
              )}
            </div>
          )}

          <button className="btn block lg mt-md" onClick={submit} disabled={busy}>
            {busy ? 'Analyzing…' : isLast ? 'Finish interview ✓' : 'Submit & next →'}
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {mode.webcam ? (
            <div style={{ position: 'relative', background: '#000', aspectRatio: '4 / 3' }}>
              <video
                ref={videoEl}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              {videoError ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, textAlign: 'center' }}>
                  <p style={{ color: '#fff' }}>{videoError}</p>
                </div>
              ) : !videoStreamReady ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="muted">Starting camera…</p>
                </div>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(255,92,92,0.85)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '4px 10px',
                    borderRadius: 4
                  }}
                >
                  ● REC
                </div>
              )}
            </div>
          ) : (
            <div className="center" style={{ padding: 40 }}>
              <div style={{ fontSize: 96 }}>🤖</div>
              <h3 className="mt-md">Your AI interviewer</h3>
              <p className="subtitle mt-sm">
                Take your time — answer technically and clearly. The follow-ups adapt to your answer.
              </p>
              {audioRecording && (
                <p className="mt-md" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                  🔴 Recording in progress…
                </p>
              )}
            </div>
          )}
          {mode.webcam && (
            <div style={{ padding: 14 }}>
              <p className="muted" style={{ fontSize: 12 }}>
                Body language is sampled from a frame at the moment you submit your answer.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
