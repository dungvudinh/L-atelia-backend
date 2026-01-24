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

  // Tạo project với JSON thuần
  createProject: async (projectData) => {
    try {
      console.log('🚀 Creating project with data:', {
        title: projectData.title,
        description: projectData.description?.length,
        gallery: projectData.gallery?.length || 0,
        constructionProgress: projectData.constructionProgress?.length || 0,
        designImages: projectData.designImages?.length || 0,
        brochure: projectData.brochure?.length || 0
      });
      
      const response = await axiosClient.post('/v1/projects', projectData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Project created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in createProject service:', error);
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

  // Update project với JSON thuần
  updateProject: async (id, projectData) => {
    try {
      console.log('🚀 Updating project:', {
        id,
        gallery: projectData.gallery?.length || 0,
        constructionProgress: projectData.constructionProgress?.length || 0,
        designImages: projectData.designImages?.length || 0,
        brochure: projectData.brochure?.length || 0
      });
      
      const response = await axiosClient.put(`/v1/projects/${id}`, projectData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Project updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateProject service:', error);
      console.error('Response:', error.response?.data);
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
  }
};