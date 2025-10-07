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
exports.saveJobForUser = exports.removeSavedJobForUser = exports.getSavedJobsForUser = void 0;
const client_js_1 = __importDefault(require("@/prisma/client.js"));
const errorHandler_js_1 = require("@/middleware/errorHandler.js");
/**
 * Gets saved jobs for a user
 * @param userId The user ID
 * @returns Array of saved jobs with details
 */
const getSavedJobsForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return client_js_1.default.savedJob.findMany({
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
exports.getSavedJobsForUser = getSavedJobsForUser;
/**
 * Removes a saved job for a user
 * @param savedJobId The saved job ID to remove
 * @param userId The user ID
 */
const removeSavedJobForUser = (savedJobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const savedJob = yield client_js_1.default.savedJob.findUnique({
        where: { id: savedJobId },
        select: { userId: true }
    });
    if (!savedJob) {
        throw new errorHandler_js_1.NotFoundError('Saved job not found');
    }
    if (savedJob.userId !== userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authorized to remove this saved job');
    }
    return client_js_1.default.savedJob.delete({
        where: { id: savedJobId }
    });
});
exports.removeSavedJobForUser = removeSavedJobForUser;
/**
 * Saves a job for a user
 * @param jobId The job ID to save
 * @param userId The user ID
 */
const saveJobForUser = (jobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if job exists
    const job = yield client_js_1.default.job.findUnique({
        where: { id: jobId },
        select: { id: true }
    });
    if (!job) {
        throw new errorHandler_js_1.NotFoundError('Job not found');
    }
    // Check if already saved
    const existingSave = yield client_js_1.default.savedJob.findFirst({
        where: {
            jobId,
            userId
        }
    });
    if (existingSave) {
        return existingSave;
    }
    // Create new saved job
    return client_js_1.default.savedJob.create({
        data: {
            jobId,
            userId
        }
    });
});
exports.saveJobForUser = saveJobForUser;
