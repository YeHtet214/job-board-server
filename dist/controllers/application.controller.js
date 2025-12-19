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
exports.deleteApplication = exports.updateApplication = exports.createNewApplication = exports.getApplicationById = exports.getAllApplicationsByJobId = exports.getAllApplicationsByUserId = void 0;
const application_service_js_1 = require("../services/application/application.service.js");
const express_validator_1 = require("express-validator");
const uploadCloud_service_js_1 = require("../services/uploadCloud.service.js");
const client_1 = require("@prisma/client");
const resume_service_js_1 = require("@/services/resume.service.js");
const getAllApplicationsByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['params', 'body'] });
        const userId = req.user.userId;
        const applications = yield (0, application_service_js_1.fetchAllApplicationsByUserId)(userId);
        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllApplicationsByUserId = getAllApplicationsByUserId;
const getAllApplicationsByJobId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['params', 'body'] });
        const jobId = validatedData.jobId;
        const applications = yield (0, application_service_js_1.fetchAllApplicationsByJobId)(jobId);
        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllApplicationsByJobId = getAllApplicationsByJobId;
const getApplicationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get validated data
        const validatedData = (0, express_validator_1.matchedData)(req);
        const id = validatedData.id;
        const application = yield (0, application_service_js_1.fetchApplicationById)(id);
        res.status(200).json({
            success: true,
            message: "Application fetched successfully",
            data: application
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getApplicationById = getApplicationById;
const createNewApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['params', 'body'] });
        const file = req.file;
        const { fileId } = yield (0, uploadCloud_service_js_1.resumeUploadToAppwrite)(file);
        const applicantId = req.user.userId;
        const { application, job } = yield (0, application_service_js_1.postNewApplication)(Object.assign(Object.assign({}, validatedData), { resumeFileId: fileId, applicantId }), req.user);
        const resumeURL = (application === null || application === void 0 ? void 0 : application.resumeFileId) ? (0, resume_service_js_1.FileURLConstructor)(application.resumeFileId, ((_a = application === null || application === void 0 ? void 0 : application.resume) === null || _a === void 0 ? void 0 : _a.tokenSecret) || '') : null;
        // Emit real-time notification via Socket.IO to employer
        const io = req.app.get('io');
        if (io && application && job) {
            const employerId = job.postedById;
            // Emit to employer's personal room
            io.to(employerId).emit('notification:application', {
                type: client_1.NotiType.Job_Application,
                applicationId: application.id,
                jobId: application.jobId,
                title: 'Got New Application',
                snippet: `${req.user.userName} applied for ${job.title}`,
                applicantName: `${req.user.userName}`,
                createdAt: application.createdAt,
            });
        }
        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: Object.assign(Object.assign({}, application), { resumeURL })
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createNewApplication = createNewApplication;
const updateApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get validated data
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['params', 'body'] });
        const { fileId } = yield (0, uploadCloud_service_js_1.resumeUploadToAppwrite)(req.file);
        const applicantId = req.user.userId;
        const applicationData = {
            id: validatedData.id,
            resumeFileId: fileId,
            coverLetter: validatedData.coverLetter,
            status: validatedData.status
        };
        const { application, statusChanged, job } = yield (0, application_service_js_1.updateApplicationById)(Object.assign(Object.assign({}, applicationData), { applicantId }));
        const resumeURL = (application === null || application === void 0 ? void 0 : application.resumeFileId) ? (0, resume_service_js_1.FileURLConstructor)(application.resumeFileId, ((_a = application === null || application === void 0 ? void 0 : application.resume) === null || _a === void 0 ? void 0 : _a.tokenSecret) || '') : null;
        // Emit real-time notification if status changed
        if (statusChanged) {
            const io = req.app.get('io');
            if (io && application) {
                // Emit to applicant's personal room
                io.to(application.applicantId).emit('notification:application', {
                    type: client_1.NotiType.Application_Status_Update,
                    applicationId: application.id,
                    jobId: application.jobId,
                    status: application.status,
                    title: 'Your application status has been updated',
                    snippet: `The job applied for ${job.title} is ${application.status}`,
                    createdAt: new Date(),
                });
            }
        }
        res.status(200).json({
            success: true,
            message: "Application updated successfully",
            data: Object.assign(Object.assign({}, application), { resumeURL })
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateApplication = updateApplication;
const deleteApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get validated data
        const validatedData = (0, express_validator_1.matchedData)(req);
        const id = validatedData.id;
        const deletedApplication = yield (0, application_service_js_1.deleteExistingApplication)(id);
        res.status(200).json({
            success: true,
            message: 'Application deleted successfully',
            data: deletedApplication
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteApplication = deleteApplication;
