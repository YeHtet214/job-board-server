import { RequestHandler, Router } from 'express';
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

dashboardRouter.use(authorize as RequestHandler);

// Job seeker routes
dashboardRouter.get('/jobseeker', jobseekerOnly as RequestHandler, getJobSeekerDashboard as RequestHandler);
dashboardRouter.delete('/jobseeker/applications/:id', jobseekerOnly as RequestHandler, withdrawApplication as RequestHandler);

// Employer routes
dashboardRouter.get('/employer', employerOnly as RequestHandler, getEmployerDashboard as RequestHandler);
dashboardRouter.put('/employer/applications/:id', employerOnly as RequestHandler, updateApplicationStatusHandler as RequestHandler);
dashboardRouter.get('/employer/profile-completion', employerOnly as RequestHandler, getCompanyProfile as);

export default dashboardRouter;
