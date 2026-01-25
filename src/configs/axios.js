// File: src/utils/axiosClient.js (OPTIMIZED VERSION)
import axios from 'axios';

// Base URL cho production
const API_BASE_URL = 'https://l-atelia-api-yct5.onrender.com';

// Tạo axios instance tối ưu
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // ⬆️ TĂNG lên 120s cho upload ảnh lớn
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'admin-web',
    'Accept': 'application/json'
  },
  // ⭐ THÊM CẤU HÌNH QUAN TRỌNG
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  // ⭐ Kích hoạt HTTP/2 nếu có
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true })
});

// ⭐ HÀM TIMEOUT THÔNG MINH THEO FILE SIZE
const getSmartTimeout = (fileSize) => {
  if (!fileSize) return 120000; // 120s mặc định
  
  const sizeInMB = fileSize / (1024 * 1024);
  
  if (sizeInMB < 2) return 30000;     // <2MB: 30s
  if (sizeInMB < 10) return 60000;    // <10MB: 60s
  if (sizeInMB < 50) return 120000;   // <50MB: 120s
  return 180000;                      // >50MB: 180s
};

// ⭐ INTERCEPTOR CHO UPLOAD
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
    
    // ⭐ ÁP DỤNG SMART TIMEOUT CHO UPLOAD
    if (config.url?.includes('/upload') && config.data instanceof FormData) {
      const file = config.data.get('file') || config.data.get('image');
      if (file) {
        const smartTimeout = getSmartTimeout(file.size);
        config.timeout = smartTimeout;
        console.log(`⏱️ Smart timeout applied: ${smartTimeout/1000}s for ${(file.size/(1024*1024)).toFixed(2)}MB`);
      }
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

// ⭐ INTERCEPTOR RESPONSE VỚI RETRY LOGIC
axiosClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      duration: response.headers['x-response-time']
    });
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // ⭐ RETRY CHO TIMEOUT (tối đa 2 lần)
    if (error.code === 'ECONNABORTED' && 
        error.message.includes('timeout') && 
        !config?._retry) {
      
      config._retry = true;
      console.log(`🔄 Retrying timeout request: ${config.url} (attempt ${config._retryCount || 1})`);
      
      // Chờ 2 giây trước khi retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ⭐ GIẢM TIMEOUT CHO LẦN RETRY
      if (config.timeout > 30000) {
        config.timeout = 30000; // Giảm còn 30s cho retry
      }
      
      return axiosClient(config);
    }
    
    console.error('❌ Response error:', {
      url: config?.url,
      status: error.response?.status,
      code: error.code,
      message: error.message,
      isNetwork: !navigator.onLine
    });
    
    // ⭐ USER-FRIENDLY ERROR MESSAGES
    if (error.code === 'ECONNABORTED') {
      const fileSize = config?.data instanceof FormData 
        ? (config.data.get('file')?.size || 0) 
        : 0;
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
      
      if (sizeMB > 10) {
        error.userMessage = `File quá lớn (${sizeMB}MB). Vui lòng nén ảnh dưới 10MB hoặc sử dụng Wi-Fi.`;
      } else {
        error.userMessage = 'Kết nối chậm. Vui lòng kiểm tra mạng và thử lại.';
      }
    }
    
    return Promise.reject(error);
  }
);

// ⭐ HÀM UPLOAD ĐẶC BIỆT VỚI PROGRESS
export const uploadWithProgress = (url, formData, onProgress) => {
  return axiosClient.post(url, formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
    // Timeout sẽ được interceptor tự động tính
  });
};

export default axiosClient;