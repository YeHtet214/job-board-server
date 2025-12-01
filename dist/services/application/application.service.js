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
exports.deleteExistingApplication = exports.updateApplicationById = exports.postNewApplication = exports.fetchApplicationById = exports.fetchAllApplicationsByJobId = exports.fetchAllApplicationsByUserId = void 0;
const prismaClient_js_1 = __importDefault(require("../../lib/prismaClient.js"));
const socket_service_js_1 = require("../socket.service.js");
const fetchAllApplicationsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const applications = yield prismaClient_js_1.default.jobApplication.findMany({
        where: { applicantId: userId },
        omit: { jobId: true },
        include: { job: { include: { company: true } } }
    });
    if (!applications || applications.length === 0) {
        const error = new Error('Applications not found');
        error.status = 404;
        throw error;
    }
    return applications;
});
exports.fetchAllApplicationsByUserId = fetchAllApplicationsByUserId;
const fetchAllApplicationsByJobId = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    const applications = yield prismaClient_js_1.default.jobApplication.findMany({
        where: { jobId }
    });
    if (!applications || applications.length === 0) {
        const error = new Error('Applications not found');
        error.status = 404;
        throw error;
    }
    return applications;
});
exports.fetchAllApplicationsByJobId = fetchAllApplicationsByJobId;
const fetchApplicationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield prismaClient_js_1.default.jobApplication.findUnique({
        where: { id },
        include: {
            job: { include: { company: true } },
            applicant: { select: { firstName: true, lastName: true } }
        }
    });
    if (!application) {
        const error = new Error('Application not found');
        error.status = 404;
        throw error;
    }
    return application;
});
exports.fetchApplicationById = fetchApplicationById;
const postNewApplication = (applicationData, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if job exists
    const job = yield prismaClient_js_1.default.job.findUnique({
        where: { id: applicationData.jobId }
    });
    if (!job) {
        const error = new Error('Job not found');
        error.status = 404;
        throw error;
    }
    // Check if user already applied for this job
    const existingApplication = yield prismaClient_js_1.default.jobApplication.findFirst({
        where: {
            jobId: applicationData.jobId,
            applicantId: applicationData.applicantId
        }
    });
    if (existingApplication) {
        const error = new Error('You have already applied for this job');
        error.status = 400;
        throw error;
    }
    const newApplication = yield prismaClient_js_1.default.jobApplication.create({
        data: {
            jobId: applicationData.jobId,
            applicantId: applicationData.applicantId,
            resumeUrl: applicationData.resumeUrl,
            coverLetter: applicationData.coverLetter,
            additionalInfo: applicationData.additionalInfo,
            acceptTerms: true,
            status: 'PENDING'
        }
    });
    // Notify employer of new application
    try {
        if (job && user) {
            yield (0, socket_service_js_1.notifyEmployerOfApplication)({
                applicationId: newApplication.id,
                jobId: newApplication.jobId,
                jobTitle: job.title,
                applicantId: newApplication.applicantId,
                applicantName: `${user.firstName} ${user.lastName}`,
                employerId: job.postedById,
            });
        }
    }
    catch (err) {
        console.error('Failed to create notification for employer:', err);
    }
    return { application: newApplication, job };
});
exports.postNewApplication = postNewApplication;
const updateApplicationById = (applicationData) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if application exists
    const application = yield prismaClient_js_1.default.jobApplication.findUnique({
        where: { id: applicationData.id },
        include: { job: { include: { company: true } } }
    });
    if (!application) {
        const error = new Error('Application not found');
        error.status = 404;
        throw error;
    }
    const statusChanged = applicationData.status && applicationData.status !== application.status;
    // Update application
    const updatedApplication = yield prismaClient_js_1.default.jobApplication.update({
        where: { id: applicationData.id },
        data: {
            resumeUrl: applicationData.resumeUrl,
            coverLetter: applicationData.coverLetter,
            status: applicationData.status || application.status,
        }
    });
    // Notify applicant if status changed
    if (statusChanged) {
        try {
            yield (0, socket_service_js_1.notifyApplicantOfStatusUpdate)({
                applicationId: updatedApplication.id,
                jobId: updatedApplication.jobId,
                jobTitle: application.job.title,
                companyName: application.job.company.name,
                applicantId: updatedApplication.applicantId,
                newStatus: updatedApplication.status,
            });
        }
        catch (err) {
            console.error('Failed to create notification for applicant:', err);
        }
    }
    return { application: updatedApplication, statusChanged, job: application.job };
});
exports.updateApplicationById = updateApplicationById;
const deleteExistingApplication = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if application exists
    const application = yield prismaClient_js_1.default.jobApplication.findUnique({
        where: { id }
    });
    if (!application) {
        const error = new Error('Application not found');
        error.status = 404;
        throw error;
    }
    // Delete application
    const deletedApplication = yield prismaClient_js_1.default.jobApplication.delete({
        where: { id }
    });
    return deletedApplication;
});
exports.deleteExistingApplication = deleteExistingApplication;
