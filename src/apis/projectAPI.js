import axiosClient from "../configs/axios";
export const getProjects = async ()=>await axiosClient.get('/v1/projects');