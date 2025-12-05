import prisma from '../lib/prismaClient';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CreateProfileDto, UpdateProfileDto, Education, Experience } from '../types/profile';
import { CustomError } from "../types/error";
import { FileURLConstructor } from './resume.service';

// Define a simple file interface that matches the properties we need
interface UploadedFile {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
}

export const fetchProfile = async (userId: string) => {
    const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                }
            },
            resume: true
        }
    });

    const resumeURL = profile?.resume ? FileURLConstructor(profile.resume.fileId, profile.resume.tokenSecret) : null;

    if (profile) {
        const { user, ...profileData } = profile;
        return {
            ...profileData,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            education: profile.education as unknown as Education[],
            experience: profile.experience as unknown as Experience[],
            resumeURL: resumeURL
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

        const profile = await prisma.profile.create({
            data: {
                userId: profileData.userId,
                bio: profileData.bio,
                skills: profileData.skills,
                education: profileData.education as any,
                experience: profileData.experience as any,
                profileImageURL: profileData.profileImageURL,
                resumeFileId: profileData.resumeFileId,
                linkedInUrl: profileData.linkedInUrl,
                githubUrl: profileData.githubUrl,
                portfolioUrl: profileData.portfolioUrl
            },
            include: {
                resume: true
            }
        });

        const resumeURL = profile?.resume ? FileURLConstructor(profile.resume.fileId, profile.resume.tokenSecret) : null;

        // Convert JSON back to typed arrays when returning
        return {
            ...profile,
            resumeURL,
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

        const updateData: any = {};

        // Only include fields that are present in the update data
        if (data.bio) updateData.bio = data.bio;
        if (data.skills) updateData.skills = data.skills;
        if (data.education) updateData.education = data.education as any;
        if (data.experience) updateData.experience = data.experience as any;
        if (data.resumeFileId) updateData.resumeFileId = data.resumeFileId;
        if (data.profileImageURL) updateData.profileImageURL = data.profileImageURL;
        if (data.linkedInUrl) updateData.linkedInUrl = data.linkedInUrl;
        if (data.githubUrl) updateData.githubUrl = data.githubUrl;
        if (data.portfolioUrl) updateData.portfolioUrl = data.portfolioUrl;

        const profile = await prisma.profile.update({
            where: { userId },
            data: updateData,
            include: {
                resume: true
            }
        });

        const resumeURL = profile?.resumeFileId ? FileURLConstructor(profile.resumeFileId, profile?.resume?.tokenSecret || '') : null;

        return {
            ...profile,
            resumeURL,
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
