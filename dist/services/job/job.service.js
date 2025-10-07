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
exports.deleteExistingJob = exports.updateJob = exports.createJob = exports.getSearchSuggestions = exports.fetchJobsByCompanyId = exports.fetchJobById = exports.fetchAllJobs = void 0;
const client_js_1 = __importDefault(require("@/prisma/client.js"));
const errorHandler_js_1 = require("@/middleware/errorHandler.js");
const user_service_js_1 = require("@/services/user/user.service.js");
// Basic data access functions
const fetchAllJobs = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword = '', location = '', jobTypes = [], experienceLevel = '', page = 1, limit = 10, sortBy = 'date_desc' // Default to newest first
     } = params || {};
    // Calculate pagination
    const skip = (page - 1) * limit;
    const filters = Object.assign(Object.assign(Object.assign(Object.assign({ isActive: true }, (keyword && {
        OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
        ],
    })), (location && {
        location: { contains: location, mode: 'insensitive' },
    })), (jobTypes.length > 0 && {
        type: { in: jobTypes },
    })), (experienceLevel && {
        experienceLevel,
    }));
    const orderBy = (() => {
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
    // Count query
    const totalCount = yield client_js_1.default.job.count({
        where: filters,
    });
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // Fetch jobs with pagination, sorting, and filtering
    const jobs = yield client_js_1.default.job.findMany({
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
    // Return in the format expected by the frontend
    return {
        jobs,
        totalPages,
        totalCount,
        currentPage: page
    };
});
exports.fetchAllJobs = fetchAllJobs;
const fetchJobById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id) {
        throw new errorHandler_js_1.BadRequestError('Job ID is required');
    }
    const job = yield client_js_1.default.job.findUnique({
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
        throw new errorHandler_js_1.NotFoundError('Job not found');
    }
    return job;
});
exports.fetchJobById = fetchJobById;
const fetchJobsByCompanyId = (companyId, params) => __awaiter(void 0, void 0, void 0, function* () {
    if (!companyId) {
        throw new errorHandler_js_1.BadRequestError('Company ID is required');
    }
    const { page = 1, limit = 10, sortBy = 'date_desc' // Default to newest first
     } = params || {};
    // Calculate pagination
    const skip = (page - 1) * limit;
    // Build the where clause
    const where = {
        companyId,
        isActive: true,
    };
    // Determine sort order
    let orderBy = {};
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
    const totalCount = yield client_js_1.default.job.count({ where });
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // Fetch jobs with pagination and sorting
    const jobs = yield client_js_1.default.job.findMany({
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
});
exports.fetchJobsByCompanyId = fetchJobsByCompanyId;
/**
 * Get search suggestions for autocomplete
 * @param term The search term to get suggestions for
 * @param type The type of suggestions (keyword, location, or all)
 * @param limit Maximum number of suggestions to return
 * @returns Array of suggestion strings
 */
const getSearchSuggestions = (term_1, ...args_1) => __awaiter(void 0, [term_1, ...args_1], void 0, function* (term, type = 'all', limit = 5) {
    if (!term) {
        throw new errorHandler_js_1.BadRequestError('Search term is required');
    }
    let keywordSuggestions = [];
    let locationSuggestions = [];
    // Get job title/description suggestions
    if (type === 'keyword' || type === 'all') {
        // First, search for matches in job titles
        const titleMatches = yield client_js_1.default.job.findMany({
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
        keywordSuggestions = titleMatches.map((jobTitle) => jobTitle.title);
        // If we need more suggestions, search in required skills
        if (keywordSuggestions.length < limit) {
            const skillsMatches = yield client_js_1.default.job.findMany({
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
            const skillSuggestions = skillsMatches.flatMap((matches) => matches.requiredSkills.filter(skill => skill.toLowerCase().includes(term.toLowerCase())));
            // Add unique skills to suggestions
            keywordSuggestions = [...new Set([...keywordSuggestions, ...skillSuggestions])];
        }
    }
    // Get location suggestions
    if (type === 'location' || type === 'all') {
        const locationMatches = yield client_js_1.default.job.findMany({
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
            .map((location) => location.location)
            .filter(location => location !== null && location !== '');
    }
    // Combine and limit results
    let suggestions;
    if (type === 'keyword') {
        suggestions = keywordSuggestions;
    }
    else if (type === 'location') {
        suggestions = locationSuggestions;
    }
    else {
        suggestions = [...keywordSuggestions, ...locationSuggestions];
    }
    // Deduplicate and limit
    return [...new Set(suggestions)].slice(0, limit);
});
exports.getSearchSuggestions = getSearchSuggestions;
/**
 * Validates and processes job data before creation
 */
const createJob = (jobData) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.companyId || !jobData.type || !jobData.postedById) {
        throw new errorHandler_js_1.BadRequestError('Missing required job fields');
    }
    // Validate job type
    if (!['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(jobData.type)) {
        throw new errorHandler_js_1.BadRequestError('Invalid job type. Must be one of: FULL_TIME, PART_TIME, CONTRACT');
    }
    // Validate salary if provided
    if (jobData.salaryMin && jobData.salaryMax && Number(jobData.salaryMin) > Number(jobData.salaryMax)) {
        throw new errorHandler_js_1.BadRequestError('Minimum salary cannot be greater than maximum salary');
    }
    // Fetch the user's company
    const userCompany = yield client_js_1.default.company.findFirst({
        where: { ownerId: jobData.postedById },
        select: { id: true }
    });
    if (!userCompany) {
        throw new errorHandler_js_1.BadRequestError("You need to create a company before posting a job");
    }
    // Process and transform the job data
    const processedData = {
        title: jobData.title,
        description: jobData.description,
        companyId: userCompany.id,
        postedById: jobData.postedById,
        location: jobData.location,
        type: jobData.type,
        salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : undefined,
        salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : undefined,
        requiredSkills: Array.isArray(jobData.requiredSkills) ? jobData.requiredSkills : [],
        experienceLevel: jobData.experienceLevel,
        expiresAt: jobData.expiresAt
    };
    // Create the job in the database
    return createNewJob(processedData);
});
exports.createJob = createJob;
/**
 * Validates and processes job update data
 */
const updateJob = (jobId, updateData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!jobId) {
        throw new errorHandler_js_1.BadRequestError('Job ID is required');
    }
    if (!userId) {
        throw new errorHandler_js_1.BadRequestError('User ID is required');
    }
    // Check if job exists and user has permission
    const existingJob = yield (0, exports.fetchJobById)(jobId);
    const userRole = (_a = (yield (0, user_service_js_1.fetchUserById)(userId))) === null || _a === void 0 ? void 0 : _a.role;
    // Verify ownership
    if (existingJob.postedById !== userId || userRole !== 'EMPLOYER') {
        throw new errorHandler_js_1.ForbiddenError('You don\'t have permission to update this job');
    }
    // Validate job type if provided
    if (updateData.type && !['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(updateData.type)) {
        throw new errorHandler_js_1.BadRequestError('Invalid job type. Must be one of: FULL_TIME, PART_TIME, CONTRACT');
    }
    // Process and transform the update data
    const processedUpdateData = {};
    // Only include fields that were provided
    if (updateData.title !== undefined)
        processedUpdateData.title = updateData.title;
    if (updateData.description !== undefined)
        processedUpdateData.description = updateData.description;
    if (updateData.location !== undefined)
        processedUpdateData.location = updateData.location;
    if (updateData.type !== undefined)
        processedUpdateData.type = updateData.type;
    if (updateData.salaryMin !== undefined)
        processedUpdateData.salaryMin = Number(updateData.salaryMin);
    if (updateData.salaryMax !== undefined)
        processedUpdateData.salaryMax = Number(updateData.salaryMax);
    if (updateData.requiredSkills !== undefined) {
        processedUpdateData.requiredSkills = Array.isArray(updateData.requiredSkills)
            ? updateData.requiredSkills
            : [];
    }
    if (updateData.experienceLevel !== undefined)
        processedUpdateData.experienceLevel = updateData.experienceLevel;
    if (updateData.expiresAt !== undefined)
        processedUpdateData.expiresAt = updateData.expiresAt;
    if (updateData.isActive !== undefined)
        processedUpdateData.isActive = updateData.isActive;
    // Update the job in the database
    return updateExistingJob(jobId, processedUpdateData);
});
exports.updateJob = updateJob;
// Database operation functions (private to the service)
/**
 * Creates a new job in the database
 * @private Should only be called from within the service
 */
const createNewJob = (jobData) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield client_js_1.default.job.create({
        data: Object.assign(Object.assign({}, jobData), { expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt) : undefined })
    });
    return job;
});
/**
 * Updates an existing job in the database
 * @private Should only be called from within the service
 */
const updateExistingJob = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the job
    const updatedJob = yield client_js_1.default.job.update({
        where: { id },
        data: Object.assign(Object.assign({}, data), { expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined })
    });
    return updatedJob;
});
const deleteExistingJob = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!id) {
        throw new errorHandler_js_1.BadRequestError('Job ID is required');
    }
    if (!userId) {
        throw new errorHandler_js_1.BadRequestError('User ID is required');
    }
    const existingJob = yield (0, exports.fetchJobById)(id);
    const userRole = (_a = (yield (0, user_service_js_1.fetchUserById)(userId))) === null || _a === void 0 ? void 0 : _a.role;
    if (existingJob.postedById !== userId || userRole !== 'EMPLOYER') {
        throw new errorHandler_js_1.ForbiddenError('You don\'t have permission to delete this job');
    }
    return client_js_1.default.job.delete({ where: { id } });
});
exports.deleteExistingJob = deleteExistingJob;
