import prisma from '../../prisma/client.js';
import { NotFoundError } from '../../middleware/errorHandler.js';
/**
 * Records a job view by a user, avoiding duplicate recent views
 * @param jobId The ID of the job being viewed
 * @param userId The ID of the user viewing the job
 * @returns The created JobView record or null if it's a duplicate
 */
export const recordJobView = async (jobId, userId) => {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true }
    });
    if (!job) {
        throw new NotFoundError('Job not found');
    }
    // Check if this user has viewed this job in the last 24 hours
    const recentView = await prisma.jobView.findFirst({
        where: {
            jobId,
            userId,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
    });
    // If already viewed recently, don't create duplicate record
    if (recentView) {
        return null;
    }
    return prisma.jobView.create({
        data: {
            jobId,
            userId
        }
    });
};
/**
 * Gets recent job views for a user
 * @param userId The ID of the user
 * @param limit Maximum number of views to return
 * @returns Array of recent job views
 */
export const getRecentJobViews = async (userId, limit = 5) => {
    return prisma.jobView.findMany({
        where: { userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
};
/**
 * Cleans up old job view records
 * @param daysToKeep Number of days of data to retain
 * @returns Count of deleted records
 */
export const cleanupOldJobViews = async (daysToKeep = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const result = await prisma.jobView.deleteMany({
        where: {
            createdAt: { lt: cutoffDate }
        }
    });
    return result.count;
};
