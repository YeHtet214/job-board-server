import prisma from '../../prisma/client.js';
import { UserRole } from '@prisma/client';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../middleware/errorHandler.js';
import { getJobSeekerActivity, getEmployerActivity } from './activity.service.js';
import { calculateJobSeekerProfileCompletion } from '../company/profile-completion.service.js';
import { getCompanyProfileCompletion } from '../company/profile-completion.service.js';
import { recordJobView } from '../job/job-view.service.js';
/**
 * Fetches job seeker dashboard data for a specific user
 * @param userId The ID of the job seeker
 * @returns Dashboard data including stats, applications, saved jobs and activity
 */
export const fetchJobSeekerDashboardData = async (userId) => {
    // Verify user exists and is a job seeker
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    if (!user) {
        throw new NotFoundError('User not found');
    }
    if (user.role !== UserRole.JOBSEEKER) {
        throw new UnauthorizedError('User is not a job seeker');
    }
    // Get applications
    const applications = await prisma.jobApplication.findMany({
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
    const recentActivity = await getJobSeekerActivity(userId);
    // Calculate stats
    const interviewCount = applications.filter(app => app.status === 'INTERVIEW').length;
    const offersCount = applications.filter(app => app.status === 'ACCEPTED').length;
    // Calculate profile completion percentage
    const profileCompletion = await calculateJobSeekerProfileCompletion(userId);
    // Format the data according to frontend expectations
    return {
        stats: {
            totalApplications: applications.length,
            interviews: interviewCount,
            offers: offersCount,
            profileCompletion
        },
        applications: applications.map(app => ({
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
};
/**
 * Withdraws a job application
 * @param applicationId The application ID to withdraw
 * @param userId The user ID
 */
export const withdrawApplicationForUser = async (applicationId, userId) => {
    const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        select: { applicantId: true }
    });
    if (!application) {
        throw new NotFoundError('Application not found');
    }
    if (application.applicantId !== userId) {
        throw new UnauthorizedError('Not authorized to withdraw this application');
    }
    return prisma.jobApplication.delete({
        where: { id: applicationId }
    });
};
/**
 * Fetches employer dashboard data for a specific user
 * @param userId The ID of the employer
 * @returns Dashboard data including stats, jobs, applications and activity
 */
export const fetchEmployerDashboardData = async (userId) => {
    // Verify user exists and is an employer
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    if (!user) {
        throw new NotFoundError('User not found');
    }
    if (user.role !== UserRole.EMPLOYER) {
        throw new UnauthorizedError('User is not an employer');
    }
    // Get company for this employer
    const company = await prisma.company.findFirst({
        where: { ownerId: userId },
        select: {
            id: true,
            name: true,
            logo: true
        }
    });
    if (!company) {
        throw new NotFoundError('Company not found for this employer');
    }
    // Get company's jobs
    const jobs = await prisma.job.findMany({
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
    const jobIds = jobs.map(job => job.id);
    const applications = await prisma.jobApplication.findMany({
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
    const recentActivity = await getEmployerActivity(company.id);
    // Get profile completion
    const profileCompletion = await getCompanyProfileCompletion(userId);
    // Calculate stats
    const activeJobs = jobs.filter(job => job.isActive && (!job.expiresAt || job.expiresAt > new Date())).length;
    const pendingApplications = applications.filter(app => app.status === 'PENDING').length;
    const interviewCount = applications.filter(app => app.status === 'INTERVIEW').length;
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
        jobs: jobs.map(job => ({
            id: job.id,
            title: job.title,
            location: job.location,
            type: job.type,
            postedDate: job.createdAt.toISOString(),
            isActive: job.isActive && (!job.expiresAt || job.expiresAt > new Date()),
            applicationCount: job._count.applications
        })),
        applications: applications.map(app => ({
            id: app.id,
            jobTitle: app.job.title,
            jobId: app.job.id,
            applicantName: `${app.applicant.firstName} ${app.applicant.lastName}`,
            applicantId: app.applicant.id,
            applicantEmail: app.applicant.email,
            applied: app.createdAt.toISOString(),
            status: app.status
        })),
        recentActivity
    };
};
/**
 * Updates the status of a job application
 * @param applicationId The application ID to update
 * @param status The new status
 * @param userId The user ID (employer)
 * @param notes Optional notes about the status change
 */
export const updateApplicationStatus = async (applicationId, status, userId, notes) => {
    // Verify application exists
    const application = await prisma.jobApplication.findUnique({
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
        throw new NotFoundError('Application not found');
    }
    // Verify user is the employer who owns this job's company
    if (application.job.company.ownerId !== userId) {
        throw new UnauthorizedError('Not authorized to update this application');
    }
    // Validate status
    const validStatuses = ['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
        throw new BadRequestError(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    // Update application status
    return prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
            status: status,
            // If we had a notes field, we'd update it here
        }
    });
};
/**
 * Records a job view and handles duplicate prevention
 * @param jobId The ID of the job being viewed
 * @param userId The ID of the user viewing the job
 */
export const recordJobViewActivity = async (jobId, userId) => {
    return recordJobView(jobId, userId);
};
