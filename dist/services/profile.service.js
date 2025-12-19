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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExistingProfile = exports.updateExistingProfile = exports.createNewProfile = exports.fetchProfile = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const resume_service_1 = require("./resume.service");
const fetchProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prismaClient_1.default.profile.findUnique({
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
    const resumeURL = (profile === null || profile === void 0 ? void 0 : profile.resume) ? (0, resume_service_1.FileURLConstructor)(profile.resume.fileId, profile.resume.tokenSecret) : null;
    if (profile) {
        const { user } = profile, profileData = __rest(profile, ["user"]);
        return Object.assign(Object.assign({}, profileData), { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, education: profile.education, experience: profile.experience, resumeURL: resumeURL });
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
        const profile = yield prismaClient_1.default.profile.create({
            data: {
                userId: profileData.userId,
                bio: profileData.bio,
                skills: profileData.skills,
                education: profileData.education,
                experience: profileData.experience,
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
        const resumeURL = (profile === null || profile === void 0 ? void 0 : profile.resume) ? (0, resume_service_1.FileURLConstructor)(profile.resume.fileId, profile.resume.tokenSecret) : null;
        // Convert JSON back to typed arrays when returning
        return Object.assign(Object.assign({}, profile), { resumeURL, education: profile.education, experience: profile.experience });
    }
    catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to create profile');
        customError.status = 400;
        throw customError;
    }
});
exports.createNewProfile = createNewProfile;
const updateExistingProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const existingProfile = yield (0, exports.fetchProfile)(userId);
        if (!existingProfile) {
            const error = new Error("Profile not found");
            error.status = 404;
            throw error;
        }
        const updateData = {};
        // Only include fields that are present in the update data
        if (data.bio)
            updateData.bio = data.bio;
        if (data.skills)
            updateData.skills = data.skills;
        if (data.education)
            updateData.education = data.education;
        if (data.experience)
            updateData.experience = data.experience;
        if (data.resumeFileId)
            updateData.resumeFileId = data.resumeFileId;
        if (data.profileImageURL)
            updateData.profileImageURL = data.profileImageURL;
        if (data.linkedInUrl)
            updateData.linkedInUrl = data.linkedInUrl;
        if (data.githubUrl)
            updateData.githubUrl = data.githubUrl;
        if (data.portfolioUrl)
            updateData.portfolioUrl = data.portfolioUrl;
        const profile = yield prismaClient_1.default.profile.update({
            where: { userId },
            data: updateData,
            include: {
                resume: true
            }
        });
        const resumeURL = (profile === null || profile === void 0 ? void 0 : profile.resumeFileId) ? (0, resume_service_1.FileURLConstructor)(profile.resumeFileId, ((_a = profile === null || profile === void 0 ? void 0 : profile.resume) === null || _a === void 0 ? void 0 : _a.tokenSecret) || '') : null;
        return Object.assign(Object.assign({}, profile), { resumeURL, education: profile.education, experience: profile.experience });
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
    const profile = yield prismaClient_1.default.profile.delete({ where: { userId } });
    return profile;
});
exports.deleteExistingProfile = deleteExistingProfile;
