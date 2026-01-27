// services/folderService.js - UPDATED
import axiosClient from "../configs/axios";

export const folderService = {
  // Get all folders
  getFolders: async () => {
    try {
      const response = await axiosClient.get('/v1/folders');
      return response.data;
    } catch (error) {
      console.error('❌ Error in getFolders service:', error);
      throw error;
    }
  },

  // Get folder by ID
  getFolderById: async (id) => {
    try {
      const response = await axiosClient.get(`/v1/folders/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error in getFolderById service:', error);
      throw error;
    }
  },

  // Create folder
  createFolder: async (folderData) => {
    try {
      const response = await axiosClient.post('/v1/folders', folderData);
      return response.data;
    } catch (error) {
      console.error('❌ Error in createFolder service:', error);
      throw error;
    }
  },

  // Update folder
  updateFolder: async (id, folderData) => {
    try {
      const response = await axiosClient.put(`/v1/folders/${id}`, folderData);
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateFolder service:', error);
      throw error;
    }
  },

  // Delete folder
  deleteFolder: async (id) => {
    try {
      const response = await axiosClient.delete(`/v1/folders/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteFolder service:', error);
      throw error;
    }
  },

  // Upload images to folder using pre-signed URLs
  uploadImages: async (folderId, formData) => {
    try {
      console.log(`🔄 Uploading images to folder: ${folderId}`);
      
      const response = await axiosClient.post(`/v1/folders/${folderId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Images uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in uploadImages service:', error);
      throw error;
    }
  },

  // NEW: Upload single image info (after direct B2 upload)
  uploadImageToFolder: async (folderId, imageData) => {
    try {
      console.log(`🖼️ Saving image info to folder: ${folderId}`, imageData);
      
      const response = await axiosClient.post(`/v1/folders/${folderId}/images`, imageData);
      
      console.log('✅ Image info saved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in uploadImageToFolder service:', error);
      throw error;
    }
  },

  // Delete image from folder
  deleteImage: async (folderId, imageId) => {
    try {
      console.log(`🗑️ Deleting image ${imageId} from folder ${folderId}`);
      
      const response = await axiosClient.delete(`/v1/folders/${folderId}/images/${imageId}`);
      console.log('✅ Image deleted successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteImage service:', error);
      throw error;
    }
  }
};