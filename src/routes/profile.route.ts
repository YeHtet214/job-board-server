import { RequestHandler, Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createProfile, deleteProfile, getProfile, updateProfile, uploadResumeFile, uploadProfileImage } from "../controllers/profile.controller.js";
import { profileValidation } from "../middleware/validation/index.js";
import { validate } from "../middleware/validation/index.js";
import { uploadMedia, uploadResume } from "../utils/multer.js";

const profileRouter = Router();
profileRouter.use(authorize as RequestHandler);

// Profile routes
profileRouter.get('/me', getProfile as RequestHandler);
profileRouter.post('/me', profileValidation.createProfile, validate, uploadMedia.single('profileImage'), uploadResume.single('resume'), createProfile as RequestHandler);
profileRouter.put('/me', profileValidation.updateProfile, validate, uploadMedia.single('profileImage'), uploadResume.single('resume'), updateProfile as RequestHandler);
profileRouter.delete('/me', deleteProfile as RequestHandler);

// Add resume upload endpoint
profileRouter.post('/upload-resume', profileValidation.createProfile, validate, uploadResume.single('resume'), uploadResumeFile as RequestHandler);

// Add profile image upload endpoint
profileRouter.post('/upload-profile-image', uploadMedia.single('image'), uploadProfileImage as RequestHandler);

export default profileRouter;