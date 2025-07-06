import prisma from "../../prisma/client.js";
export const fetchAllApplicationsByUserId = async (userId) => {
    const applications = await prisma.jobApplication.findMany({
        where: { applicantId: userId },
        omit: { jobId: true },
        include: { job: { include: { company: true } } }
    });
    if (!applications || applications.length === 0) {
        const error = new Error('Applications not found');
        error.status = 404;
        throw error;
    }
    return applications;
};
export const fetchAllApplicationsByJobId = async (jobId) => {
    const applications = await prisma.jobApplication.findMany({
        where: { jobId }
    });
    if (!applications || applications.length === 0) {
        const error = new Error('Applications not found');
        error.status = 404;
        throw error;
    }
    return applications;
};
export const fetchApplicationById = async (id) => {
    const application = await prisma.jobApplication.findUnique({
        where: { id },
        include: { job: { include: { company: true } } }
    });
    if (!application) {
        const error = new Error('Application not found');
        error.status = 404;
        throw error;
    }
    return application;
};
export const postNewApplication = async (applicationData) => {
    // Check if job exists
    console.log(applicationData);
    console.log("Job ID: ", applicationData.jobId);
    const job = await prisma.job.findUnique({
        where: { id: applicationData.jobId }
    });
    if (!job) {
        const error = new Error('Job not found');
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
    console.log("Existing Application: ", applicationData.applicantId);
    if (existingApplication) {
        const error = new Error('You have already applied for this job');
        error.status = 400;
        throw error;
    }
    console.log("Job: ", job);
    console.log("Application Data: ", applicationData);
    // Create new application
    const newApplication = await prisma.jobApplication.create({
        data: {
            jobId: applicationData.jobId,
            applicantId: applicationData.applicantId,
            resumeUrl: applicationData.resumeUrl,
            coverLetter: applicationData.coverLetter,
            additionalInfo: applicationData.additionalInfo,
            acceptTerms: true,
            status: 'PENDING'
        }
    });
    console.log("New Application: ", newApplication);
    return newApplication;
};
export const updateApplicationById = async (applicationData) => {
    // Check if application exists
    const application = await prisma.jobApplication.findUnique({
        where: { id: applicationData.id }
    });
    if (!application) {
        const error = new Error('Application not found');
        error.status = 404;
        throw error;
    }
    // Update application
    const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationData.id },
        data: {
            resumeUrl: applicationData.resumeUrl,
            coverLetter: applicationData.coverLetter,
            status: applicationData.status
        }
    });
    console.log("Updated data; ", updatedApplication);
    return updatedApplication;
};
export const deleteExistingApplication = async (id) => {
    // Check if application exists
    const application = await prisma.jobApplication.findUnique({
        where: { id }
    });
    if (!application) {
        const error = new Error('Application not found');
        error.status = 404;
        throw error;
    }
    // Delete application
    const deletedApplication = await prisma.jobApplication.delete({
        where: { id }
    });
    return deletedApplication;
};
