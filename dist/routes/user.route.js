import { getAllUsers, getUserById } from '../controllers/user.controller.js';
import { Router } from "express";
import authorize from '../middleware/auth.middleware.js';
import { getCurrentUser } from '../controllers/user.controller.js';
const userRouter = Router();
userRouter.get('/me', authorize, getCurrentUser);
userRouter.get('/', getAllUsers);
userRouter.get('/:id', authorize, getUserById);
export default userRouter;
