import { Request, Response, NextFunction } from 'express';
import { 
    fetchAllJobs, 
    fetchJobById, 
    fetchJobsByCompanyId, 
    createJob, 
    updateJob, 
    deleteExistingJob,
    JobSearchParams,
    getSearchSuggestions
} from '../services/job/job.service.js';
import { RequestWithUser } from '../types/users.type.js';
import prisma from '../prisma/client.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { JobType } from '../types/job.type.js';

// Public controllers - no authentication required
export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract search parameters from query
        const { 
            keyword, 
            location, 
            jobTypes, 
            experienceLevel, 
            page, 
            limit, 
            sortBy 
        } = req.query;
        
        // Parse and prepare search params
        const searchParams: JobSearchParams = {
            keyword: keyword as string,
            location: location as string,
            jobTypes: jobTypes as JobType[],
            experienceLevel: experienceLevel as string,
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10,
            sortBy: sortBy as string
        };
        
        // Fetch jobs with search parameters
        const jobsData = await fetchAllJobs(searchParams);
        
        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobsData
        });
    } catch (error) {
        next(error);
    }
}

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const job = await fetchJobById(id);
        
        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job
        });
    } catch (error) {
        next(error);
    }
}

export const getJobsByCompanyId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyId = req.params.companyId;
        
        // Extract pagination and sorting parameters
        const { page, limit, sortBy } = req.query;
        
        // Parse and prepare search params
        const searchParams: JobSearchParams = {
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10,
            sortBy: sortBy as string
        };
        
        const jobsData = await fetchJobsByCompanyId(companyId, searchParams);
        
        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobsData
        });
    } catch (error) {
        next(error);
    }
}

export const getSearchSuggestionsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { term, type, limit } = req.query;
        
        if (!term) {
            throw new BadRequestError("Search term is required");
        }
        
        const suggestions = await getSearchSuggestions(
            term as string,
            (type as 'keyword' | 'location' | 'all') || 'all',
            limit ? parseInt(limit as string, 10) : 5
        );
        
        res.status(200).json({
            success: true,
            message: "Search suggestions fetched successfully",
            data: suggestions
        });
    } catch (error) {
        next(error);
    }
}

// Protected controllers - authentication required
export const createJobHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        
        // Fetch the user's company
        const company = await prisma.company.findFirst({
            where: { ownerId: userId },
            select: { id: true }
        });
        
        if (!company) {
            throw new BadRequestError("You need to create a company before posting a job");
        }
        
        // Pass request body, user ID, and company ID to the service
        const newJob = await createJob({
            ...req.body,
            postedById: userId,
            companyId: company.id
        });
        
        res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: newJob
        });
    } catch (error) {
        next(error);
    }
}

export const updateJobHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const jobId = req.params.id;
        
        // Pass job ID, update data, and user ID to the service
        const updatedJob = await updateJob(jobId, req.body, req.user.userId);
        
        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: updatedJob
        });
    } catch (error) {
        next(error);
    }
}

export const deleteJobHandler = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;

        const deletedJob = await deleteExistingJob(id, req.user.userId);

        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
            data: deletedJob
        });
    } catch (error) {
        next(error);
    }
}