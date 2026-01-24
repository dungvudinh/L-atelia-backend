// services/imageUploadService.js
import axiosClient from "../configs/axios";

export const imageUploadService = {
  // Upload single image và lưu tạm vào database
  uploadTempImage: async (file, field, tempId, projectId = null, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', field);
      formData.append('tempId', tempId);
      if (projectId) formData.append('projectId', projectId);

      const response = await axiosClient.post('/v1/images/temp-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading temp image:', error);
      throw error;
    }
  },

  // Xóa ảnh tạm thời khi hủy
  deleteTempImages: async (tempIds) => {
    try {
      console.log('Dữ liệu tempIds gửi đi:', tempIds);
      const response = await axiosClient.post('/v1/images/delete-temp', { tempIds });
      return response.data;
    } catch (error) {
      console.error('Error deleting temp images:', error);
      throw error;
    }
  },

  // Confirm images khi save project
  confirmTempImages: async (projectId, tempImageData) => {
    try {
      const response = await axiosClient.post(`/v1/projects/${projectId}/confirm-images`, {
        tempImageData
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming images:', error);
      throw error;
    }
  }
};