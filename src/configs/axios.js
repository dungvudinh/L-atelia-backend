// File: src/utils/axiosClient.js (ADMIN CLIENT)
import axios from 'axios';

const API_BASE_URL = 'http://l-atelia-api-yct5.onrender.com';

class AdminApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.retryCount = 0;
    this.maxRetries = 2;
  }

  async request(config) {
    const strategies = [
      // Strategy 1: Với credentials
      {
        name: 'with-credentials',
        config: { withCredentials: true },
        try: true
      },
      // Strategy 2: Không credentials  
      {
        name: 'without-credentials',
        config: { withCredentials: false },
        try: true
      },
      // Strategy 3: Dùng proxy qua admin domain
      {
        name: 'proxy',
        config: { 
          baseURL: '',
          url: `/api-proxy${config.url.replace(this.baseURL, '')}`,
          withCredentials: false
        },
        try: window.location.origin === 'https://admin.latelia.com'
      }
    ];

    for (const strategy of strategies) {
      if (!strategy.try) continue;

      try {
        console.log(`👑 Admin trying: ${strategy.name}`);
        
        const axiosConfig = {
          baseURL: this.baseURL,
          headers: {
            'Content-Type': 'application/json',
            'X-Client': 'admin',
            'X-Strategy': strategy.name
          },
          ...strategy.config,
          ...config
        };

        // Thêm token từ localStorage
        const token = localStorage.getItem('token');
        if (token) {
          axiosConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Thêm cache buster để tránh cached CORS errors
        if (axiosConfig.url && !axiosConfig.url.includes('?_t=')) {
          const separator = axiosConfig.url.includes('?') ? '&' : '?';
          axiosConfig.url += `${separator}_t=${Date.now()}`;
        }

        const response = await axios(axiosConfig);
        
        // Nếu dùng strategy fallback, log để debug
        if (strategy.name !== 'with-credentials') {
          console.warn(`⚠️ Admin using fallback: ${strategy.name}`);
        }
        
        return response;
      } catch (error) {
        console.warn(`Admin strategy ${strategy.name} failed:`, error.message);
        
        // Nếu là CORS error, tiếp tục strategy tiếp theo
        if (error.message.includes('CORS') || error.message.includes('Network')) {
          continue;
        }
        
        // Nếu là lỗi khác (401, 403, etc.) thì throw luôn
        throw error;
      }
    }
    
    throw new Error('All admin API strategies failed');
  }
}

// Tạo instance
const adminClient = new AdminApiClient();

// Tạo axiosClient tương thích với code cũ
const axiosClient = {
  get: (url, config) => adminClient.request({ ...config, method: 'GET', url }),
  post: (url, data, config) => adminClient.request({ ...config, method: 'POST', url, data }),
  put: (url, data, config) => adminClient.request({ ...config, method: 'PUT', url, data }),
  delete: (url, config) => adminClient.request({ ...config, method: 'DELETE', url }),
  
  // Giữ nguyên interceptors cho compatibility
  interceptors: {
    request: {
      use: () => {} // No-op, đã xử lý trong request()
    },
    response: {
      use: (onFulfilled, onRejected) => {
        // Store để xử lý response
        adminClient.responseHandlers = { onFulfilled, onRejected };
      }
    }
  }
};

export default axiosClient;