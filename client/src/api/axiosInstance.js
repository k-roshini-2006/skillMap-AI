import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
});

// Auto attach JWT token to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillmap_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auto handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clean up token if invalid
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login') && !currentPath.includes('auth')) {
        // Only clear if server explicitly returned token expired
        const msg = error.response.data?.error || error.response.data?.message || '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid token')) {
          localStorage.removeItem('skillmap_token');
          localStorage.removeItem('skillmap_user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;