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
  const [mode] = useState(init.mode || { textInput: true, voiceInput: true, webcam: false });
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [permError, setPermError] = useState('');
  const [busy, setBusy] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  const useMic = mode.voiceInput !== false || mode.webcam === true;
  const useCam = mode.webcam === true;

  const streamRef = useRef(null);          // combined audio+video stream
  const recorderRef = useRef(null);        // MediaRecorder
  const chunksRef = useRef([]);            // recorded chunks
  const lastBlobRef = useRef(null);        // last recording blob (set on stop)
  const videoEl = useRef(null);

  const isLast = index + 1 >= total;
  const progress = ((index + 1) / total) * 100;

  if (!sessionId) {
    nav('/interview', { replace: true });
    return null;
  }

  // ---------- Acquire the media stream once on mount ----------
  useEffect(() => {
    if (!useMic && !useCam) return; // text-only — nothing to do
    let cancelled = false;
    (async () => {
      try {
        const constraints = {
          video: useCam ? { facingMode: 'user', width: 640, height: 480 } : false,
          audio: useMic ? true : false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (useCam && videoEl.current) {
          videoEl.current.srcObject = stream;
          videoEl.current.muted = true; // prevent feedback loop
          videoEl.current.play().catch(() => {});
        }
        setStreamReady(true);
      } catch (e) {
        setPermError(e.message || 'Camera/microphone permission denied');
      }
    })();

    return () => {
      cancelled = true;
      stopRecorder();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop any active recording when the question changes (e.g. after submit -> next).
  // Recording for the new question is started manually by the user via the Record button.
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        try { recorderRef.current.stop(); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function pickMimeType() {
    const candidates = useCam
      ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    for (const m of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(m)) return m;
    }
    return undefined;
  }

  function startRecorder() {
    if (!streamRef.current) return;
    if (recorderRef.current && recorderRef.current.state === 'recording') return;
    try {
      chunksRef.current = [];
      lastBlobRef.current = null;
      setHasRecording(false);
      const mimeType = pickMimeType();
      const rec = mimeType
        ? new MediaRecorder(streamRef.current, { mimeType })
        : new MediaRecorder(streamRef.current);
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || (useCam ? 'video/webm' : 'audio/webm') });
        lastBlobRef.current = blob;
        setHasRecording(true);
      };
      rec.start(1000); // gather data every second
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) {
      setPermError('Could not start recording: ' + e.message);
    }
  }

  function stopRecorder() {
    const rec = recorderRef.current;
    if (!rec) return Promise.resolve(null);
    if (rec.state === 'inactive') return Promise.resolve(lastBlobRef.current);
    return new Promise((resolve) => {
      const prev = rec.onstop;
      rec.onstop = (e) => {
        prev?.(e);
        setRecording(false);
        resolve(lastBlobRef.current);
      };
      try { rec.stop(); } catch (_) { setRecording(false); resolve(null); }
    });
  }

  function grabFrame() {
    if (!useCam || !videoEl.current) return null;
    const v = videoEl.current;
    if (v.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
    return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
  }

  async function submit() {
    setBusy(true);
    try {
      // Stop recorder first so blob is finalized
      const blob = await stopRecorder();
      const frame = useCam ? await grabFrame() : null;

      const hasAudio = !!blob && useMic;
      if (!text && !hasAudio) {
        setBusy(false);
        alert(useMic
          ? 'Press “Record Answer” first (or type your answer), then submit.'
          : 'Type your answer first.');
        return;
      }

      const form = new FormData();
      if (text) form.append('textFallback', text);
      if (blob) {
        const isVideo = blob.type.startsWith('video/');
        const ext = isVideo ? 'webm' : (blob.type.includes('mp4') ? 'm4a' : 'webm');
        // Whisper transcribes the audio track from either audio or video blobs.
        form.append('audio', blob, `answer.${ext}`);
        if (isVideo) form.append('video', blob, `answer.${ext}`);
      }
      if (frame) form.append('frame', frame, 'frame.jpg');

      const { data } = await api.post(`/sessions/${sessionId}/answer`, form);
      if (data.done) {
        nav(`/feedback/${sessionId}`);
      } else {
        setQuestion(data.question);
        setIndex(data.index);
        setText('');
        lastBlobRef.current = null;
        chunksRef.current = [];
        setHasRecording(false);
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
      await stopRecorder();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
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

          {useMic && (
            <>
              <div
                className="mt-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: recording
                    ? 'rgba(255,92,92,0.15)'
                    : hasRecording
                    ? 'rgba(74,222,128,0.15)'
                    : 'var(--card-alt)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  color: recording ? 'var(--danger)' : hasRecording ? 'var(--green)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <span style={{ fontSize: 14 }}>{recording ? '🔴' : hasRecording ? '✓' : '⏸'}</span>
                <span>
                  {recording
                    ? `Recording… speak your answer${useCam ? ' (camera + mic)' : ''}.`
                    : hasRecording
                    ? 'Answer recorded. Submit to send, or re-record.'
                    : streamReady
                    ? 'Read the question, then press Record Answer when ready.'
                    : permError || 'Requesting camera/mic permission…'}
                </span>
              </div>

              {streamReady && !recording && (
                <button
                  className={'btn block mt-md ' + (hasRecording ? 'outline' : '')}
                  onClick={startRecorder}
                  disabled={busy}
                >
                  {hasRecording ? '🔁 Re-record Answer' : '🎤 Record Answer'}
                </button>
              )}
              {recording && (
                <button className="btn block danger mt-md" onClick={stopRecorder} disabled={busy}>
                  ⏹ Stop Recording
                </button>
              )}
            </>
          )}

          {mode.textInput !== false && (
            <>
              <p className="muted mt-md" style={{ fontSize: 12 }}>
                {useMic ? 'Optional notes (the mic is your main answer):' : 'Type your answer:'}
              </p>
              <textarea
                className="textarea"
                placeholder={useMic ? 'Optional notes…' : 'Type your answer here…'}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </>
          )}

          {permError && (
            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{permError}</p>
          )}

          <button className="btn block lg mt-md" onClick={submit} disabled={busy}>
            {busy ? 'Analyzing…' : isLast ? 'Finish interview ✓' : 'Submit & next →'}
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {useCam ? (
            <div style={{ position: 'relative', background: '#000', aspectRatio: '4 / 3' }}>
              <video
                ref={videoEl}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              {permError ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, textAlign: 'center' }}>
                  <p style={{ color: '#fff' }}>{permError}</p>
                </div>
              ) : !streamReady ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="muted">Starting camera…</p>
                </div>
              ) : recording ? (
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,92,92,0.85)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 4 }}>
                  ● REC
                </div>
              ) : null}
            </div>
          ) : (
            <div className="center" style={{ padding: 40 }}>
              <div style={{ fontSize: 96 }}>🤖</div>
              <h3 className="mt-md">Your AI interviewer</h3>
              <p className="subtitle mt-sm">
                Take your time — answer technically and clearly. The follow-ups adapt to your answer.
              </p>
            </div>
          )}
          {useCam && (
            <div style={{ padding: 14 }}>
              <p className="muted" style={{ fontSize: 12 }}>
                Body language is sampled from a frame at the moment you submit.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
