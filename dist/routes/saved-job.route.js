import { Router } from "express";
import { getSavedJobsHandler, saveJobHandler, removeSavedJobHandler, isJobSavedHandler, batchCheckSavedJobsHandler } from "../controllers/saved-job.controller.js";
import { jobseekerOnly } from "../middleware/role.middleware.js";
import authorize from "../middleware/auth.middleware.js";
const savedJobRouter = Router();
// All routes require authentication and job seeker role
savedJobRouter.use(authorize);
savedJobRouter.use(jobseekerOnly);
// Get all saved jobs for the current user
savedJobRouter.get('/', getSavedJobsHandler);
// Check if a job is saved by the user
savedJobRouter.get('/check/:jobId', isJobSavedHandler);
// Check if multiple jobs are saved by the user (batch operation)
savedJobRouter.post('/check-batch', batchCheckSavedJobsHandler);
// Save a job
savedJobRouter.post('/', saveJobHandler);
// Remove a saved job
savedJobRouter.delete('/:savedJobId', removeSavedJobHandler);
export default savedJobRouter;
