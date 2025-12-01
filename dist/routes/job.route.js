"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_js_1 = require("../controllers/job.controller.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const index_js_1 = require("../middleware/validation/index.js");
const application_controller_js_1 = require("../controllers/application.controller.js");
const jobRouter = (0, express_1.Router)();
// Public routes - anyone can view jobs
jobRouter.get('/', index_js_1.jobValidation.getAll, job_controller_js_1.getAllJobs);
jobRouter.get('/suggestions', job_controller_js_1.getSearchSuggestionsHandler);
jobRouter.get('/company/:companyId', index_js_1.jobValidation.getByCompanyId, job_controller_js_1.getJobsByCompanyId);
jobRouter.get('/:id', index_js_1.jobValidation.getById, job_controller_js_1.getJobById);
jobRouter.use(auth_middleware_js_1.default);
jobRouter.use(role_middleware_js_1.employerOnly);
// Protected routes - only authenticated employers can create/update/delete jobs
jobRouter.get('/:id/applications', index_js_1.applicationValidation.getByJobId, application_controller_js_1.getAllApplicationsByJobId);
jobRouter.post('/', index_js_1.applicationValidation.create, index_js_1.jobValidation.create, job_controller_js_1.createJobHandler);
jobRouter.put('/:id', index_js_1.applicationValidation.update, index_js_1.jobValidation.update, job_controller_js_1.updateJobHandler);
jobRouter.delete('/:id', index_js_1.applicationValidation.delete, index_js_1.jobValidation.delete, job_controller_js_1.deleteJobHandler);
exports.default = jobRouter;
