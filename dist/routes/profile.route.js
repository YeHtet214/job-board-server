"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_js_1 = __importDefault(require("@/middleware/auth.middleware.js"));
const profile_controller_js_1 = require("@/controllers/profile.controller.js");
const index_js_1 = require("@/middleware/validation/index.js");
const index_js_2 = require("@/middleware/validation/index.js");
const mediaUploadMulter_js_1 = require("@/utils/mediaUploadMulter.js");
const profileRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)();
profileRouter.use(auth_middleware_js_1.default);
function parseProfileFields(req, res, next) {
    ['skills', 'education', 'experience'].forEach(field => {
        if (typeof req.body[field] === 'string') {
            try {
                const parsedField = JSON.parse(req.body[field]);
                req.body[field] = parsedField;
            }
            catch (e) {
                // Optionally handle JSON parse error
            }
        }
    });
    next();
}
// Profile routes
profileRouter.get('/me', profile_controller_js_1.getProfile);
// profileRouter.post('/me',uploadMedia.single('profileImage'), uploadResume.single('resume'), parseProfileFields , profileValidation.createProfile, validate,  createProfile as RequestHandler);
profileRouter.post('/me', upload.any(), parseProfileFields, index_js_1.profileValidation.createProfile, index_js_2.validate, profile_controller_js_1.createProfile);
profileRouter.put('/me', upload.any(), parseProfileFields, index_js_1.profileValidation.updateProfile, index_js_2.validate, profile_controller_js_1.updateProfile);
profileRouter.delete('/me', profile_controller_js_1.deleteProfile);
// Add resume upload endpoint
profileRouter.post('/upload-resume', index_js_1.profileValidation.createProfile, index_js_2.validate, mediaUploadMulter_js_1.uploadResume.single('resume'), profile_controller_js_1.uploadResumeFile);
// Add profile image upload endpoint
profileRouter.post('/upload-profile-image', mediaUploadMulter_js_1.uploadMedia.single('image'), profile_controller_js_1.uploadProfileImage);
exports.default = profileRouter;
