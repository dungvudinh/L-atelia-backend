// src/services/authService.js
import axiosClient from "../configs/axios";

// Key names for localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'remembered_username';

const authService = {
  // Login
  login: async (username, password) => {
    try {
      
      const response = await axiosClient.post('/v1/auth/login', {
        username,
        password
      })
      
      return response.data
    } catch (error) {
      console.log('🔴 Auth Service - Catch error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      // Throw error với message đã được xử lý từ interceptor
      throw error
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/v1/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Không xóa remembered username khi logout
  },

  // Store user data
  storeUserData: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get stored user data
  getStoredUserData: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Save credentials for remember me
  saveCredentials: (username) => {
    localStorage.setItem(REMEMBER_ME_KEY, username);
  },

  // Get saved credentials
  getSavedCredentials: () => {
    const username = localStorage.getItem(REMEMBER_ME_KEY);
    if (username) {
      return { username };
    }
    return null;
  },

  // Clear saved credentials
  clearSavedCredentials: () => {
    localStorage.removeItem(REMEMBER_ME_KEY);
  },

  // Clear all auth data (for complete logout)
  clearAllAuthData: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }, 
  refreshToken: async () => {
    try {
      const response = await axiosClient.post('/v1/auth/refresh');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validate token
  validateToken: async () => {
    try {
      const response = await axiosClient.get('/v1/auth/validate');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;