import axios from 'axios';
import FormData from 'form-data';

const baseURL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const ai = axios.create({ baseURL, timeout: 60000 });

function rethrow(label, err) {
  const upstream = err?.response?.data;
  const body = typeof upstream === 'string' ? upstream : JSON.stringify(upstream);
  const status = err?.response?.status;
  const code = err?.code;
  const msg = `[ai-service] ${label} failed: ${code || ''} ${status || ''} ${body || err.message}`.trim();
  console.error(msg);
  const e = new Error(msg);
  e.status = 502;
  throw e;
}

export async function generateQuestion({ domain, difficulty, history }) {
  try {
    const { data } = await ai.post('/generate-question', { domain, difficulty, history });
    return data;
  } catch (e) { rethrow('generateQuestion', e); }
}

export async function transcribeAudio(buffer, filename = 'answer.m4a') {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const { data } = await ai.post('/transcribe', form, { headers: form.getHeaders() });
    return data;
  } catch (e) { rethrow('transcribeAudio', e); }
}

export async function evaluateAnswer({ question, transcript, domain, difficulty }) {
  try {
    const { data } = await ai.post('/evaluate-answer', { question, transcript, domain, difficulty });
    return data;
  } catch (e) { rethrow('evaluateAnswer', e); }
}

export async function generateFeedback({ domain, turns }) {
  try {
    const { data } = await ai.post('/generate-feedback', { domain, turns });
    return data;
  } catch (e) { rethrow('generateFeedback', e); }
}

export async function generateChallenge({ domain }) {
  try {
    const { data } = await ai.post('/generate-challenge', { domain });
    return data;
  } catch (e) { rethrow('generateChallenge', e); }
}

export async function analyzeFrame(buffer, filename = 'frame.jpg', contentType = 'image/jpeg') {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType });
    const { data } = await ai.post('/analyze-frame', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });
    return data;
  } catch (e) { rethrow('analyzeFrame', e); }
}
