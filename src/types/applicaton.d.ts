import { JobResponse } from "../types/job.js";
import { UserRole } from "../types/users.js";

type ApplicationStatus = "PENDING" | "INTERVIEW" | "ACCEPTED" | "REJECTED";

export interface createApplicationDto {
    jobId: string;
    resumeUrl: string;
    coverLetter: string;
    applicantId: string;
    additionalInfo: string;
}

export interface updateApplicationDto {
    id: string;
    resumeUrl?: string;
    coverLetter?: string;
    status?: ApplicationStatus;
    additionalInfo?: string;
}

export interface applicationResponse {
    id: string;
    job: JobResponse;
    applicant: UserResponse;
    resumeUrl: string;
    coverLetter: string;
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    phone: string | null;
    profile: ProfileResponse | null;
}

export interface ProfileResponse {
    id: string;
    bio: string | null;
    address: string | null;
    education: string | null;
    experience: string | null;
    skills: string[];
    socialLinks: Record<string, string> | null;
}
