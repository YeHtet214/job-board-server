import {
  NextFunction,
  RequestHandler,
  Request,
  Response,
  Router,
} from 'express';
import authorize from '../middleware/auth.middleware.js';
import {
  createProfile,
  deleteProfile,
  getProfileById,
  updateProfile,
  uploadProfileImage,
} from '../controllers/profile.controller.js';
import { profileValidation } from '../middleware/validation/index.js';
import { validate } from '../middleware/validation/index.js';
import { uploadMedia, uploadResume } from '../utils/mediaUploadMulter.js';

const profileRouter = Router();

profileRouter.use(authorize as RequestHandler);

function parseProfileFields(req: Request, res: Response, next: NextFunction) {
  ['skills', 'education', 'experience'].forEach((field) => {
    if (typeof req.body[field] === 'string') {
      try {
        const parsedField = JSON.parse(req.body[field]);
        req.body[field] = parsedField;
      } catch (e) {
        console.log(e)
      }
    }
  });
  next();
}

profileRouter.get('/:seekerId', getProfileById as RequestHandler);
profileRouter.post(
  '/me',
  uploadResume.single('resume'),
  parseProfileFields,
  profileValidation.createProfile,
  validate,
  createProfile as RequestHandler,
);
profileRouter.put(
  '/me',
  uploadResume.single('resume'),
  parseProfileFields,
  profileValidation.updateProfile,
  validate,
  updateProfile as RequestHandler,
);
profileRouter.delete('/me', deleteProfile as RequestHandler);

// Add profile image upload endpoint
profileRouter.post(
  '/upload-profile-image',
  uploadMedia.single('image'),
  uploadProfileImage as RequestHandler,
);

export default profileRouter;
