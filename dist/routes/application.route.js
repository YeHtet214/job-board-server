"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const application_controller_js_1 = require("../controllers/application.controller.js");
const application_validation_js_1 = require("../middleware/validation/application.validation.js");
const mediaUploadMulter_js_1 = require("../utils/mediaUploadMulter.js");
const applicationRouter = (0, express_1.Router)();
applicationRouter.use(auth_middleware_js_1.default);
applicationRouter.get('/users/:userId', application_controller_js_1.getAllApplicationsByUserId);
applicationRouter.get('/:id', application_validation_js_1.applicationValidation.getById, application_controller_js_1.getApplicationById);
applicationRouter.post('/jobs/:jobId', mediaUploadMulter_js_1.uploadResume.single('resume'), application_validation_js_1.applicationValidation.create, application_controller_js_1.createNewApplication);
applicationRouter.put('/:id', mediaUploadMulter_js_1.uploadResume.single('resume'), application_validation_js_1.applicationValidation.update, application_controller_js_1.updateApplication);
applicationRouter.delete('/:id', application_validation_js_1.applicationValidation.delete, application_controller_js_1.deleteApplication);
exports.default = applicationRouter;
