import axios from 'axios';

const api = axios.create({
  // FIX: Use process.env instead of import.meta.env as defined in vite.config.ts
  baseURL: process.env.VITE_API_BASE_URL || '/api', // Use proxy in dev
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;