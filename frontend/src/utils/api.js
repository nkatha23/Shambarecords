import axios from 'axios';

// In production the frontend and backend are on different domains.
// VITE_API_URL is injected at build time by Render (e.g. https://shambarecords.onrender.com).
// In dev, fall back to '/api' which Vite proxies to :5000.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ct_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
