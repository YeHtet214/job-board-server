import { Router } from "express";
import { getAllJobs, getJobById, getJobsByCompanyId, createJobHandler, updateJobHandler, deleteJobHandler, getSearchSuggestionsHandler } from "../controllers/job.controller.js";
import { employerOnly } from "../middleware/role.middleware.js";
import authorize from "../middleware/auth.middleware.js";
import { applicationValidation, jobValidation } from "../middleware/validation/index.js";
import { getAllApplicationsByJobId } from "../controllers/application.controller.js";
const jobRouter = Router();
jobRouter.use(authorize);
jobRouter.use(employerOnly);
// Public routes - anyone can view jobs
jobRouter.get('/', jobValidation.getAll, getAllJobs);
// The suggestions route must come before the :id route to avoid being treated as an ID parameter
jobRouter.get('/suggestions', getSearchSuggestionsHandler);
jobRouter.get('/company/:companyId', jobValidation.getByCompanyId, getJobsByCompanyId);
jobRouter.get('/:id', jobValidation.getById, getJobById);
// Protected routes - only authenticated employers can create/update/delete jobs
jobRouter.get('/:id/applications', applicationValidation.getByJobId, applicationValidation.getByJobId, getAllApplicationsByJobId);
jobRouter.post('/', applicationValidation.getByJobId, jobValidation.create, createJobHandler);
jobRouter.put('/:id', applicationValidation.getByJobId, jobValidation.update, updateJobHandler);
jobRouter.delete('/:id', applicationValidation.getByJobId, jobValidation.delete, deleteJobHandler);
export default jobRouter;
