import prisma from '../../prisma/client.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../middleware/errorHandler.js';
/**
 * Gets saved jobs for a user
 * @param userId The user ID
 * @returns Array of saved jobs with details
 */
export const getSavedJobs = async (userId) => {
    if (!userId) {
        throw new UnauthorizedError('Not authenticated');
    }
    return prisma.savedJob.findMany({
        where: { userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    location: true,
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
        orderBy: { createdAt: 'desc' }
    });
};
/**
 * Removes a saved job for a user
 * @param savedJobId The saved job ID to remove
 * @param userId The user ID
 */
export const removeSavedJob = async (savedJobId, userId) => {
    if (!userId) {
        throw new UnauthorizedError('Not authenticated');
    }
    if (!savedJobId) {
        throw new BadRequestError('Saved job ID is required');
    }
    const savedJob = await prisma.savedJob.findUnique({
        where: { id: savedJobId },
        select: { userId: true }
    });
    if (!savedJob) {
        throw new NotFoundError('Saved job not found');
    }
    if (savedJob.userId !== userId) {
        throw new UnauthorizedError('Not authorized to remove this saved job');
    }
    return prisma.savedJob.delete({
        where: { id: savedJobId }
    });
};
/**
 * Saves a job for a user
 * @param jobId The job ID to save
 * @param userId The user ID
 */
export const saveJob = async (jobId, userId) => {
    if (!userId) {
        throw new UnauthorizedError('Not authenticated');
    }
    if (!jobId) {
        throw new BadRequestError('Job ID is required');
    }
    // Check if job exists
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true }
    });
    if (!job) {
        throw new NotFoundError('Job not found');
    }
    // Check if already saved
    const existingSave = await prisma.savedJob.findFirst({
        where: {
            jobId,
            userId
        }
    });
    if (existingSave) {
        return existingSave;
    }
    // Create new saved job
    return prisma.savedJob.create({
        data: {
            jobId,
            userId
        }
    });
};
/**
 * Check if job is saved by the user
 * @param jobId The job ID to check
 * @param userId The user ID
 * @returns The saved job record or null if not saved
 */
export const isJobSaved = async (jobId, userId) => {
    if (!userId) {
        throw new UnauthorizedError('Not authenticated');
    }
    if (!jobId) {
        throw new BadRequestError('Job ID is required');
    }
    return await prisma.savedJob.findFirst({
        where: {
            jobId,
            userId
        }
    });
};
/**
 * Check if multiple jobs are saved by the user in a single query
 * @param jobIds Array of job IDs to check
 * @param userId The user ID
 * @returns Object mapping job IDs to their saved status
 */
export const areJobsSaved = async (jobIds, userId) => {
    if (!userId) {
        throw new UnauthorizedError('Not authenticated');
    }
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        throw new BadRequestError('Valid array of job IDs is required');
    }
    // Deduplicate job IDs
    const uniqueJobIds = [...new Set(jobIds)];
    // Get all saved jobs for the user that match the provided job IDs
    const savedJobs = await prisma.savedJob.findMany({
        where: {
            userId,
            jobId: {
                in: uniqueJobIds
            }
        },
        select: {
            id: true,
            jobId: true
        }
    });
    // Create a map for quick lookup
    const savedJobsMap = savedJobs.reduce((map, savedJob) => {
        map[savedJob.jobId] = savedJob.id;
        return map;
    }, {});
    // Create the result object with isSaved status for each job ID
    const result = {};
    uniqueJobIds.forEach(jobId => {
        result[jobId] = {
            isSaved: !!savedJobsMap[jobId],
            savedJobId: savedJobsMap[jobId] || null
        };
    });
    return result;
};
