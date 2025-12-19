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
exports.areJobsSaved = exports.isJobSaved = exports.saveJob = exports.removeSavedJob = exports.getSavedJobs = void 0;
const prismaClient_js_1 = __importDefault(require("../../lib/prismaClient.js"));
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const getSavedJobs = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authenticated');
    }
    return prismaClient_js_1.default.savedJob.findMany({
        where: { userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
});
exports.getSavedJobs = getSavedJobs;
const removeSavedJob = (savedJobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authenticated');
    }
    if (!savedJobId) {
        throw new errorHandler_js_1.BadRequestError('Saved job ID is required');
    }
    const savedJob = yield prismaClient_js_1.default.savedJob.findUnique({
        where: { id: savedJobId },
        select: { userId: true }
    });
    if (!savedJob) {
        throw new errorHandler_js_1.NotFoundError('Saved job not found');
    }
    if (savedJob.userId !== userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authorized to remove this saved job');
    }
    return prismaClient_js_1.default.savedJob.delete({
        where: { id: savedJobId }
    });
});
exports.removeSavedJob = removeSavedJob;
const saveJob = (jobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authenticated');
    }
    if (!jobId) {
        throw new errorHandler_js_1.BadRequestError('Job ID is required');
    }
    // Check if job exists
    const job = yield prismaClient_js_1.default.job.findUnique({
        where: { id: jobId },
        select: { id: true }
    });
    if (!job) {
        throw new errorHandler_js_1.NotFoundError('Job not found');
    }
    // Check if already saved
    const existingSave = yield prismaClient_js_1.default.savedJob.findFirst({
        where: {
            jobId,
            userId
        }
    });
    if (existingSave) {
        return existingSave;
    }
    // Create new saved job
    return prismaClient_js_1.default.savedJob.create({
        data: {
            jobId,
            userId
        }
    });
});
exports.saveJob = saveJob;
const isJobSaved = (jobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authenticated');
    }
    if (!jobId) {
        throw new errorHandler_js_1.BadRequestError('Job ID is required');
    }
    return yield prismaClient_js_1.default.savedJob.findFirst({
        where: {
            jobId,
            userId
        }
    });
});
exports.isJobSaved = isJobSaved;
/**
 * Check if multiple jobs are saved by the user in a single query
 */
const areJobsSaved = (jobIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authenticated');
    }
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        throw new errorHandler_js_1.BadRequestError('Valid array of job IDs is required');
    }
    // Deduplicate job IDs
    const uniqueJobIds = [...new Set(jobIds)];
    // Get all saved jobs for the user that match the provided job IDs
    const savedJobs = yield prismaClient_js_1.default.savedJob.findMany({
        where: {
            userId,
            jobId: {
                in: uniqueJobIds
            }
        },
        select: {
            id: true,
            jobId: true
        }
    });
    // Create a map for quick lookup
    const savedJobsMap = savedJobs.reduce((map, savedJob) => {
        map[savedJob.jobId] = savedJob.id;
        return map;
    }, {});
    // Create the result object with isSaved status for each job ID
    const result = {};
    uniqueJobIds.forEach(jobId => {
        result[jobId] = {
            isSaved: !!savedJobsMap[jobId],
            savedJobId: savedJobsMap[jobId] || null
        };
    });
    return result;
});
exports.areJobsSaved = areJobsSaved;
