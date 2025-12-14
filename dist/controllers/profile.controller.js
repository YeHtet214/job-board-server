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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileImage = exports.deleteProfile = exports.updateProfile = exports.createProfile = exports.getProfileById = void 0;
const profile_service_js_1 = require("../services/profile.service.js");
const express_validator_1 = require("express-validator");
const uploadCloud_service_js_1 = require("../services/uploadCloud.service.js");
const getProfileById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seekerId } = req.params;
        const requestingUser = req.user;
        // only employers should view other profiles or owner should view their own profile
        if (requestingUser.role === 'JOBSEEKER' && requestingUser.userId !== seekerId) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to view this profile"
            });
        }
        const profile = yield (0, profile_service_js_1.fetchProfile)(seekerId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProfileById = getProfileById;
const createProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        const userId = req.user.userId;
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['body'] });
        const profileImageURL = yield (0, uploadCloud_service_js_1.mediaUploadToCloudinary)(file);
        if (validatedData.hasOwnProperty('userId'))
            delete validatedData.userId;
        const profile = yield (0, profile_service_js_1.createNewProfile)(Object.assign(Object.assign({}, validatedData), { userId, profileImageURL }));
        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            data: profile
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.createProfile = createProfile;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file; // profile image
        const userId = req.user.userId;
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['body'] });
        const profileImageURL = yield (0, uploadCloud_service_js_1.mediaUploadToCloudinary)(file);
        const profile = yield (0, profile_service_js_1.updateExistingProfile)(userId, Object.assign(Object.assign({}, validatedData), { profileImageURL }));
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
const deleteProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const profile = yield (0, profile_service_js_1.deleteExistingProfile)(userId);
        res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProfile = deleteProfile;
const uploadProfileImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const profileImageURL = yield (0, uploadCloud_service_js_1.mediaUploadToCloudinary)(file);
        // Update the user's profile with the new image URL
        yield (0, profile_service_js_1.updateExistingProfile)(userId, { profileImageURL });
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
});
exports.uploadProfileImage = uploadProfileImage;
