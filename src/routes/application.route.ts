import { NextFunction, Router, Response, RequestHandler } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createNewApplication, deleteApplication, getAllApplicationsByJobId, getAllApplicationsByUserId, getApplicationById, updateApplication } from "../controllers/application.controller.js";
import { applicationValidation } from "../middleware/validation/application.validation.js";
import { uploadResume } from "../utils/multer.js";
import { RequestWithUser } from "../types/users.type.js";

const applicationRouter = Router();

applicationRouter.use(authorize as RequestHandler);

applicationRouter.get('/users/:userId', getAllApplicationsByUserId as RequestHandler);

applicationRouter.get('/:id', applicationValidation.getById, getApplicationById as RequestHandler);

applicationRouter.post('/jobs/:jobId', uploadResume.single('resume'), applicationValidation.create, createNewApplication as RequestHandler);

applicationRouter.put('/:id', uploadResume.single('resume'), applicationValidation.update, updateApplication as RequestHandler);

applicationRouter.delete('/:id', applicationValidation.delete, deleteApplication as RequestHandler);

export default applicationRouter;