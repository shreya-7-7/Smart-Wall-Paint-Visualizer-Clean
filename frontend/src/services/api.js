import axios from 'axios';

// Resolve backend API URL: VITE_API_URL is expected to be the backend origin (e.g. https://my-backend.onrender.com)
// If not configured, fall back to local development (http://localhost:5001). The '/api' prefix is appended exactly once.
const rawBase = import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).trim().replace(/\/+$/, '')
  : 'http://localhost:5001';

const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const API = axios.create({
  baseURL,
});

// Helper to get or create a stable guest session identifier
export const getGuestSessionId = () => {
  try {
    let sessionId = localStorage.getItem('paint_guest_session_id');
    if (!sessionId) {
      sessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('paint_guest_session_id', sessionId);
    }
    return sessionId;
  } catch {
    return 'guest-fallback-session';
  }
};

// Add authorization and guest session headers to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const guestSessionId = getGuestSessionId();
  if (guestSessionId) {
    config.headers['x-guest-session'] = guestSessionId;
  }

  return config;
});

export default API;
