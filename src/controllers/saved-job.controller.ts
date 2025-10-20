import { NextFunction, Response } from 'express';
import { getSavedJobs, saveJob, removeSavedJob, isJobSaved, areJobsSaved } from '../services/job/saved-job.service.js';
import { RequestWithUser } from '../types/users.js';

/**
 * Get all saved jobs for the current user
 */
export const getSavedJobsHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    console.log("User id in getSavedJobsHanlder: ", userId);

    const savedJobs = await getSavedJobs(userId);
    res.status(200).json({
      success: true,
      message: 'Successfully fetched saved jobs',
      data: savedJobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save a job for the current user
 */
export const saveJobHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    console.log("user id in save job handler: ", userId);

    const result = await saveJob(jobId, userId);
    console.log("Job saving result: ", result);
    res.status(201).json({
      success: true,
      message: 'Job has been successfully saved',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a saved job for the current user
 */
export const removeSavedJobHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { savedJobId } = req.params;

    const removedJob = await removeSavedJob(savedJobId, userId);
    res.status(200).json({ 
      success: true,
      message: 'Job removed from saved jobs',
      data: removedJob 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a job is saved by the current user
 */
export const isJobSavedHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;

    console.log("User id in isJobSaved handler: ", userId);

    const savedJob = await isJobSaved(jobId, userId);

    console.log("Is job saved result: ", savedJob)

    res.status(200).json({ 
      success: true,
      message: 'Job saved status retrieved successfully',
      data: {
        isSaved: !!savedJob,
        savedJobId: savedJob?.id || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if multiple jobs are saved by the current user
 */
export const batchCheckSavedJobsHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { jobIds } = req.body;

    console.log("User id in batch: ", userId)

    const savedJobsStatus = await areJobsSaved(jobIds, userId);

    console.log("Saved Jobs Status: ", savedJobsStatus);

    res.status(200).json({ 
      success: true,
      message: 'Batch job saved status retrieved successfully',
      data: savedJobsStatus
    });
  } catch (error) {
    next(error);
  }
};
