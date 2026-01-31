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
      console.log('📤 Creating project with data:', {
        title: projectData.title,
        imageCounts: {
          gallery: projectData.gallery?.length || 0,
          construction: projectData.constructionProgress?.length || 0,
          design: projectData.designImages?.length || 0,
          brochure: projectData.brochure?.length || 0
        }
      });
      
      const response = await axiosClient.post('/v1/projects', projectData);
      console.log('✅ Project created successfully');
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
      console.log('📤 Updating project:', {
        id,
        title: projectData.title,
        imageCounts: {
          gallery: projectData.gallery?.length || 0,
          construction: projectData.constructionProgress?.length || 0,
          design: projectData.designImages?.length || 0,
          brochure: projectData.brochure?.length || 0
        }
      });
      
      const response = await axiosClient.put(`/v1/projects/${id}`, projectData);
      console.log('✅ Project updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateProject service:', error);
      throw error;
    }
  },
  
  deleteProject: async (id) => {
    try {
      const response = await axiosClient.delete(`/v1/projects/${id}`);
      console.log('✅ Project deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteProject service:', error);
      throw error;
    }
  }
}
