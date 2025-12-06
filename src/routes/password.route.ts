import { Router, RequestHandler } from 'express';
import {
  setPassword,
  updatePassword,
  checkPasswordStatus,
} from '../controllers/password.controller';
import authorize from '../middleware/auth.middleware';

const passwordRouter = Router();

passwordRouter.use(authorize as RequestHandler);

passwordRouter.get('/status', checkPasswordStatus as RequestHandler);

// Set password for OAuth users (first time)
passwordRouter.post('/set', setPassword as RequestHandler);

passwordRouter.put('/change', updatePassword as RequestHandler);

export default passwordRouter;
