import { getAllUsers, getUserById } from '../controllers/user.controller.js';
import { RequestHandler, Router } from "express";
import authorize from '../middleware/auth.middleware.js';
import { getCurrentUser } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/me', authorize as RequestHandler, getCurrentUser as RequestHandler);

userRouter.get('/', getAllUsers as RequestHandler);

userRouter.get('/:id', authorize as RequestHandler, getUserById as RequestHandler);

export default userRouter;