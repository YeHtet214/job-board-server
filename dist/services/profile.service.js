"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = exports.deleteExistingProfile = exports.updateExistingProfile = exports.createNewProfile = exports.fetchProfile = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const fetchProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma.profile.findUnique({ where: { userId } });
    if (profile) {
        // Convert JSON back to typed arrays when returning
        return Object.assign(Object.assign({}, profile), { education: profile.education, experience: profile.experience });
    }
    return profile;
});
exports.fetchProfile = fetchProfile;
const createNewProfile = (profileData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingProfile = yield (0, exports.fetchProfile)(profileData.userId);
        if (existingProfile) {
            return (0, exports.updateExistingProfile)(profileData.userId, profileData);
        }
        // Create a new profile with properly serialized JSON fields
        const profile = yield prisma.profile.create({
            data: {
                userId: profileData.userId,
                bio: profileData.bio,
                skills: profileData.skills,
                education: profileData.education,
                experience: profileData.experience,
                resumeUrl: profileData.resumeUrl,
                profileImageURL: profileData.profileImageURL,
                linkedInUrl: profileData.linkedInUrl,
                githubUrl: profileData.githubUrl,
                portfolioUrl: profileData.portfolioUrl
            }
        });
        // Convert JSON back to typed arrays when returning
        return Object.assign(Object.assign({}, profile), { education: profile.education, experience: profile.experience });
    }
    catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to create profile');
        customError.status = 400;
        throw customError;
    }
});
exports.createNewProfile = createNewProfile;
const updateExistingProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingProfile = yield (0, exports.fetchProfile)(userId);
        if (!existingProfile) {
            const error = new Error("Profile not found");
            error.status = 404;
            throw error;
        }
        // Prepare update data with proper handling of JSON fields
        const updateData = {};
        // Only include fields that are present in the update data
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.skills !== undefined)
            updateData.skills = data.skills;
        if (data.education !== undefined)
            updateData.education = data.education;
        if (data.experience !== undefined)
            updateData.experience = data.experience;
        if (data.resumeUrl !== undefined)
            updateData.resumeUrl = data.resumeUrl;
        if (data.profileImageURL !== undefined)
            updateData.profileImageURL = data.profileImageURL;
        if (data.linkedInUrl !== undefined)
            updateData.linkedInUrl = data.linkedInUrl;
        if (data.githubUrl !== undefined)
            updateData.githubUrl = data.githubUrl;
        if (data.portfolioUrl !== undefined)
            updateData.portfolioUrl = data.portfolioUrl;
        const profile = yield prisma.profile.update({
            where: { userId },
            data: updateData
        });
        // Convert JSON back to typed arrays when returning
        return Object.assign(Object.assign({}, profile), { education: profile.education, experience: profile.experience });
    }
    catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to update profile');
        customError.status = 400;
        throw customError;
    }
});
exports.updateExistingProfile = updateExistingProfile;
const deleteExistingProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProfile = yield (0, exports.fetchProfile)(userId);
    if (!existingProfile) {
        const error = new Error("Profile not found");
        error.status = 404;
        throw error;
    }
    const profile = yield prisma.profile.delete({ where: { userId } });
    return profile;
});
exports.deleteExistingProfile = deleteExistingProfile;
const uploadResume = (userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if profile exists
        const existingProfile = yield (0, exports.fetchProfile)(userId);
        if (!existingProfile) {
            const error = new Error("Profile not found");
            error.status = 404;
            throw error;
        }
        // Validate file
        if (!file) {
            const error = new Error("No file provided");
            error.status = 400;
            throw error;
        }
        // Validate file type
        const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            const error = new Error("Only PDF and Word documents are allowed");
            error.status = 400;
            throw error;
        }
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            const error = new Error("File size exceeds 5MB limit");
            error.status = 400;
            throw error;
        }
        // Create uploads directory if it doesn't exist
        const uploadsDir = path_1.default.join(__dirname, '../../uploads');
        const userUploadsDir = path_1.default.join(uploadsDir, 'resumes', userId);
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(path_1.default.join(uploadsDir, 'resumes'))) {
            fs_1.default.mkdirSync(path_1.default.join(uploadsDir, 'resumes'), { recursive: true });
        }
        if (!fs_1.default.existsSync(userUploadsDir)) {
            fs_1.default.mkdirSync(userUploadsDir, { recursive: true });
        }
        // Generate unique filename using crypto instead of uuid
        const fileExtension = path_1.default.extname(file.originalname);
        const fileName = `${crypto_1.default.randomUUID()}${fileExtension}`;
        const filePath = path_1.default.join(userUploadsDir, fileName);
        // Write file to disk
        fs_1.default.writeFileSync(filePath, file.buffer);
        // Generate URL for the file
        const resumeUrl = `/uploads/resumes/${userId}/${fileName}`;
        // Update user profile with resume URL
        yield prisma.profile.update({
            where: { userId },
            data: { resumeUrl }
        });
        return resumeUrl;
    }
    catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to upload resume');
        customError.status = 400;
        throw customError;
    }
});
exports.uploadResume = uploadResume;
