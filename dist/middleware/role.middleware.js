import { UserRole } from '@prisma/client';
import prisma from '../prisma/client.js';
/**
 * Middleware to check if a user has the required role
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            // User should already be authenticated at this point
            const { userId } = req.user;
            if (!userId) {
                const error = new Error('Authentication required');
                error.status = 401;
                throw error;
            }
            // Fetch the user from the database to get their role
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });
            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }
            if (!roles.includes(user.role)) {
                const error = new Error('You do not have permission to perform this action');
                error.status = 403;
                throw error;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Middleware specifically for employer-only routes
 */
export const employerOnly = checkRole([UserRole.EMPLOYER]);
/**
 * Middleware specifically for jobseeker-only routes
 */
export const jobseekerOnly = checkRole([UserRole.JOBSEEKER]);
