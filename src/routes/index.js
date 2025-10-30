import routes from "../configs/routes";
import Dashboard from "../pages/Dashboard";
import ProjectDetail from "../pages/ProjectDetail";
import Projects from "../pages/Projects";
import CreateProject from '../pages/Projects/create';
const publicRoutes = [
  {
    path:routes.dashboard, 
    component:Dashboard
  }, 
  {
    path:routes.projects, 
    component:Projects
  },
  {
    path:routes.projectDetail, 
    component:ProjectDetail
  }, 
  {
    path:routes.createProject, 
    component:CreateProject
  }
];

export { publicRoutes };
