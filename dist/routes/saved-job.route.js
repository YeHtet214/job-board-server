"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saved_job_controller_js_1 = require("../controllers/saved-job.controller.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const savedJobRouter = (0, express_1.Router)();
// All routes require authentication and job seeker role
savedJobRouter.use(auth_middleware_js_1.default);
savedJobRouter.use(role_middleware_js_1.jobseekerOnly);
// Get all saved jobs for the current user
savedJobRouter.get('/', saved_job_controller_js_1.getSavedJobsHandler);
// Check if a job is saved by the user
savedJobRouter.get('/check/:jobId', saved_job_controller_js_1.isJobSavedHandler);
// Check if multiple jobs are saved by the user (batch operation)
savedJobRouter.post('/check-batch', saved_job_controller_js_1.batchCheckSavedJobsHandler);
// Save a job
savedJobRouter.post('/', saved_job_controller_js_1.saveJobHandler);
// Remove a saved job
savedJobRouter.delete('/:savedJobId', saved_job_controller_js_1.removeSavedJobHandler);
exports.default = savedJobRouter;
