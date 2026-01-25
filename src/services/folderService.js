// services/folderService.js
import axiosClient from "../configs/axios";

export const folderService = {
  // Get all folders
  getFolders: async () => {
    try {
      console.log('📋 Fetching folders');
      
      const response = await axiosClient.get('/v1/folders');
      console.log('✅ Folders fetched successfully:', response.data);
      
      // Trả về data trực tiếp, không dùng .flat
      return response.data;
    } catch (error) {
      console.error('❌ Error in getFolders service:', error);
      throw error;
    }
  },

  // Get folder by ID
  getFolderById: async (id) => {
    try {
      console.log(`📋 Fetching folder with ID: ${id}`);
      
      const response = await axiosClient.get(`/v1/folders/${id}`);
      console.log('✅ Folder fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in getFolderById service:', error);
      throw error;
    }
  },

  // Create folder
  createFolder: async (folderData) => {
    try {
      console.log('🔄 Creating folder:', folderData);
      
      const response = await axiosClient.post('/v1/folders', folderData);
      console.log('✅ Folder created successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in createFolder service:', error);
      throw error;
    }
  },

  // Update folder
  updateFolder: async (id, folderData) => {
    try {
      console.log(`🔄 Updating folder with ID: ${id}`);
      
      const response = await axiosClient.put(`/v1/folders/${id}`, folderData);
      console.log('✅ Folder updated successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateFolder service:', error);
      throw error;
    }
  },

  // Delete folder
  deleteFolder: async (id) => {
    try {
      console.log(`🗑️ Deleting folder with ID: ${id}`);
      
      const response = await axiosClient.delete(`/v1/folders/${id}`);
      console.log('✅ Folder deleted successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteFolder service:', error);
      throw error;
    }
  },

  // Upload images to folder
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