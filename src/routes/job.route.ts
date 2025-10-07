import { Router, RequestHandler } from 'express';
import {
  getAllJobs,
  getJobById,
  getJobsByCompanyId,
  createJobHandler,
  updateJobHandler,
  deleteJobHandler,
  getSearchSuggestionsHandler,
} from '../controllers/job.controller.js';
import { employerOnly } from '../middleware/role.middleware.js';
import authorize from '../middleware/auth.middleware.js';
import {
  applicationValidation,
  jobValidation,
} from '../middleware/validation/index.js';
import { getAllApplicationsByJobId } from '../controllers/application.controller.js';

const jobRouter = Router();

// Public routes - anyone can view jobs
jobRouter.get('/', jobValidation.getAll, getAllJobs);
jobRouter.get('/suggestions', getSearchSuggestionsHandler);
jobRouter.get(
  '/company/:companyId',
  jobValidation.getByCompanyId,
  getJobsByCompanyId,
);

jobRouter.get('/:id', jobValidation.getById, getJobById);

jobRouter.use(authorize as RequestHandler);
jobRouter.use(employerOnly as RequestHandler);

// Protected routes - only authenticated employers can create/update/delete jobs
jobRouter.get(
  '/:id/applications',
  applicationValidation.getByJobId,
  applicationValidation.getByJobId,
  getAllApplicationsByJobId as RequestHandler,
);
jobRouter.post(
  '/',
  applicationValidation.getByJobId,
  jobValidation.create,
  createJobHandler as RequestHandler,
);
jobRouter.put(
  '/:id',
  applicationValidation.getByJobId,
  jobValidation.update,
  updateJobHandler as RequestHandler,
);
jobRouter.delete(
  '/:id',
  applicationValidation.getByJobId,
  jobValidation.delete,
  deleteJobHandler as RequestHandler,
);

export default jobRouter;
