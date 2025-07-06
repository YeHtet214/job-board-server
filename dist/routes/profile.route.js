import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createProfile, deleteProfile, getProfile, updateProfile, uploadResumeFile, uploadProfileImage } from "../controllers/profile.controller.js";
import { profileValidation } from "../middleware/validation/index.js";
import { validate } from "../middleware/validation/index.js";
import { uploadMedia, uploadResume } from "../utils/multer.js";
const profileRouter = Router();
// Profile routes
profileRouter.get('/me', authorize, getProfile);
profileRouter.post('/me', authorize, profileValidation.createProfile, validate, uploadMedia.single('profileImage'), uploadResume.single('resume'), createProfile);
profileRouter.put('/me', authorize, profileValidation.updateProfile, validate, uploadMedia.single('profileImage'), uploadResume.single('resume'), updateProfile);
profileRouter.delete('/me', authorize, deleteProfile);
// Add resume upload endpoint
profileRouter.post('/upload-resume', authorize, profileValidation.createProfile, validate, uploadResume.single('resume'), uploadResumeFile);
// Add profile image upload endpoint
profileRouter.post('/upload-profile-image', authorize, uploadMedia.single('image'), uploadProfileImage);
export default profileRouter;
