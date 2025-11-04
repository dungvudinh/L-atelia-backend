import axiosClient from '../configs/axios';
export const projectService = {
    // CREATE
  createProject: async (data) => {
    const response = await axiosInstance.post('/v1/projects', data);
    return response.data;
  },

  // READ ALL
  getAllProjects: async () => {
    const response = await axiosInstance.get('/v1/projects');
    return response.data;
  },

  // READ ONE
  getProjectById: async (id) => {
    const response = await axiosInstance.get(`/v1//projects/${id}`);
    return response.data;
  },

  // UPDATE
  updateProject: async (id, data) => {
    const response = await axiosInstance.put(`/v1/projects/${id}`, data);
    return response.data;
  },

  // DELETE
  deleteProject: async (id) => {
    const response = await axiosInstance.delete(`/v1/projects/${id}`);
    return response.data;
  },
}