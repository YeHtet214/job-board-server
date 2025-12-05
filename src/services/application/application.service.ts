import prisma from "../../lib/prismaClient.js"
import { CustomError } from "../../types/error.js";
import { createApplicationDto, updateApplicationDto } from "../../types/applicaton.js";
import { notifyEmployerOfApplication, notifyApplicantOfStatusUpdate } from '../socket.service.js';

export const fetchAllApplicationsByUserId = async (userId: string) => {
    const applications = await prisma.jobApplication.findMany({
        where: { applicantId: userId },
        omit: { jobId: true },
        include: { job: { include: { company: true } } }
    });

    if (!applications || applications.length === 0) {
        const error = new Error('Applications not found') as CustomError;
        error.status = 404;
        throw error;
    }

    return applications;
}

export const fetchAllApplicationsByJobId = async (jobId: string) => {
    const applications = await prisma.jobApplication.findMany({
        where: { jobId }
    });

    if (!applications || applications.length === 0) {
        const error = new Error('Applications not found') as CustomError;
        error.status = 404;
        throw error;
    }

    return applications;
}

export const fetchApplicationById = async (id: string) => {
    const application = await prisma.jobApplication.findUnique({
        where: { id },
        include: {
            job: { include: { company: true } },
            applicant: { select: { firstName: true, lastName: true } }
        }
    });

    if (!application) {
        const error = new Error('Application not found') as CustomError;
        error.status = 404;
        throw error;
    }

    return application;
}

export const postNewApplication = async (applicationData: createApplicationDto, user: any) => {
    // Check if job exists
    const job = await prisma.job.findUnique({
        where: { id: applicationData.jobId }
    });

    if (!job) {
        const error = new Error('Job not found') as CustomError;
        error.status = 404;
        throw error;
    }

    // Check if user already applied for this job
    const existingApplication = await prisma.jobApplication.findFirst({
        where: {
            jobId: applicationData.jobId,
            applicantId: applicationData.applicantId
        }
    });

    if (existingApplication) {
        const error = new Error('You have already applied for this job') as CustomError;
        error.status = 400;
        throw error;
    }

    const newApplication = await prisma.jobApplication.create({
        data: {
            jobId: applicationData.jobId,
            applicantId: applicationData.applicantId,
            resumeFileId: applicationData.resumeFileId,
            coverLetter: applicationData.coverLetter,
            additionalInfo: applicationData.additionalInfo,
            acceptTerms: true,
            status: 'PENDING'
        },
        include: { job: { include: { company: true } }, resume: true }
    });


    // Notify employer of new application
    try {
        if (job && user) {
            await notifyEmployerOfApplication({
                applicationId: newApplication.id,
                jobId: newApplication.jobId,
                jobTitle: job.title,
                applicantId: newApplication.applicantId,
                applicantName: `${user.firstName} ${user.lastName}`,
                employerId: job.postedById,
            });
        }
    } catch (err) {
        console.error('Failed to create notification for employer:', err);
    }

    return { application: newApplication, job: newApplication.job };
}

export const updateApplicationById = async (applicationData: updateApplicationDto) => {
    // Check if application exists
    const application = await prisma.jobApplication.findUnique({
        where: { id: applicationData.id },
        include: { job: { include: { company: true } }, resume: true }
    });

    if (!application) {
        const error = new Error('Application not found') as CustomError;
        error.status = 404;
        throw error;
    }

    const statusChanged = applicationData.status && applicationData.status !== application.status;

    // Update application
    const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationData.id },
        data: {
            resumeFileId: applicationData.resumeFileId,
            coverLetter: applicationData.coverLetter,
            status: applicationData.status || application.status,
        },
        include: { job: { include: { company: true } }, resume: true }
    });

    // Notify applicant if status changed
    if (statusChanged) {
        try {
            await notifyApplicantOfStatusUpdate({
                applicationId: updatedApplication.id,
                jobId: updatedApplication.jobId,
                jobTitle: updatedApplication.job.title,
                companyName: updatedApplication.job.company.name,
                applicantId: updatedApplication.applicantId,
                newStatus: updatedApplication.status,
            });
        } catch (err) {
            console.error('Failed to create notification for applicant:', err);
        }
    }

    return { application: updatedApplication, statusChanged, job: updatedApplication.job };
}

export const deleteExistingApplication = async (id: string) => {
    // Check if application exists
    const application = await prisma.jobApplication.findUnique({
        where: { id }
    });

    if (!application) {
        const error = new Error('Application not found') as CustomError;
        error.status = 404;
        throw error;
    }

    // Delete application
    const deletedApplication = await prisma.jobApplication.delete({
        where: { id }
    });

    return deletedApplication;
}