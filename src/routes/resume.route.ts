import { Router, RequestHandler } from "express";
import { viewResume } from "../controllers/resume.controller";
import { uploadResume } from "../utils/mediaUploadMulter";
import { uploadResumeFile } from "../controllers/resume.controller";
import authorize from "../middleware/auth.middleware";

const resumeRouter = Router();

resumeRouter.use(authorize as RequestHandler)

resumeRouter.get('/:fileId/view', viewResume as RequestHandler);
resumeRouter.post(
  '/upload',
  uploadResume.single('resume'),
  uploadResumeFile as RequestHandler,
);
export default resumeRouter;
