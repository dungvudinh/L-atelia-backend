import routes from "../configs/routes";
import Dashboard from "../pages/Dashboard";
import ProjectDetail from "../pages/ProjectDetail";
import Projects from "../pages/Projects";
import ProjectEditor from '../pages/Projects/editor';
import Media from '../pages/Media';
import MediaEditor from '../pages/Media/editor';
import Rent from '../pages/Rent/index';
import CreateRent from '../pages/Rent/create';
import Booking from '../pages/Booking';
import BookingEditor from '../pages/Booking/editor';
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
    component:ProjectEditor
  }, 
  {
    path:routes.media, 
    component:Media
  }, 
  {
    path:routes.createMedia, 
    component:MediaEditor
  }, 
  {
    path:routes.editMedia, 
    component:MediaEditor
  },
  {
    path:routes.rent,
    component:Rent, 
  }, 
  {
    path:routes.createRent, 
    component:CreateRent
  }, 
  {
    path:routes.booking, 
    component:Booking
  }, 
  {
    path:routes.bookingEditor, 
    component:BookingEditor
  }, 
  {
    path:routes.editProject, 
    component:ProjectEditor
  }
];

export { publicRoutes };
