import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cogig_token') || localStorage.getItem('sahyog_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized and reject HTML fallbacks from static hosts (e.g. Netlify)
api.interceptors.response.use(
  (response) => {
    // If the server returns HTML (e.g. Netlify fallback /* -> /index.html for /api routes),
    // reject so components don't treat an HTML string as an array or JSON object
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype html') ||
        response.data.trim().startsWith('<html') ||
        String(response.headers?.['content-type'] || '').includes('text/html'))
    ) {
      const err: any = new Error('API returned HTML instead of JSON. Backend service is offline.');
      err.response = { status: 503, data: { message: 'Backend service offline' } };
      err.code = 'ERR_BACKEND_OFFLINE';
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens on 401
      localStorage.removeItem('cogig_token');
      localStorage.removeItem('sahyog_token');
      localStorage.removeItem('cogig_user');
      localStorage.removeItem('sahyog_user');
    }
    return Promise.reject(error);
  }
);

export default api;
