// src/utils/axiosClient.js
import axios from 'axios';

const API_BASE_URL = 'https://l-atelia-api-yct5.onrender.com'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'admin'
  }
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // cache-buster
  if (config.method === 'get') {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url += `${separator}_t=${Date.now()}`;
  }

  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
