import prisma from '@/prisma/client.js';
import { NotFoundError, UnauthorizedError } from '@/middleware/errorHandler.js';

/**
 * Gets saved jobs for a user
 * @param userId The user ID
 * @returns Array of saved jobs with details
 */
export const getSavedJobsForUser = async (userId: string) => {
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
export const removeSavedJobForUser = async (savedJobId: string, userId: string) => {
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
export const saveJobForUser = async (jobId: string, userId: string) => {
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
