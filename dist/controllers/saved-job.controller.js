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
exports.batchCheckSavedJobsHandler = exports.isJobSavedHandler = exports.removeSavedJobHandler = exports.saveJobHandler = exports.getSavedJobsHandler = void 0;
const saved_job_service_js_1 = require("../services/job/saved-job.service.js");
/**
 * Get all saved jobs for the current user
 */
const getSavedJobsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        console.log("User id in getSavedJobsHanlder: ", userId);
        const savedJobs = yield (0, saved_job_service_js_1.getSavedJobs)(userId);
        console.log("Saved Jobs: ", savedJobs);
        res.status(200).json({
            success: true,
            message: 'Successfully fetched saved jobs',
            data: savedJobs
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSavedJobsHandler = getSavedJobsHandler;
/**
 * Save a job for the current user
 */
const saveJobHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { jobId } = req.body;
        console.log("user id in save job handler: ", userId);
        const result = yield (0, saved_job_service_js_1.saveJob)(jobId, userId);
        console.log("Job saving result: ", result);
        res.status(201).json({
            success: true,
            message: 'Job has been successfully saved',
            data: result
        });
    }
    catch (error) {
        next(error);
    }
});
exports.saveJobHandler = saveJobHandler;
/**
 * Remove a saved job for the current user
 */
const removeSavedJobHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { savedJobId } = req.params;
        const removedJob = yield (0, saved_job_service_js_1.removeSavedJob)(savedJobId, userId);
        res.status(200).json({
            success: true,
            message: 'Job removed from saved jobs',
            data: removedJob
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeSavedJobHandler = removeSavedJobHandler;
/**
 * Check if a job is saved by the current user
 */
const isJobSavedHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { jobId } = req.params;
        console.log("User id in isJobSaved handler: ", userId);
        const savedJob = yield (0, saved_job_service_js_1.isJobSaved)(jobId, userId);
        console.log("Is job saved result: ", savedJob);
        res.status(200).json({
            success: true,
            message: 'Job saved status retrieved successfully',
            data: {
                isSaved: !!savedJob,
                savedJobId: (savedJob === null || savedJob === void 0 ? void 0 : savedJob.id) || null
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.isJobSavedHandler = isJobSavedHandler;
/**
 * Check if multiple jobs are saved by the current user
 */
const batchCheckSavedJobsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { jobIds } = req.body;
        console.log("User id in batch: ", userId);
        const savedJobsStatus = yield (0, saved_job_service_js_1.areJobsSaved)(jobIds, userId);
        console.log("Saved Jobs Status: ", savedJobsStatus);
        res.status(200).json({
            success: true,
            message: 'Batch job saved status retrieved successfully',
            data: savedJobsStatus
        });
    }
    catch (error) {
        next(error);
    }
});
exports.batchCheckSavedJobsHandler = batchCheckSavedJobsHandler;
