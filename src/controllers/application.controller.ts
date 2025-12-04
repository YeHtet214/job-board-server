import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types/users.js";
import { createApplicationDto, updateApplicationDto } from "../types/applicaton.js";
import {
    fetchAllApplicationsByJobId,
    fetchApplicationById,
    postNewApplication,
    updateApplicationById,
    deleteExistingApplication,
    fetchAllApplicationsByUserId
} from "../services/application/application.service.js";
import { matchedData } from "express-validator";
import { resumeUploadToAppwrite } from "../services/uploadCloud.service.js";
import { NotiType } from "@prisma/client";

export const getAllApplicationsByUserId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const userId = req.user.userId;

        const applications = await fetchAllApplicationsByUserId(userId);

        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });
    } catch (error) {
        next(error);
    }
}

export const getAllApplicationsByJobId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const jobId = validatedData.jobId;

        const applications = await fetchAllApplicationsByJobId(jobId);

        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });
    } catch (error) {
        next(error);
    }
}



export const getApplicationById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        // Get validated data
        const validatedData = matchedData(req);
        const id = validatedData.id;

        const application = await fetchApplicationById(id);

        res.status(200).json({
            success: true,
            message: "Application fetched successfully",
            data: application
        });
    } catch (error) {
        next(error);
    }
}

export const createNewApplication = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const file = req.file;
        const { fileId } = await resumeUploadToAppwrite(file);
        const applicantId = req.user.userId;

        const { application, job } = await postNewApplication({ ...validatedData, resumeFileId: fileId, applicantId } as createApplicationDto, req.user);

        // Emit real-time notification via Socket.IO to employer
        const io = req.app.get('io');
        if (io && application && job) {
            const employerId = job.postedById;

            // Emit to employer's personal room
            io.to(employerId).emit('notification:application', {
                type: NotiType.Job_Application,
                applicationId: application.id,
                jobId: application.jobId,
                title: 'Got New Application',
                snippet: `${req.user.userName} applied for ${job.title}`,
                applicantName: `${req.user.userName}`,
                createdAt: application.createdAt,
            });
        }

        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: application
        });
    } catch (error) {
        next(error);
    }
}

export const updateApplication = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        // Get validated data
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const { fileId } = await resumeUploadToAppwrite(req.file);
        const applicantId = req.user.userId;

        const applicationData: updateApplicationDto = {
            id: validatedData.id,
            resumeFileId: fileId,
            coverLetter: validatedData.coverLetter,
            status: validatedData.status
        }

        const { application, statusChanged, job } = await updateApplicationById({ ...applicationData, applicantId } as updateApplicationDto);

        // Emit real-time notification if status changed
        if (statusChanged) {
            const io = req.app.get('io');
            if (io && application) {
                // Emit to applicant's personal room
                io.to(application.applicantId).emit('notification:application', {
                    type: NotiType.Application_Status_Update,
                    applicationId: application.id,
                    jobId: application.jobId,
                    status: application.status,
                    title: 'Your application status has been updated',
                    snippet: `The job applied for ${job.title} is ${application.status}`,
                    createdAt: new Date(),
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Application updated successfully",
            data: application
        });
    } catch (error) {
        next(error);
    }
}

export const deleteApplication = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        // Get validated data
        const validatedData = matchedData(req);
        const id = validatedData.id;

        const deletedApplication = await deleteExistingApplication(id);

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully',
            data: deletedApplication
        })
    } catch (error) {
        next(error);
    }
}