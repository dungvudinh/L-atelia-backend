// src/services/userService.js
// import axiosClient from './api';
import axiosClient from '../configs/axios';
const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await axiosClient.get('/v1/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axiosClient.get(`/v1/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await axiosClient.post('/v1/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      console.log('testing')
      const response = await axiosClient.put(`/v1/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await axiosClient.delete(`/v1/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change user status
  changeUserStatus: async (id, isActive) => {
    try {
      console.log(id)
      const response = await axiosClient.patch(`/v1/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (id, newPassword) => {
    try {
      const response = await axiosClient.patch(`/v1/users/${id}/change-password`, { newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, 
  changeUserStatus: async (id, isActive) => {
    try {
      const response = await axiosClient.patch(`/v1/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Bulk change status
  bulkChangeStatus: async (userIds, isActive) => {
    try {
      const response = await axiosClient.patch('/v1/users/bulk/status', { 
        userIds, 
        isActive 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default userService;