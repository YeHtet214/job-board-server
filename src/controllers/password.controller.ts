import { Request, Response, NextFunction } from 'express';
import {
  setPasswordForOAuthUser,
  changePassword,
  hasPassword,
} from '../services/password.service';
import { RequestWithUser } from '../types/users';

/**
 * Set password for OAuth users who don't have a password yet
 */
export const setPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedReq = req as RequestWithUser;
    const userId = authenticatedReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { password } = req.body;

    const result = await setPasswordForOAuthUser(userId, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Change password for users who already have a password
 */
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedReq = req as RequestWithUser;
    const userId = authenticatedReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    const result = await changePassword(userId, currentPassword, newPassword);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const checkPasswordStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authenticatedReq = req as RequestWithUser;
    const userId = authenticatedReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const passwordExists = await hasPassword(userId);

    res.status(200).json({ hasPassword: passwordExists });
  } catch (error) {
    next(error);
  }
};
