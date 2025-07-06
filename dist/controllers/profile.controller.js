import { createNewProfile, deleteExistingProfile, fetchProfile, updateExistingProfile } from "../services/profile.service.js";
import { matchedData } from "express-validator";
import { resumeUploadToFirebase, mediaUploadToCloudinary } from "../services/uploadCloud.service.js";
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await fetchProfile(userId);
        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
};
export const createProfile = async (req, res, next) => {
    try {
        const file = req.file;
        const userId = req.user.userId;
        const validatedData = matchedData(req, { locations: ['body'] });
        const profileImageURL = await mediaUploadToCloudinary(file);
        const resumeUrl = await resumeUploadToFirebase(file, userId);
        const profile = await createNewProfile({ ...validatedData, userId, profileImageURL, resumeUrl });
        console.log("Profile created:", profile);
        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        console.log("Resume updated:", req.file);
        const file = req.file;
        const userId = req.user.userId;
        const validatedData = matchedData(req, { locations: ['body'] });
        const profileImageURL = await mediaUploadToCloudinary(file);
        const resumeUrl = await resumeUploadToFirebase(file, userId);
        const profile = await updateExistingProfile(userId, { ...validatedData, profileImageURL, resumeUrl });
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await deleteExistingProfile(userId);
        res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
};
export const uploadResumeFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        console.log("Resume uploaded:", req.file);
        const file = req.file;
        const userId = req.user.userId;
        const resumeUrl = await resumeUploadToFirebase(file, userId);
        res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            data: { url: resumeUrl }
        });
    }
    catch (error) {
        next(error);
    }
};
export const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        console.log("Profile image uploaded:", req.file);
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
        await updateExistingProfile(userId, { profileImageURL });
        res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            data: { url: profileImageURL }
        });
    }
    catch (error) {
        console.error('Error uploading profile image:', error);
        next(error);
    }
};
