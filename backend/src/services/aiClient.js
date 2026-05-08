import axios from 'axios';
import FormData from 'form-data';

const baseURL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const ai = axios.create({ baseURL, timeout: 60000 });

export async function generateQuestion({ domain, difficulty, history }) {
  const { data } = await ai.post('/generate-question', { domain, difficulty, history });
  return data;
}

export async function transcribeAudio(buffer, filename = 'answer.m4a') {
  const form = new FormData();
  form.append('file', buffer, { filename });
  const { data } = await ai.post('/transcribe', form, { headers: form.getHeaders() });
  return data;
}

export async function evaluateAnswer({ question, transcript, domain, difficulty }) {
  const { data } = await ai.post('/evaluate-answer', { question, transcript, domain, difficulty });
  return data;
}

export async function generateFeedback({ domain, turns }) {
  const { data } = await ai.post('/generate-feedback', { domain, turns });
  return data;
}

export async function generateChallenge({ domain }) {
  const { data } = await ai.post('/generate-challenge', { domain });
  return data;
}
