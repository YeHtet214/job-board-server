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
exports.recordJobViewActivity = exports.updateApplicationStatus = exports.fetchEmployerDashboardData = exports.withdrawApplicationForUser = exports.fetchJobSeekerDashboardData = void 0;
const client_js_1 = __importDefault(require("@/lib/client.js"));
const errorHandler_js_1 = require("@/middleware/errorHandler.js");
const activity_service_js_1 = require("@/services/dashboard/activity.service.js");
const profile_completion_service_js_1 = require("@/services/company/profile-completion.service.js");
const profile_completion_service_js_2 = require("@/services/company/profile-completion.service.js");
const job_view_service_js_1 = require("@/services/job/job-view.service.js");
/**
 * Fetches job seeker dashboard data for a specific user
 * @param userId The ID of the job seeker
 * @returns Dashboard data including stats, applications, saved jobs and activity
 */
const fetchJobSeekerDashboardData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists and is a job seeker
    const user = yield client_js_1.default.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    if (!user) {
        throw new errorHandler_js_1.NotFoundError('User not found');
    }
    if (user.role !== 'JOBSEEKER') {
        throw new errorHandler_js_1.UnauthorizedError('User is not a job seeker');
    }
    // Get applications
    const applications = yield client_js_1.default.jobApplication.findMany({
        where: { applicantId: userId },
        select: {
            id: true,
            status: true,
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
        orderBy: { createdAt: 'desc' }
    });
    // Get recent activity
    const recentActivity = yield (0, activity_service_js_1.getJobSeekerActivity)(userId);
    // Calculate stats
    const interviewCount = applications.filter((app) => app.status === 'INTERVIEW').length;
    const offersCount = applications.filter((app) => app.status === 'ACCEPTED').length;
    // Calculate profile completion percentage
    const profileCompletion = yield (0, profile_completion_service_js_1.calculateJobSeekerProfileCompletion)(userId);
    // Format the data according to frontend expectations
    return {
        stats: {
            totalApplications: applications.length,
            interviews: interviewCount,
            offers: offersCount,
            profileCompletion
        },
        applications: applications.map((app) => ({
            id: app.id,
            jobTitle: app.job.title,
            companyName: app.job.company.name,
            jobId: app.job.id,
            applied: app.createdAt.toISOString(),
            status: app.status,
            logo: app.job.company.logo
        })),
        recentActivity
    };
});
exports.fetchJobSeekerDashboardData = fetchJobSeekerDashboardData;
/**
 * Withdraws a job application
 * @param applicationId The application ID to withdraw
 * @param userId The user ID
 */
const withdrawApplicationForUser = (applicationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield client_js_1.default.jobApplication.findUnique({
        where: { id: applicationId },
        select: { applicantId: true }
    });
    if (!application) {
        throw new errorHandler_js_1.NotFoundError('Application not found');
    }
    if (application.applicantId !== userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authorized to withdraw this application');
    }
    return client_js_1.default.jobApplication.delete({
        where: { id: applicationId }
    });
});
exports.withdrawApplicationForUser = withdrawApplicationForUser;
/**
 * Fetches employer dashboard data for a specific user
 * @param userId The ID of the employer
 * @returns Dashboard data including stats, jobs, applications and activity
 */
const fetchEmployerDashboardData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists and is an employer
    const user = yield client_js_1.default.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    if (!user) {
        throw new errorHandler_js_1.NotFoundError('User not found');
    }
    if (user.role !== 'EMPLOYER') {
        throw new errorHandler_js_1.UnauthorizedError('User is not an employer');
    }
    // Get company for this employer
    const company = yield client_js_1.default.company.findFirst({
        where: { ownerId: userId },
        select: {
            id: true,
            name: true,
            logo: true
        }
    });
    if (!company) {
        throw new errorHandler_js_1.NotFoundError('Company not found for this employer');
    }
    // Get company's jobs
    const jobs = yield client_js_1.default.job.findMany({
        where: { companyId: company.id },
        select: {
            id: true,
            title: true,
            location: true,
            type: true,
            createdAt: true,
            isActive: true,
            expiresAt: true,
            _count: {
                select: {
                    applications: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    // Get applications for the company's jobs
    const jobIds = jobs.map(job => job.id).filter(Boolean);
    const applications = yield client_js_1.default.jobApplication.findMany({
        where: {
            jobId: { in: jobIds }
        },
        select: {
            id: true,
            status: true,
            createdAt: true,
            job: {
                select: {
                    id: true,
                    title: true
                }
            },
            applicant: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    // Get recent activity
    const recentActivity = yield (0, activity_service_js_1.getEmployerActivity)(company.id);
    // Get profile completion
    const profileCompletion = yield (0, profile_completion_service_js_2.getCompanyProfileCompletion)(userId);
    // Calculate stats
    const activeJobs = jobs.filter(job => job.isActive && (!job.expiresAt || job.expiresAt > new Date())).length;
    const pendingApplications = applications.filter((app) => app.status === 'PENDING').length;
    const interviewCount = applications.filter((app) => app.status === 'INTERVIEW').length;
    console.log("Company: ", company);
    // Format the data according to frontend expectations
    return {
        stats: {
            totalJobs: jobs.length,
            activeJobs,
            totalApplications: applications.length,
            pendingReview: pendingApplications,
            interviews: interviewCount,
            profileCompletion: profileCompletion.percentage
        },
        company: {
            id: company.id,
            name: company.name,
            logo: company.logo
        },
        jobs: jobs.map(job => {
            var _a, _b;
            return ({
                id: job.id,
                title: job.title,
                location: job.location,
                type: job.type,
                postedDate: (_a = job.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                isActive: job.isActive && (!job.expiresAt || job.expiresAt > new Date()),
                applicationCount: (_b = job._count) === null || _b === void 0 ? void 0 : _b.applications
            });
        }),
        applications: applications.map((app) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                id: app.id,
                jobTitle: (_a = app.job) === null || _a === void 0 ? void 0 : _a.title,
                jobId: (_b = app.job) === null || _b === void 0 ? void 0 : _b.id,
                applicantName: `${(_c = app.applicant) === null || _c === void 0 ? void 0 : _c.firstName} ${(_d = app.applicant) === null || _d === void 0 ? void 0 : _d.lastName}`,
                applicantId: (_e = app.applicant) === null || _e === void 0 ? void 0 : _e.id,
                applicantEmail: (_f = app.applicant) === null || _f === void 0 ? void 0 : _f.email,
                applied: (_g = app.createdAt) === null || _g === void 0 ? void 0 : _g.toISOString(),
                status: app.status
            });
        }),
        recentActivity
    };
});
exports.fetchEmployerDashboardData = fetchEmployerDashboardData;
/**
 * Updates the status of a job application
 * @param applicationId The application ID to update
 * @param status The new status
 * @param userId The user ID (employer)
 * @param notes Optional notes about the status change
 */
const updateApplicationStatus = (applicationId, status, userId, notes) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify application exists
    const application = yield client_js_1.default.jobApplication.findUnique({
        where: { id: applicationId },
        select: {
            job: {
                select: {
                    companyId: true,
                    company: {
                        select: {
                            ownerId: true
                        }
                    }
                }
            }
        }
    });
    if (!application) {
        throw new errorHandler_js_1.NotFoundError('Application not found');
    }
    // Verify user is the employer who owns this job's company
    if (application.job.company.ownerId !== userId) {
        throw new errorHandler_js_1.UnauthorizedError('Not authorized to update this application');
    }
    // Validate status
    const validStatuses = ['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
        throw new errorHandler_js_1.BadRequestError(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    // Update application status
    return client_js_1.default.jobApplication.update({
        where: { id: applicationId },
        data: {
            status: status,
            // If we had a notes field, we'd update it here
        }
    });
});
exports.updateApplicationStatus = updateApplicationStatus;
/**
 * Records a job view and handles duplicate prevention
 * @param jobId The ID of the job being viewed
 * @param userId The ID of the user viewing the job
 */
const recordJobViewActivity = (jobId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, job_view_service_js_1.recordJobView)(jobId, userId);
});
exports.recordJobViewActivity = recordJobViewActivity;
