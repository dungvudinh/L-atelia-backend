// services/projectUploadService.js
import axiosClient from "../configs/axios";

export const projectUploadService = {
  uploadProjectImage: async (projectId, file, imageType = 'gallery') => {
    try {
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', imageType);
      
      const endpoint = projectId && projectId !== 'new' ? 
        `/v1/projects/${projectId}/upload/image` : 
        '/v1/projects/new/upload/image';
      
      const response = await axiosClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      throw error;
    }
  },

  uploadProjectImages: async (projectId, files, imageType = 'gallery') => {
    try {
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('imageType', imageType);
      
      const endpoint = projectId && projectId !== 'new' ? 
        `/v1/projects/${projectId}/upload/images` : 
        '/v1/projects/new/upload/images';
      
      
      const response = await axiosClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Multiple images upload error:', error);
      throw error;
    }
  },

  deleteProjectImage: async (projectId, imageKey, imageType = null) => {
    try {
      
      const params = imageType ? { imageType } : {};
      
      const endpoint = projectId ? 
        `/v1/projects/${projectId}/images/${encodeURIComponent(imageKey)}` : 
        `/v1/projects/new/images/${encodeURIComponent(imageKey)}`;
      
      const response = await axiosClient.delete(endpoint, { params });
      
      return response.data;
    } catch (error) {
      console.error('❌ Image delete error:', error);
      throw error;
    }
  }
};