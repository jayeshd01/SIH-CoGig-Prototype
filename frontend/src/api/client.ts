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

// Response interceptor to handle unauthorized
api.interceptors.response.use(
  (response) => response,
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
