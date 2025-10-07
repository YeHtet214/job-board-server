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
exports.cleanupOldJobViews = exports.getRecentJobViews = exports.recordJobView = void 0;
const prismaClient_js_1 = __importDefault(require("../../lib/prismaClient.js"));
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
/**
 * Records a job view by a user, avoiding duplicate recent views
 * @param jobId The ID of the job being viewed
 * @param userId The ID of the user viewing the job
 * @returns The created JobView record or null if it's a duplicate
 */
const recordJobView = (jobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield prismaClient_js_1.default.job.findUnique({
        where: { id: jobId },
        select: { id: true }
    });
    if (!job) {
        throw new errorHandler_js_1.NotFoundError('Job not found');
    }
    // Check if this user has viewed this job in the last 24 hours
    const recentView = yield prismaClient_js_1.default.jobView.findFirst({
        where: {
            jobId,
            userId,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
    });
    // If already viewed recently, don't create duplicate record
    if (recentView) {
        return null;
    }
    return prismaClient_js_1.default.jobView.create({
        data: {
            jobId,
            userId
        }
    });
});
exports.recordJobView = recordJobView;
/**
 * Gets recent job views for a user
 * @param userId The ID of the user
 * @param limit Maximum number of views to return
 * @returns Array of recent job views
 */
const getRecentJobViews = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, limit = 5) {
    return prismaClient_js_1.default.jobView.findMany({
        where: { userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
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
        orderBy: { createdAt: 'desc' },
        take: limit
    });
});
exports.getRecentJobViews = getRecentJobViews;
/**
 * Cleans up old job view records
 * @param daysToKeep Number of days of data to retain
 * @returns Count of deleted records
 */
const cleanupOldJobViews = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const result = yield prismaClient_js_1.default.jobView.deleteMany({
        where: {
            createdAt: { lt: cutoffDate }
        }
    });
    return result.count;
});
exports.cleanupOldJobViews = cleanupOldJobViews;
