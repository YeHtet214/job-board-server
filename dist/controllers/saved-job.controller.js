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
const getSavedJobsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const savedJobs = yield (0, saved_job_service_js_1.getSavedJobs)(userId);
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
const saveJobHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { jobId } = req.body;
        const result = yield (0, saved_job_service_js_1.saveJob)(jobId, userId);
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
const isJobSavedHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { jobId } = req.params;
        const savedJob = yield (0, saved_job_service_js_1.isJobSaved)(jobId, userId);
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
const batchCheckSavedJobsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { jobIds } = req.body;
        const savedJobsStatus = yield (0, saved_job_service_js_1.areJobsSaved)(jobIds, userId);
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
