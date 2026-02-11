// services/projectService.js
import axiosClient from "../configs/axios";


export const projectService = {
   getProjects: async (params = {}) => {
    try {
      // Thêm fields để lấy đủ thumbnail data
      const response = await axiosClient.get('/v1/projects', { 
        params: {
          ...params,
          fields: 'title,location,status,createdAt,heroImage.url,heroImage.thumbnailUrl,heroImage.thumbnailSize,heroImage.size,heroImage.hasThumbnail'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error in getProjects service:', error);
      throw error;
    }
  },
  
  // Create project - CHỈ GỬI JSON
  createProject: async (projectData) => {
    try {
      
      
      const response = await axiosClient.post('/v1/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('❌ Error in createProject service:', error);
      console.error('❌ Error in createProject service:', error);
      throw error;
    }
  },
  
  getProjectById: async (id) => {
    try {
      const response = await axiosClient.get(`/v1/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error in getProjectById service:', error);
      throw error;
    }
  },
  
  // Update project - CHỈ GỬI JSON
  updateProject: async (id, projectData) => {
    try {
      
      
      const response = await axiosClient.put(`/v1/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateProject service:', error);
      throw error;
    }
  },
  
  deleteProject: async (id) => {
    try {
      const response = await axiosClient.delete(`/v1/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteProject service:', error);
      throw error;
    }
  }
}
