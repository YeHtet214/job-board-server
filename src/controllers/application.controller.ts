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
import { resumeUploadToFirebase } from "../services/uploadCloud.service.js";

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
        // Get validated data
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const file = req.file;
        const userId = req.user.userId;
        const resumeURL = await resumeUploadToFirebase(file, userId);
        const applicantId = req.user.userId;

        const application = await postNewApplication({ ...validatedData, resumeUrl: resumeURL, applicantId } as createApplicationDto);

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
        const resumeUrl = await resumeUploadToFirebase(req.file, req.user.userId);
        const applicantId = req.user.userId;

        const applicationData: updateApplicationDto = {
            id: validatedData.id,
            resumeUrl: validatedData.resumeUrl,
            coverLetter: validatedData.coverLetter,
            status: validatedData.status
        }

        const application = await updateApplicationById({ ...applicationData, applicantId } as updateApplicationDto);

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