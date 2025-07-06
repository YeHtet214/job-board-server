import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import { jobseekerOnly, employerOnly } from '../middleware/role.middleware.js';
import {
  getJobSeekerDashboard,
  getEmployerDashboard,
  withdrawApplication,
  updateApplicationStatusHandler,
  getCompanyProfile
} from '../controllers/dashboard.controller.js';

const dashboardRouter = Router();

dashboardRouter.use(authorize);

// Job seeker routes
dashboardRouter.get('/jobseeker', jobseekerOnly, getJobSeekerDashboard);
dashboardRouter.delete('/jobseeker/applications/:id', jobseekerOnly, withdrawApplication);

// Employer routes
dashboardRouter.get('/employer', employerOnly, getEmployerDashboard);
dashboardRouter.put('/employer/applications/:id', employerOnly, updateApplicationStatusHandler);
dashboardRouter.get('/employer/profile-completion', employerOnly, getCompanyProfile);

export default dashboardRouter;
