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
exports.getEmployerActivity = exports.getJobSeekerActivity = void 0;
const prismaClient_js_1 = __importDefault(require("../../lib/prismaClient.js"));
/**
 * Gets recent activity for a job seeker
 * @param userId The job seeker user ID
 */
const getJobSeekerActivity = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get recent job views
    const views = yield prismaClient_js_1.default.jobView.findMany({
        where: { userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    company: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    // Get recent applications
    const applications = yield prismaClient_js_1.default.jobApplication.findMany({
        where: { applicantId: userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    company: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    // Get recent saved jobs
    const saves = yield prismaClient_js_1.default.savedJob.findMany({
        where: { userId },
        select: {
            id: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    company: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    // Combine and sort all activities
    const allActivities = [
        ...views.map((view) => ({
            id: view.id,
            type: 'VIEW',
            timestamp: view.createdAt,
            title: `Viewed job: ${view.job.title}`,
            relatedEntity: view.job.company.name,
            entityId: view.job.id
        })),
        ...applications.map((app) => ({
            id: app.id,
            type: 'APPLY',
            timestamp: app.createdAt,
            title: `Applied to: ${app.job.title}`,
            relatedEntity: app.job.company.name,
            entityId: app.job.id
        })),
        ...saves.map((save) => ({
            id: save.id,
            type: 'SAVE',
            timestamp: save.createdAt,
            title: `Saved job: ${save.job.title}`,
            relatedEntity: save.job.company.name,
            entityId: save.job.id
        }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    // Return only the latest 10 activities
    return allActivities.slice(0, 10).map(activity => (Object.assign(Object.assign({}, activity), { timestamp: activity.timestamp.toISOString() })));
});
exports.getJobSeekerActivity = getJobSeekerActivity;
/**
 * Gets recent activity for an employer
 * @param companyId The company ID
 */
const getEmployerActivity = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get recent job postings
    const jobPostings = yield prismaClient_js_1.default.job.findMany({
        where: {
            companyId,
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        },
        select: {
            id: true,
            title: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    // Get expired/inactive jobs
    const expiredJobs = yield prismaClient_js_1.default.job.findMany({
        where: {
            companyId,
            OR: [
                { isActive: false },
                { expiresAt: { lt: new Date() } }
            ],
            updatedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        },
        select: {
            id: true,
            title: true,
            updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });
    // Get new applications
    const newApplications = yield prismaClient_js_1.default.jobApplication.findMany({
        where: {
            job: { companyId },
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        },
        select: {
            id: true,
            createdAt: true,
            applicant: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    // Get interview scheduled
    const interviews = yield prismaClient_js_1.default.jobApplication.findMany({
        where: {
            job: { companyId },
            status: 'INTERVIEW',
            updatedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        },
        select: {
            id: true,
            updatedAt: true,
            applicant: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });
    // Combine and sort all activities
    const allActivities = [
        ...jobPostings.map((job) => ({
            id: job.id,
            type: 'JOB_POSTED',
            timestamp: job.createdAt,
            title: `Job posted: ${job.title}`,
            relatedEntity: 'Your company',
            entityId: job.id
        })),
        ...expiredJobs.map((job) => ({
            id: job.id,
            type: 'JOB_EXPIRED',
            timestamp: job.updatedAt,
            title: `Job expired: ${job.title}`,
            relatedEntity: 'Your company',
            entityId: job.id
        })),
        ...newApplications.map((app) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                id: app.id,
                type: 'NEW_APPLICATION',
                timestamp: app.createdAt,
                title: `New application from ${(_b = (_a = app.applicant) === null || _a === void 0 ? void 0 : _a.firstName) !== null && _b !== void 0 ? _b : ''} ${(_d = (_c = app.applicant) === null || _c === void 0 ? void 0 : _c.lastName) !== null && _d !== void 0 ? _d : ''}`,
                relatedEntity: (_f = (_e = app.job) === null || _e === void 0 ? void 0 : _e.title) !== null && _f !== void 0 ? _f : '',
                entityId: (_h = (_g = app.job) === null || _g === void 0 ? void 0 : _g.id) !== null && _h !== void 0 ? _h : ''
            });
        }),
        ...interviews.map((app) => {
            var _a, _b, _c, _d;
            return ({
                id: app.id,
                type: 'INTERVIEW_SCHEDULED',
                timestamp: app.updatedAt,
                title: `Interview scheduled with ${(_a = app.applicant) === null || _a === void 0 ? void 0 : _a.firstName} ${(_b = app.applicant) === null || _b === void 0 ? void 0 : _b.lastName}`,
                relatedEntity: (_c = app.job) === null || _c === void 0 ? void 0 : _c.title,
                entityId: (_d = app.job) === null || _d === void 0 ? void 0 : _d.id
            });
        })
    ].sort((a, b) => { var _a, _b, _c, _d; return ((_b = (_a = b.timestamp) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = a.timestamp) === null || _c === void 0 ? void 0 : _c.getTime()) !== null && _d !== void 0 ? _d : 0); });
    // Return only the latest 10 activities
    return allActivities.slice(0, 10).map(activity => {
        var _a;
        return (Object.assign(Object.assign({}, activity), { timestamp: (_a = activity.timestamp) === null || _a === void 0 ? void 0 : _a.toISOString() }));
    });
});
exports.getEmployerActivity = getEmployerActivity;
