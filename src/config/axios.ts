import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ─── Ollama (local AI) client ────────────────────────────────────────
export const ollamaClient = axios.create({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Generic external API client (extend for any 3rd party) ──────────
export const externalClient = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — log errors centrally
[ollamaClient, externalClient].forEach((client) => {
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error('[Axios Error]', err?.response?.data || err.message);
      return Promise.reject(err);
    }
  );
});
