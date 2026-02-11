// src/services/notificationService.js
// import api from './api';
import axiosClient from '../configs/axios';
const notificationService = {
  // Get new booking notifications
  getNewBookings: async () => {
    try {
      const response = await axiosClient.get('/v1/notifications/new');
      return response.data;
    } catch (error) {
      console.error('Error fetching new bookings:', error);
      throw error.response?.data || error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosClient.patch(`/v1/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response?.data || error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await axiosClient.patch('/v1/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response?.data || error;
    }
  },

  // Get notification count
  getUnreadCount: async () => {
    try {
      const response = await axiosClient.get('/v1/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error.response?.data || error;
    }
  }
};

export default notificationService;