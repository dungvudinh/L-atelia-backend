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
      console.log(formData)
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
  // services/projectService.js - Sửa hàm updateProject
  updateProject: async (id, formData) => {
    try {
      console.log('=== SERVICE: UPDATE PROJECT ===');
      console.log('Project ID:', id);
      
      // DEBUG: Log FormData entries trong service
      console.log('FormData entries in service:');
      const entries = [];
      for (let [key, value] of formData.entries()) {
        if (key === 'data') {
          entries.push(`${key}: JSON (length: ${value.length})`);
          // Test parse trong service
          try {
            JSON.parse(value);
            console.log('✅ JSON valid in service');
          } catch (e) {
            console.error('❌ JSON invalid in service:', e.message);
            console.error('First 300 chars:', value.substring(0, 300));
          }
        } else if (value instanceof File) {
          entries.push(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          entries.push(`${key}: ${value}`);
        }
      }
      console.log('Entries:', entries);
      
      const response = await axiosClient.put(`/v1/projects/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Update successful in service');
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateProject service:');
      console.error('Error message:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      // Re-throw error với thông tin chi tiết
      const serviceError = new Error(error.message || 'Update failed');
      serviceError.response = error.response;
      throw serviceError;
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
  createProjectWithConfirm: async (projectData, tempImageData) => {
    try {
      // Đầu tiên tạo project
      console.log(projectData)
      const createResponse = await axiosClient.post('/v1/projects', {data:projectData});
      const project = createResponse.data.data;
      
      // Nếu có temp images, confirm chúng
      if (tempImageData) {
        await axiosClient.post(`/v1/projects/${project._id}/confirm-images`, {
          tempImageData
        });
      }
      
      return createResponse.data;
    } catch (error) {
      console.error('Error in createProjectWithConfirm:', error);
      throw error;
    }
  },
  updateProjectWithConfirm: async (id, projectData, tempImageData) => {
    try {
      // Đầu tiên update project
      const updateResponse = await axiosClient.put(`/v1/projects/${id}`, projectData);
      
      // Nếu có temp images, confirm chúng
      if (tempImageData) {
        await axiosClient.post(`/v1/projects/${id}/confirm-images`, {
          tempImageData
        });
      }
      
      return updateResponse.data;
    } catch (error) {
      console.error('Error in updateProjectWithConfirm:', error);
      throw error;
    }
  }
};