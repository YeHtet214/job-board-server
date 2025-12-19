"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const profile_controller_js_1 = require("../controllers/profile.controller.js");
const index_js_1 = require("../middleware/validation/index.js");
const index_js_2 = require("../middleware/validation/index.js");
const mediaUploadMulter_js_1 = require("../utils/mediaUploadMulter.js");
const profileRouter = (0, express_1.Router)();
profileRouter.use(auth_middleware_js_1.default);
function parseProfileFields(req, res, next) {
    ['skills', 'education', 'experience'].forEach((field) => {
        if (typeof req.body[field] === 'string') {
            try {
                const parsedField = JSON.parse(req.body[field]);
                req.body[field] = parsedField;
            }
            catch (e) {
                console.log(e);
            }
        }
    });
    next();
}
profileRouter.get('/:seekerId', profile_controller_js_1.getProfileById);
profileRouter.post('/me', mediaUploadMulter_js_1.uploadResume.single('resume'), parseProfileFields, index_js_1.profileValidation.createProfile, index_js_2.validate, profile_controller_js_1.createProfile);
profileRouter.put('/me', mediaUploadMulter_js_1.uploadResume.single('resume'), parseProfileFields, index_js_1.profileValidation.updateProfile, index_js_2.validate, profile_controller_js_1.updateProfile);
profileRouter.delete('/me', profile_controller_js_1.deleteProfile);
// Add profile image upload endpoint
profileRouter.post('/upload-profile-image', mediaUploadMulter_js_1.uploadMedia.single('image'), profile_controller_js_1.uploadProfileImage);
exports.default = profileRouter;
