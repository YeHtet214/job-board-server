import prisma from '@/lib/client.js';

export interface ActivityReturnType {
  id: string;
  job: { id: string ; title: string; company: { name: string } };
  userId?: string;
  createdAt: Date;
}

/**
 * Gets recent activity for a job seeker
 * @param userId The job seeker user ID
 */
export const getJobSeekerActivity = async (userId: string) => {
  // Get recent job views
  const views: ActivityReturnType[] = await prisma.jobView.findMany({
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
  const applications: ActivityReturnType[] = await prisma.jobApplication.findMany({
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
  const saves: ActivityReturnType[] = await prisma.savedJob.findMany({
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
    ...views.map((view: ActivityReturnType) => ({
      id: view.id,
      type: 'VIEW' as const,
      timestamp: view.createdAt,
      title: `Viewed job: ${view.job.title}`,
      relatedEntity: view.job.company.name,
      entityId: view.job.id
    })),
    ...applications.map((app: ActivityReturnType) => ({
      id: app.id,
      type: 'APPLY' as const,
      timestamp: app.createdAt,
      title: `Applied to: ${app.job.title}`,
      relatedEntity: app.job.company.name,
      entityId: app.job.id
    })),
    ...saves.map((save: ActivityReturnType) => ({
      id: save.id,
      type: 'SAVE' as const,
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

interface EmployerActivityReturnType {
  id: string;
  title?: string;
  createdAt?: Date;
  updatedAt?: Date;
  timestamp?: Date;
  applicant?: {
    firstName: string;
    lastName: string;
  };
  job?: {
    id?: string;
    title?: string;
  };
  type?: 'JOB_POSTED' | 'JOB_EXPIRED' | 'NEW_APPLICATION' | 'INTERVIEW_SCHEDULED';
  relatedEntity?: string;
  entityId?: string;
  [key: string]: any; // Allow additional properties
}
/**
 * Gets recent activity for an employer
 * @param companyId The company ID
 */
export const getEmployerActivity = async (companyId: string) => {
  // Get recent job postings
  const jobPostings: EmployerActivityReturnType[] = await prisma.job.findMany({
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
  const expiredJobs: EmployerActivityReturnType[] = await prisma.job.findMany({
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
  const interviews: EmployerActivityReturnType[] = await prisma.jobApplication.findMany({
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
    ...jobPostings.map((job: EmployerActivityReturnType) => ({
      id: job.id,
      type: 'JOB_POSTED' as const,
      timestamp: job.createdAt,
      title: `Job posted: ${job.title}`,
      relatedEntity: 'Your company',
      entityId: job.id
    })),
    ...expiredJobs.map((job: EmployerActivityReturnType) => ({
      id: job.id,
      type: 'JOB_EXPIRED' as const,
      timestamp: job.updatedAt,
      title: `Job expired: ${job.title}`,
      relatedEntity: 'Your company',
      entityId: job.id
    })),
    ...newApplications.map((app: EmployerActivityReturnType) => ({
      id: app.id,
      type: 'NEW_APPLICATION' as const,
      timestamp: app.createdAt,
      title: `New application from ${app.applicant?.firstName ?? ''} ${app.applicant?.lastName ?? ''}`,
      relatedEntity: app.job?.title ?? '',
      entityId: app.job?.id ?? ''
    })),
    ...interviews.map((app: EmployerActivityReturnType) => ({
      id: app.id,
      type: 'INTERVIEW_SCHEDULED' as const,
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
