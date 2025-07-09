import prisma from '../../prisma/client.js';
/**
 * Gets recent activity for a job seeker
 * @param userId The job seeker user ID
 */
export const getJobSeekerActivity = async (userId) => {
    // Get recent job views
    const views = await prisma.jobView.findMany({
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
    const applications = await prisma.jobApplication.findMany({
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
    const saves = await prisma.savedJob.findMany({
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
    return allActivities.slice(0, 10).map(activity => ({
        ...activity,
        timestamp: activity.timestamp.toISOString()
    }));
};
/**
 * Gets recent activity for an employer
 * @param companyId The company ID
 */
export const getEmployerActivity = async (companyId) => {
    // Get recent job postings
    const jobPostings = await prisma.job.findMany({
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
    const expiredJobs = await prisma.job.findMany({
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
    const newApplications = await prisma.jobApplication.findMany({
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
    const interviews = await prisma.jobApplication.findMany({
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
        ...newApplications.map((app) => ({
            id: app.id,
            type: 'NEW_APPLICATION',
            timestamp: app.createdAt,
            title: `New application from ${app.applicant?.firstName ?? ''} ${app.applicant?.lastName ?? ''}`,
            relatedEntity: app.job?.title ?? '',
            entityId: app.job?.id ?? ''
        })),
        ...interviews.map((app) => ({
            id: app.id,
            type: 'INTERVIEW_SCHEDULED',
            timestamp: app.updatedAt,
            title: `Interview scheduled with ${app.applicant?.firstName} ${app.applicant?.lastName}`,
            relatedEntity: app.job?.title,
            entityId: app.job?.id
        }))
    ].sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));
    // Return only the latest 10 activities
    return allActivities.slice(0, 10).map(activity => ({
        ...activity,
        timestamp: activity.timestamp?.toISOString()
    }));
};
