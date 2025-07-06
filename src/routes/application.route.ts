import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createNewApplication, deleteApplication, getAllApplicationsByJobId, getAllApplicationsByUserId, getApplicationById, updateApplication } from "../controllers/application.controller.js";
import { applicationValidation } from "../middleware/validation/application.validation.js";
import { uploadResume } from "../utils/multer.js";

const applicationRouter = Router();

applicationRouter.get('/users/:userId', authorize, getAllApplicationsByUserId);

applicationRouter.get('/:id', authorize, applicationValidation.getById, getApplicationById);

applicationRouter.post('/jobs/:jobId', authorize, uploadResume.single('resume'), applicationValidation.create, createNewApplication);

applicationRouter.put('/:id', authorize, uploadResume.single('resume'), applicationValidation.update, updateApplication);

applicationRouter.delete('/:id', authorize, applicationValidation.delete, deleteApplication);

export default applicationRouter;