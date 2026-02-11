import axiosClient from "../configs/axios";

export const mediaService = {
  // Get all media
  getMedia: async (params = {}) => {
    try {
      
      const response = await axiosClient.get('/v1/media', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          category: params.category,
          search: params.search
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in getMedia service:', error);
      throw error;
    }
  },

  // Get media by ID
  getMediaById: async (id) => {
    try {
      
      const response = await axiosClient.get(`/v1/media/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in getMediaById service:', error);
      throw error;
    }
  },

  // Create media
  createMedia: async (mediaData) => {
    try {
      
      const response = await axiosClient.post('/v1/media', mediaData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in createMedia service:', error);
      throw error;
    }
  },

  // Update media
  updateMedia: async (id, mediaData) => {
    try {
      const response = await axiosClient.put(`/v1/media/${id}`, mediaData);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateMedia service:', error);
      throw error;
    }
  },

  // Delete media
  deleteMedia: async (id) => {
    try {
      
      const response = await axiosClient.delete(`/v1/media/${id}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteMedia service:', error);
      throw error;
    }
  },

  // Bulk delete media
  bulkDeleteMedia: async (ids) => {
    try {
      
      const response = await axiosClient.post('/v1/media/bulk-delete', { ids });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in bulkDeleteMedia service:', error);
      throw error;
    }
  },

  // Upload featured image
  uploadFeaturedImage: async (formData) => {
    try {
      
      const response = await axiosClient.post('/v1/media/upload-featured-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in uploadFeaturedImage service:', error);
      throw error;
    }
  },

  // Delete featured image
  deleteFeaturedImage: async (imageKey) => {
    try {
      
      const response = await axiosClient.delete(`/v1/media/delete-featured-image`, {
        data:{
          key: imageKey
          // imageUrl: imageInfo.imageUrl, 
          // filename:imageInfo.filename
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteFeaturedImage service:', error);
      throw error;
    }
  },

  // Get media by category
  getMediaByCategory: async (category) => {
    try {
      
      const response = await axiosClient.get('/v1/media', { 
        params: { category } 
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in getMediaByCategory service:', error);
      throw error;
    }
  }
};