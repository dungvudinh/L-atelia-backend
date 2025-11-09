// services/projectService.js
import axiosClient from "../configs/axios";
export const projectService = {
  getProjects: async (params = {}) => {
    try {
      console.log('📋 Fetching projects with params:', params);
      
      const response = await axiosClient.get('/v1/projects', { params });
      console.log('✅ Projects fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in getProjects service:', error);
      throw error;
    }
  },
  // Create project với FormData
  createProject: async (formData) => {
    try {
      console.log('FormData received in service:', formData);
      
      // DEBUG: Log tất cả entries trong FormData
      for (let [key, value] of formData.entries()) {
        console.log(`Service formData entry: ${key} =`, value);
        
        // Nếu là string data, parse để xem nội dung
        if (key === 'data' && typeof value === 'string') {
          try {
            const parsedData = JSON.parse(value);
            console.log('Parsed data field:', parsedData);
          } catch (e) {
            console.log('Data field (not JSON):', value);
          }
        }
      }

      const response = await axiosClient.post(`/v1/projects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createProject service:', error);
      throw error;
    }
  },
  getProjectById: async (id) => {
    try {
      console.log(`📋 Fetching project with ID: ${id}`);
      
      const response = await axiosClient.get(`/v1/projects/${id}`);
      console.log('✅ Project fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in getProjectById service:', error);
      throw error;
    }
  },
  // Update project với FormData
  updateProject: async (id, formData) => {
    try {
      console.log('FormData for update:', formData);
      
      // DEBUG: Log entries
      for (let [key, value] of formData.entries()) {
        console.log(`Update formData entry: ${key} =`, value);
      }

      const response = await axiosClient.put(`/v1/projects/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateProject service:', error);
      throw error;
    }
  }, 
  deleteProject: async (id) => {
    try {
      console.log(`🗑️ Deleting project with ID: ${id}`);
      
      const response = await axiosClient.delete(`/v1/projects/${id}`);
      console.log('✅ Project deleted successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteProject service:', error);
      throw error;
    }
  },
};