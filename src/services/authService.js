// src/services/authService.js
// import axiosClient from './axiosClient';
import axiosClient from "../configs/axios";
const authService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await axiosClient.post('/v1/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Store user data
  storeUserData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get stored user data
  getStoredUserData: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default authService;