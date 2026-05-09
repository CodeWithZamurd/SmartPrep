import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function setStoredToken(t) {
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

export function getStoredToken() {
  return localStorage.getItem('token');
}
