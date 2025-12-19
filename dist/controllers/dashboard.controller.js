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
exports.getCompanyProfile = exports.deleteJob = exports.updateApplicationStatusHandler = exports.withdrawApplication = exports.getEmployerDashboard = exports.getJobSeekerDashboard = void 0;
const dashboard_service_js_1 = require("../services/dashboard/dashboard.service.js");
const profile_completion_service_js_1 = require("../services/company/profile-completion.service.js");
const job_service_js_1 = require("../services/job/job.service.js");
const getJobSeekerDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const dashboardData = yield (0, dashboard_service_js_1.fetchJobSeekerDashboardData)(userId);
        res.status(200).json({
            success: true,
            message: "Job seeker dashboard data fetched successfully",
            data: dashboardData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getJobSeekerDashboard = getJobSeekerDashboard;
const getEmployerDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const dashboardData = yield (0, dashboard_service_js_1.fetchEmployerDashboardData)(userId);
        res.status(200).json({
            success: true,
            message: "Employer dashboard data fetched successfully",
            data: dashboardData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEmployerDashboard = getEmployerDashboard;
const withdrawApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicationId = req.params.id;
        const userId = req.user.userId;
        yield (0, dashboard_service_js_1.withdrawApplicationForUser)(applicationId, userId);
        res.status(200).json({
            success: true,
            message: "Application withdrawn successfully"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.withdrawApplication = withdrawApplication;
/**
 * Updates the status of a job application (employer only)
 */
const updateApplicationStatusHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicationId = req.params.id;
        const { status, notes } = req.body;
        const userId = req.user.userId;
        const updatedApplication = yield (0, dashboard_service_js_1.updateApplicationStatus)(applicationId, status, userId, notes);
        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            data: updatedApplication
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateApplicationStatusHandler = updateApplicationStatusHandler;
/**
 * Deletes a job posting (employer only)
 */
const deleteJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.params.id;
        const userId = req.user.userId;
        yield (0, job_service_js_1.deleteExistingJob)(jobId, userId);
        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteJob = deleteJob;
/**
 * Gets company profile completion status (employer only)
 */
const getCompanyProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const profileCompletion = yield (0, profile_completion_service_js_1.getCompanyProfileCompletion)(userId);
        res.status(200).json({
            success: true,
            message: "Company profile completion status fetched successfully",
            data: profileCompletion
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCompanyProfile = getCompanyProfile;
