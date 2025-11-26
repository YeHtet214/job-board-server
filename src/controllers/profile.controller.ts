import { NextFunction, Response } from "express";
import { createNewProfile, deleteExistingProfile, fetchProfile, updateExistingProfile } from "../services/profile.service.js";
import { RequestWithUser } from "../types/users.js";
import { matchedData } from "express-validator";
import { CreateProfileDto, UpdateProfileDto } from "../types/profile.js";
import { resumeUploadToFirebase, mediaUploadToCloudinary } from "../services/uploadCloud.service.js";

export const getProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const profile = await fetchProfile(userId);

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
}

export const createProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        const userId = req.user.userId;
        const validatedData = matchedData(req, { locations: ['body'] });
        const profileImageURL = await mediaUploadToCloudinary(file);
        const resumeUrl = await resumeUploadToFirebase(file, userId);

        if (validatedData.hasOwnProperty('userId')) delete validatedData.userId;

        const profile = await createNewProfile({ ...validatedData, userId, profileImageURL, resumeUrl } as CreateProfileDto);

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            data: profile
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const updateProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {

        const file = req.file;
        const userId = req.user.userId;
        const validatedData = matchedData(req, { locations: ['body'] });
        const profileImageURL = await mediaUploadToCloudinary(file);
        const resumeUrl = await resumeUploadToFirebase(file, userId);

        const profile = await updateExistingProfile(userId, { ...validatedData, profileImageURL, resumeUrl } as UpdateProfileDto);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
}

export const deleteProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const profile = await deleteExistingProfile(userId);

        res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
}

export const uploadResumeFile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const file = req.file;
        const userId = req.user.userId;
        const resumeUrl = await resumeUploadToFirebase(file, userId);

        res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            data: { url: resumeUrl }
        });
    } catch (error) {
        next(error);
    }
}

export const uploadProfileImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const file = req.file;
        const userId = req.user.userId;
        
        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: "Only image files are allowed"
            });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: "Image size should be less than 5MB"
            });
        }

        const profileImageURL = await mediaUploadToCloudinary(file);
        
        // Update the user's profile with the new image URL
        await updateExistingProfile(userId, { profileImageURL } as UpdateProfileDto);

        res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            data: { url: profileImageURL }
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        next(error);
    }
}