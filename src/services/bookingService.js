// services/bookingService.js
import axiosClient from "../configs/axios";

const bookingService = {
  // GET ALL BOOKINGS
  getAllBookings: async (params = {}) => {
    try {
      const response = await axiosClient.get('/v1/bookings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET BOOKING BY ID
  getBookingById: async (id) => {
    try {
      const response = await axiosClient.get(`/v1/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // CREATE NEW BOOKING
  createBooking: async (bookingData) => {
    try {
      const response = await axiosClient.post('/v1/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPDATE BOOKING
  updateBooking: async (id, bookingData) => {
    try {
      const response = await axiosClient.put(`/v1/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE BOOKING
  deleteBooking: async (id) => {
    try {
      const response = await axiosClient.delete(`/v1/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // CHECK PROPERTY AVAILABILITY
  checkAvailability: async (propertyId, checkIn, checkOut, excludeBookingId = null) => {
    try {
      const params = { propertyId, checkIn, checkOut };
      if (excludeBookingId) {
        params.excludeBookingId = excludeBookingId;
      }
      const response = await axiosClient.get('/v1/bookings/check-availability', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPDATE BOOKING STATUS
  updateBookingStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/v1/bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPDATE PAYMENT STATUS
  updatePaymentStatus: async (id, paymentStatus) => {
    try {
      const response = await axiosClient.patch(`/v1/bookings/${id}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // SEND BOOKING EMAIL
  sendBookingEmail: async (id, emailType) => {
    try {
      const response = await axiosClient.post(`/v1/bookings/${id}/send-email`, { emailType });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default bookingService;