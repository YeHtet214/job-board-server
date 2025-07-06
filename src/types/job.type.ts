export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

export interface CreateJobDto {
  title: string;
  description: string;
  companyId: string;
  location?: string;
  type: JobType;
  postedById: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  experienceLevel?: string;
  expiresAt?: Date | string;
}

export interface JobResponse {
  id: string;
  title: string;
  description: string;
  companyId: string;
  postedById: string;
  location?: string;
  type: JobType;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  experienceLevel?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
