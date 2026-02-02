// services/rentService.js
import axiosClient from '../configs/axios';
const rentService = {
  // GET ALL RENTALS
  getAllRentals: async (params = {}) => {
    try {
      const response = await axiosClient.get('/v1/rent', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // GET RENTAL BY ID
  getRentalById: async (id) => {
    try {
      const response = await axiosClient.get(`/v1/rent/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // CREATE NEW RENTAL
  createRental: async (rentalData) => {
    try {
      console.log(rentalData)
      const response = await axiosClient.post('/v1/rent', rentalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPDATE RENTAL
  updateRental: async (id, rentalData) => {
    try {
      console.log(rentalData)
      const response = await axiosClient.put(`/v1/rent/${id}`, rentalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE RENTAL
  deleteRental: async (id) => {
    try {
      const response = await axiosClient.delete(`/v1/rent/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPLOAD RENTAL IMAGES
  uploadRentalImages: async (id, formData) => {
    try {
      const response = await axiosClient.post(`/v1/rent/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // DELETE RENTAL IMAGE
  deleteRentalImage: async (id, imageId) => {
    try {
      const response = await axiosClient.delete(`/v1/rent/${id}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // SET FEATURED IMAGE
  setFeaturedImage: async (id, imageId) => {
    try {
      const response = await axiosClient.put(`/v1/rent/${id}/featured-image`, { imageId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // UPDATE RENTAL STATUS
  updateRentalStatus: async (id, status) => {
    try {
      const response = await axiosClient.patch(`/v1/rent/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // TOGGLE FEATURED
  toggleFeatured: async (id, featured) => {
    try {
      const response = await axiosClient.patch(`/v1/rent/${id}/featured`, { featured });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default rentService;