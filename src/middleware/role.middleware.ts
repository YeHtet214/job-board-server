import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/users.js';
import { CustomError } from '../types/error.js';
import { UserRole } from '../types/users.js';
import prisma from '../lib/prismaClient.js';

/**
 * Middleware to check if a user has the required role
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export const checkRole = (roles: UserRole[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // User should already be authenticated at this point
      const { userId } = req.user;

      if (!userId) {
        const error = new Error('Authentication required') as CustomError;
        error.status = 401;
        throw error;
      }

      // Fetch the user from the database to get their role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        const error = new Error('User not found') as CustomError;
        error.status = 404;
        throw error;
      }

      if (!roles.includes(user.role)) {
        const error = new Error('You do not have permission to perform this action') as CustomError;
        error.status = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware specifically for employer-only routes
 */
export const employerOnly = checkRole(['EMPLOYER']);

/**
 * Middleware specifically for jobseeker-only routes
 */
export const jobseekerOnly = checkRole(['JOBSEEKER']);
