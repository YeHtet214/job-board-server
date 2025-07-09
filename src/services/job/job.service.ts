import prisma from "../../prisma/client.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../middleware/errorHandler.js";
import { CreateJobDto } from "../../types/job.type.js";
import { JobType } from "../../types/job.type.js";
import { fetchUserById } from "../user.service.js";
import { Prisma } from '@prisma/client';

// Define search params interface to match frontend
export interface JobSearchParams {
    keyword?: string;
    location?: string;
    jobTypes?: JobType[];
    experienceLevel?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
}

// Basic data access functions
export const fetchAllJobs = async (params?: JobSearchParams) => {
    const {
        keyword = '',
        location = '',
        jobTypes = [],
        experienceLevel = '',
        page = 1,
        limit = 10,
        sortBy = 'date_desc' // Default to newest first
    } = params || {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    const filters: Prisma.JobWhereInput = {
        isActive: true,
        ...(keyword && {
            OR: [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ],
        }),
        ...(location && {
            location: { contains: location, mode: 'insensitive' },
        }),
        ...(jobTypes.length > 0 && {
            type: { in: jobTypes },
        }),
        ...(experienceLevel && {
            experienceLevel,
        }),
    };

    const orderBy: Prisma.JobOrderByWithRelationInput = (() => {
        switch (sortBy) {
            case 'date_desc':
                return { createdAt: 'desc' };
            case 'date_asc':
                return { createdAt: 'asc' };
            case 'salary_desc':
                return { salaryMax: 'desc' };
            case 'salary_asc':
                return { salaryMin: 'asc' };
            case 'relevance':
            default:
                return { createdAt: 'desc' };
        }
    })();

    console.log("ORder by: ", orderBy);

    // Count query
    const totalCount = await prisma.job.count({
        where: filters,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch jobs with pagination, sorting, and filtering
    const jobs = await prisma.job.findMany({
        where: filters,
        orderBy: orderBy,
        skip,
        take: limit,
        include: {
            company: {
                select: {
                    name: true,
                    logo: true,
                    industry: true,
                }
            },
            postedBy: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        }
    });

    console.log("returned jobs: ", jobs);

    // Return in the format expected by the frontend
    return {
        jobs,
        totalPages,
        totalCount,
        currentPage: page
    };
}

export const fetchJobById = async (id: string) => {
    if (!id) {
        throw new BadRequestError('Job ID is required');
    }

    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            company: {
                select: {
                    name: true,
                    logo: true,
                    industry: true,
                }
            },
            postedBy: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        }
    });

    if (!job) {
        throw new NotFoundError('Job not found');
    }

    return job;
}

export const fetchJobsByCompanyId = async (companyId: string, params?: JobSearchParams) => {
    if (!companyId) {
        throw new BadRequestError('Company ID is required');
    }

    const {
        page = 1,
        limit = 10,
        sortBy = 'date_desc' // Default to newest first
    } = params || {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the where clause
    const where = {
        companyId,
        isActive: true,
    };

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
        case 'date_desc':
            orderBy = { createdAt: 'desc' };
            break;
        case 'date_asc':
            orderBy = { createdAt: 'asc' };
            break;
        case 'salary_desc':
            orderBy = { salaryMax: 'desc' };
            break;
        case 'salary_asc':
            orderBy = { salaryMin: 'asc' };
            break;
        default:
            orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const totalCount = await prisma.job.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch jobs with pagination and sorting
    const jobs = await prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
            company: {
                select: {
                    name: true,
                    logo: true,
                    industry: true,
                }
            },
            postedBy: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        }
    });

    return {
        jobs,
        totalPages,
        totalCount,
        currentPage: page
    };
}

/**
 * Get search suggestions for autocomplete
 * @param term The search term to get suggestions for
 * @param type The type of suggestions (keyword, location, or all)
 * @param limit Maximum number of suggestions to return
 * @returns Array of suggestion strings
 */
export const getSearchSuggestions = async (
    term: string,
    type: 'keyword' | 'location' | 'all' = 'all',
    limit: number = 5
): Promise<string[]> => {
    if (!term) {
        throw new BadRequestError('Search term is required');
    }

    let keywordSuggestions: string[] = [];
    let locationSuggestions: string[] = [];

    // Get job title/description suggestions
    if (type === 'keyword' || type === 'all') {
        // First, search for matches in job titles
        const titleMatches: { title: string }[] = await prisma.job.findMany({
            where: {
                title: {
                    contains: term,
                    mode: 'insensitive'
                },
                isActive: true
            },
            select: {
                title: true,
            },
            distinct: ['title'],
            take: limit
        });

        keywordSuggestions = titleMatches.map((jobTitle: { title: string }) => jobTitle.title);

        // If we need more suggestions, search in required skills
        if (keywordSuggestions.length < limit) {
            const skillsMatches: { requiredSkills: string[] }[] = await prisma.job.findMany({
                where: {
                    requiredSkills: {
                        has: term // This assumes requiredSkills is an array
                    },
                    isActive: true
                },
                select: {
                    requiredSkills: true
                },
                take: limit - keywordSuggestions.length
            });

            // Extract skills that match the term
            const skillSuggestions = skillsMatches.flatMap((matches: { requiredSkills: string[] }) =>
                matches.requiredSkills.filter(skill =>
                    skill.toLowerCase().includes(term.toLowerCase())
                )
            );

            // Add unique skills to suggestions
            keywordSuggestions = [...new Set([...keywordSuggestions, ...skillSuggestions])];
        }
    }

    // Get location suggestions
    if (type === 'location' || type === 'all') {
        const locationMatches: { location: string | null }[] = await prisma.job.findMany({
            where: {
                location: {
                    contains: term,
                    mode: 'insensitive'
                },
                isActive: true
            },
            select: {
                location: true
            },
            distinct: ['location'],
            take: limit
        });

        locationSuggestions = locationMatches
            .map((location: { location: string | null }) => location.location)
            .filter(location => location !== null && location !== '') as string[];
    }

    // Combine and limit results
    let suggestions: string[];
    if (type === 'keyword') {
        suggestions = keywordSuggestions;
    } else if (type === 'location') {
        suggestions = locationSuggestions;
    } else {
        suggestions = [...keywordSuggestions, ...locationSuggestions];
    }

    // Deduplicate and limit
    return [...new Set(suggestions)].slice(0, limit);
};

// Define the type for job create parameters
export interface JobCreateData {
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
    expiresAt?: Date | string;
}

// Define the type for job update parameters
export interface UpdateJobDto extends Partial<JobCreateData> {
    isActive?: boolean;
}

/**
 * Validates and processes job data before creation
 */
export const createJob = async (jobData: Partial<CreateJobDto> & { postedById: string }) => {
    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.companyId || !jobData.type || !jobData.postedById) {
        throw new BadRequestError('Missing required job fields');
    }

    // Validate job type
    if (!['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(jobData.type)) {
        throw new BadRequestError('Invalid job type. Must be one of: FULL_TIME, PART_TIME, CONTRACT');
    }

    // Validate salary if provided
    if (jobData.salaryMin && jobData.salaryMax && Number(jobData.salaryMin) > Number(jobData.salaryMax)) {
        throw new BadRequestError('Minimum salary cannot be greater than maximum salary');
    }

    // Fetch the user's company
    const userCompany = await prisma.company.findFirst({
        where: { ownerId: jobData.postedById },
        select: { id: true }
    });

    if (!userCompany) {
        throw new BadRequestError("You need to create a company before posting a job");
    }

    // Process and transform the job data
    const processedData: JobCreateData = {
        title: jobData.title,
        description: jobData.description,
        companyId: userCompany.id,
        postedById: jobData.postedById,
        location: jobData.location,
        type: jobData.type as JobType,
        salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : undefined,
        salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : undefined,
        requiredSkills: Array.isArray(jobData.requiredSkills) ? jobData.requiredSkills : [],
        experienceLevel: jobData.experienceLevel,
        expiresAt: jobData.expiresAt
    };

    // Create the job in the database
    return createNewJob(processedData);
}

/**
 * Validates and processes job update data
 */
export const updateJob = async (jobId: string, updateData: Partial<UpdateJobDto>, userId: string) => {
    if (!jobId) {
        throw new BadRequestError('Job ID is required');
    }

    if (!userId) {
        throw new BadRequestError('User ID is required');
    }

    // Check if job exists and user has permission
    const existingJob = await fetchJobById(jobId);

    const userRole = (await fetchUserById(userId))?.role;

    // Verify ownership
    if (existingJob.postedById !== userId || userRole !== 'EMPLOYER') {
        throw new ForbiddenError('You don\'t have permission to update this job');
    }

    // Validate job type if provided
    if (updateData.type && !['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(updateData.type)) {
        throw new BadRequestError('Invalid job type. Must be one of: FULL_TIME, PART_TIME, CONTRACT');
    }

    // Process and transform the update data
    const processedUpdateData: UpdateJobDto = {};

    // Only include fields that were provided
    if (updateData.title !== undefined) processedUpdateData.title = updateData.title;
    if (updateData.description !== undefined) processedUpdateData.description = updateData.description;
    if (updateData.location !== undefined) processedUpdateData.location = updateData.location;
    if (updateData.type !== undefined) processedUpdateData.type = updateData.type as JobType;
    if (updateData.salaryMin !== undefined) processedUpdateData.salaryMin = Number(updateData.salaryMin);
    if (updateData.salaryMax !== undefined) processedUpdateData.salaryMax = Number(updateData.salaryMax);
    if (updateData.requiredSkills !== undefined) {
        processedUpdateData.requiredSkills = Array.isArray(updateData.requiredSkills)
            ? updateData.requiredSkills
            : [];
    }
    if (updateData.experienceLevel !== undefined) processedUpdateData.experienceLevel = updateData.experienceLevel;
    if (updateData.expiresAt !== undefined) processedUpdateData.expiresAt = updateData.expiresAt;
    if (updateData.isActive !== undefined) processedUpdateData.isActive = updateData.isActive;

    // Update the job in the database
    return updateExistingJob(jobId, processedUpdateData);
}

// Database operation functions (private to the service)
/**
 * Creates a new job in the database
 * @private Should only be called from within the service
 */
const createNewJob = async (jobData: JobCreateData) => {
    const job = await prisma.job.create({
        data: {
            ...jobData,
            expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt) : undefined
        }
    });

    return job;
}

/**
 * Updates an existing job in the database
 * @private Should only be called from within the service
 */
const updateExistingJob = async (id: string, data: UpdateJobDto) => {
    // Update the job
    const updatedJob = await prisma.job.update({
        where: { id },
        data: {
            ...data,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
        }
    });

    return updatedJob;
}

export const deleteExistingJob = async (id: string, userId: string) => {
    if (!id) {
        throw new BadRequestError('Job ID is required');
    }

    if (!userId) {
        throw new BadRequestError('User ID is required');
    }

    const existingJob = await fetchJobById(id);

    const userRole = (await fetchUserById(userId))?.role;

    if (existingJob.postedById !== userId || userRole !== 'EMPLOYER') {
        throw new ForbiddenError('You don\'t have permission to delete this job');
    }

    return prisma.job.delete({ where: { id } });
}