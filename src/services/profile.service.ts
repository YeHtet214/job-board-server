import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CreateProfileDto, UpdateProfileDto, Education, Experience } from '@/types/profile';
import { CustomError } from "@/types/error";

const prisma = new PrismaClient();

// Define a simple file interface that matches the properties we need
interface UploadedFile {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
}

export const fetchProfile = async (userId: string) => {
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (profile) {
        // Convert JSON back to typed arrays when returning
        return {
            ...profile,
            education: profile.education as unknown as Education[],
            experience: profile.experience as unknown as Experience[]
        };
    }

    return profile;
}

export const createNewProfile = async (profileData: CreateProfileDto) => {
    try {
        const existingProfile = await fetchProfile(profileData.userId);

        if (existingProfile) {
            return updateExistingProfile(profileData.userId, profileData);
        }

        // Create a new profile with properly serialized JSON fields
        const profile = await prisma.profile.create({
            data: {
                userId: profileData.userId,
                bio: profileData.bio,
                skills: profileData.skills,
                education: profileData.education as any,
                experience: profileData.experience as any,
                resumeUrl: profileData.resumeUrl,
                profileImageURL: profileData.profileImageURL,
                linkedInUrl: profileData.linkedInUrl,
                githubUrl: profileData.githubUrl,
                portfolioUrl: profileData.portfolioUrl
            }
        });

        // Convert JSON back to typed arrays when returning
        return {
            ...profile,
            education: profile.education as unknown as Education[],
            experience: profile.experience as unknown as Experience[]
        };
    } catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to create profile') as CustomError;
        customError.status = 400;
        throw customError;
    }
}

export const updateExistingProfile = async (userId: string, data: UpdateProfileDto) => {
    try {
        const existingProfile = await fetchProfile(userId);

        if (!existingProfile) {
            const error = new Error("Profile not found") as CustomError;
            error.status = 404;
            throw error;
        }

        // Prepare update data with proper handling of JSON fields
        const updateData: any = {};
        
        // Only include fields that are present in the update data
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.skills !== undefined) updateData.skills = data.skills;
        if (data.education !== undefined) updateData.education = data.education as any;
        if (data.experience !== undefined) updateData.experience = data.experience as any;
        if (data.resumeUrl !== undefined) updateData.resumeUrl = data.resumeUrl;
        if (data.profileImageURL !== undefined) updateData.profileImageURL = data.profileImageURL;
        if (data.linkedInUrl !== undefined) updateData.linkedInUrl = data.linkedInUrl;
        if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
        if (data.portfolioUrl !== undefined) updateData.portfolioUrl = data.portfolioUrl;


        const profile = await prisma.profile.update({
            where: { userId },
            data: updateData
        });

        // Convert JSON back to typed arrays when returning
        return {
            ...profile,
            education: profile.education as unknown as Education[],
            experience: profile.experience as unknown as Experience[]
        };
    } catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to update profile') as CustomError;
        customError.status = 400;
        throw customError;
    }
}

export const deleteExistingProfile = async (userId: string) => {
    const existingProfile = await fetchProfile(userId);

    if (!existingProfile) {
        const error = new Error("Profile not found") as CustomError;
        error.status = 404;
        throw error;
    }

    const profile = await prisma.profile.delete({ where: { userId } });
    return profile;
}

export const uploadResume = async (userId: string, file: any): Promise<string> => {
    try {
        // Check if profile exists
        const existingProfile = await fetchProfile(userId);
        if (!existingProfile) {
            const error = new Error("Profile not found") as CustomError;
            error.status = 404;
            throw error;
        }

        // Validate file
        if (!file) {
            const error = new Error("No file provided") as CustomError;
            error.status = 400;
            throw error;
        }

        // Validate file type
        const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            const error = new Error("Only PDF and Word documents are allowed") as CustomError;
            error.status = 400;
            throw error;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            const error = new Error("File size exceeds 5MB limit") as CustomError;
            error.status = 400;
            throw error;
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        const userUploadsDir = path.join(uploadsDir, 'resumes', userId);

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        if (!fs.existsSync(path.join(uploadsDir, 'resumes'))) {
            fs.mkdirSync(path.join(uploadsDir, 'resumes'), { recursive: true });
        }

        if (!fs.existsSync(userUploadsDir)) {
            fs.mkdirSync(userUploadsDir, { recursive: true });
        }

        // Generate unique filename using crypto instead of uuid
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const filePath = path.join(userUploadsDir, fileName);

        // Write file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Generate URL for the file
        const resumeUrl = `/uploads/resumes/${userId}/${fileName}`;

        // Update user profile with resume URL
        await prisma.profile.update({
            where: { userId },
            data: { resumeUrl }
        });

        return resumeUrl;
    } catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to upload resume') as CustomError;
        customError.status = 400;
        throw customError;
    }
}