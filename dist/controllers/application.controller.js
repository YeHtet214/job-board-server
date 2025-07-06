import { fetchAllApplicationsByJobId, fetchApplicationById, postNewApplication, updateApplicationById, deleteExistingApplication, fetchAllApplicationsByUserId } from "../services/application/application.service.js";
import { matchedData } from "express-validator";
import { resumeUploadToFirebase } from "../services/uploadCloud.service.js";
export const getAllApplicationsByUserId = async (req, res, next) => {
    try {
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const userId = req.user.userId;
        const applications = await fetchAllApplicationsByUserId(userId);
        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAllApplicationsByJobId = async (req, res, next) => {
    try {
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const jobId = validatedData.jobId;
        const applications = await fetchAllApplicationsByJobId(jobId);
        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });
    }
    catch (error) {
        next(error);
    }
};
export const getApplicationById = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const createNewApplication = async (req, res, next) => {
    try {
        // Get validated data
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const file = req.file;
        const userId = req.user.userId;
        const resumeURL = await resumeUploadToFirebase(file, userId);
        const applicantId = req.user.userId;
        console.log("Resume URL from firebase : ", resumeURL);
        console.log("Validated Data: ", validatedData);
        const application = await postNewApplication({ ...validatedData, resumeUrl: resumeURL, applicantId });
        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: application
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateApplication = async (req, res, next) => {
    try {
        // Get validated data
        const validatedData = matchedData(req, { locations: ['params', 'body'] });
        const resumeUrl = await resumeUploadToFirebase(req.file, req.user.userId);
        const applicantId = req.user.userId;
        console.log("Validated Data: ", validatedData);
        console.log("body: ", req.body);
        const applicationData = {
            id: validatedData.id,
            resumeUrl: validatedData.resumeUrl,
            coverLetter: validatedData.coverLetter,
            status: validatedData.status
        };
        const application = await updateApplicationById({ ...applicationData, applicantId });
        res.status(200).json({
            success: true,
            message: "Application updated successfully",
            data: application
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteApplication = async (req, res, next) => {
    try {
        // Get validated data
        const validatedData = matchedData(req);
        const id = validatedData.id;
        const deletedApplication = await deleteExistingApplication(id);
        res.status(200).json({
            success: true,
            message: 'Application deleted successfully',
            data: deletedApplication
        });
    }
    catch (error) {
        next(error);
    }
};
