import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createProfile, deleteProfile, getProfile, updateProfile, uploadResumeFile, uploadProfileImage } from "../controllers/profile.controller.js";
import { profileValidation } from "../middleware/validation/index.js";
import { validate } from "../middleware/validation/index.js";
import { uploadMedia, uploadResume } from "../utils/multer.js";
const profileRouter = Router();
profileRouter.use(authorize);
// Profile routes
profileRouter.get('/me', getProfile);
profileRouter.post('/me', profileValidation.createProfile, validate, uploadMedia.single('profileImage'), uploadResume.single('resume'), createProfile);
profileRouter.put('/me', profileValidation.updateProfile, validate, uploadMedia.single('profileImage'), uploadResume.single('resume'), updateProfile);
profileRouter.delete('/me', deleteProfile);
// Add resume upload endpoint
profileRouter.post('/upload-resume', profileValidation.createProfile, validate, uploadResume.single('resume'), uploadResumeFile);
// Add profile image upload endpoint
profileRouter.post('/upload-profile-image', uploadMedia.single('image'), uploadProfileImage);
export default profileRouter;
