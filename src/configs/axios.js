// File: src/utils/axiosClient.js (SIMPLE VERSION)
import axios from 'axios';

// Base URL cho production
const API_BASE_URL = 'http://localhost:3000';

// Tạo axios instance đơn giản
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false, // QUAN TRỌNG: Đặt false cho cross-origin
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'admin-web',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    console.log('🌐 Request:', {
      url: config.url,
      method: config.method,
      origin: window.location.origin
    });
    
    // Thêm token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm cache buster cho GET requests
    if (config.method === 'get' && config.url) {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url += `${separator}_t=${Date.now()}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      isCors: error.message.includes('CORS') || error.message.includes('Network')
    });
    
    // Xử lý CORS error
    if (error.message.includes('CORS') || error.message.includes('Network')) {
      console.error('CORS/Network Error. Check:');
      console.error('1. Backend CORS configuration');
      console.error('2. Backend is running and accessible');
      console.error('3. No mixed content (HTTPS -> HTTP)');
      
      // Hiển thị thông báo user-friendly
      alert('Không thể kết nối đến server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;