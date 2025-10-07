import {
  NextFunction,
  RequestHandler,
  Request,
  Response,
  Router,
} from 'express';
import multer from 'multer';
import authorize from '../middleware/auth.middleware.js';
import {
  createProfile,
  deleteProfile,
  getProfile,
  updateProfile,
  uploadResumeFile,
  uploadProfileImage,
} from '../controllers/profile.controller.js';
import { profileValidation } from '../middleware/validation/index.js';
import { validate } from '../middleware/validation/index.js';
import { uploadMedia, uploadResume } from '../utils/mediaUploadMulter.js';

const profileRouter = Router();
const upload = multer();

profileRouter.use(authorize as RequestHandler);

function parseProfileFields(req: Request, res: Response, next: NextFunction) {
  ['skills', 'education', 'experience'].forEach((field) => {
    if (typeof req.body[field] === 'string') {
      try {
        const parsedField = JSON.parse(req.body[field]);
        req.body[field] = parsedField;
      } catch (e) {
        // Optionally handle JSON parse error
      }
    }
  });
  next();
}

// Profile routes
profileRouter.get('/me', getProfile as RequestHandler);
// profileRouter.post('/me',uploadMedia.single('profileImage'), uploadResume.single('resume'), parseProfileFields , profileValidation.createProfile, validate,  createProfile as RequestHandler);
profileRouter.post(
  '/me',
  upload.any(),
  parseProfileFields,
  profileValidation.createProfile,
  validate,
  createProfile as RequestHandler,
);
profileRouter.put(
  '/me',
  upload.any(),
  parseProfileFields,
  profileValidation.updateProfile,
  validate,
  updateProfile as RequestHandler,
);
profileRouter.delete('/me', deleteProfile as RequestHandler);

// Add resume upload endpoint
profileRouter.post(
  '/upload-resume',
  profileValidation.createProfile,
  validate,
  uploadResume.single('resume'),
  uploadResumeFile as RequestHandler,
);

// Add profile image upload endpoint
profileRouter.post(
  '/upload-profile-image',
  uploadMedia.single('image'),
  uploadProfileImage as RequestHandler,
);

export default profileRouter;
