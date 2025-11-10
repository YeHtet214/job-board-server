"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const dashboard_controller_js_1 = require("../controllers/dashboard.controller.js");
const dashboardRouter = (0, express_1.Router)();
dashboardRouter.use(auth_middleware_js_1.default);
// Job seeker routes
dashboardRouter.get('/jobseeker', role_middleware_js_1.jobseekerOnly, dashboard_controller_js_1.getJobSeekerDashboard);
dashboardRouter.delete('/jobseeker/applications/:id', role_middleware_js_1.jobseekerOnly, dashboard_controller_js_1.withdrawApplication);
// Employer routes
dashboardRouter.get('/employer', role_middleware_js_1.employerOnly, dashboard_controller_js_1.getEmployerDashboard);
dashboardRouter.put('/employer/applications/:id', role_middleware_js_1.employerOnly, dashboard_controller_js_1.updateApplicationStatusHandler);
dashboardRouter.get('/employer/profile-completion', role_middleware_js_1.employerOnly, dashboard_controller_js_1.getCompanyProfile);
exports.default = dashboardRouter;
