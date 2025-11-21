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
exports.deleteJobHandler = exports.updateJobHandler = exports.createJobHandler = exports.getSearchSuggestionsHandler = exports.getJobsByCompanyId = exports.getJobById = exports.getAllJobs = void 0;
const job_service_js_1 = require("../services/job/job.service.js");
const prismaClient_js_1 = __importDefault(require("../lib/prismaClient.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
// Public controllers - no authentication required
const getAllJobs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract search parameters from query
        const { keyword, location, jobTypes, experienceLevel, page, limit, sortBy, } = req.query;
        console.log("Query jobTypes incoming: ", jobTypes);
        // Parse and prepare search params
        const searchParams = {
            keyword: keyword,
            location: location,
            jobTypes: jobTypes ? (Array.isArray(jobTypes) ? jobTypes : Array(jobTypes)) : [],
            experienceLevel: experienceLevel,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            sortBy: sortBy,
        };
        // Fetch jobs with search parameters
        const result = yield (0, job_service_js_1.fetchAllJobs)(searchParams);
        res.status(200).json({
            success: true,
            message: 'Jobs fetched successfully',
            data: result.jobs,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllJobs = getAllJobs;
const getJobById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const job = yield (0, job_service_js_1.fetchJobById)(id);
        res.status(200).json({
            success: true,
            message: 'Job fetched successfully',
            data: job,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getJobById = getJobById;
const getJobsByCompanyId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.params.companyId;
        // Extract pagination and sorting parameters
        const { page, limit, sortBy } = req.query;
        // Parse and prepare search params
        const searchParams = {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            sortBy: sortBy,
        };
        const jobsData = yield (0, job_service_js_1.fetchJobsByCompanyId)(companyId, searchParams);
        res.status(200).json({
            success: true,
            message: 'Jobs fetched successfully',
            data: jobsData,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getJobsByCompanyId = getJobsByCompanyId;
const getSearchSuggestionsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { term, type, limit } = req.query;
        if (!term) {
            throw new errorHandler_js_1.BadRequestError('Search term is required');
        }
        const suggestions = yield (0, job_service_js_1.getSearchSuggestions)(term, type || 'all', limit ? parseInt(limit, 10) : 5);
        res.status(200).json({
            success: true,
            message: 'Search suggestions fetched successfully',
            data: suggestions,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSearchSuggestionsHandler = getSearchSuggestionsHandler;
// Protected controllers - authentication required
const createJobHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Fetch the user's company
        const company = yield prismaClient_js_1.default.company.findFirst({
            where: { ownerId: userId },
            select: { id: true },
        });
        if (!company) {
            throw new errorHandler_js_1.BadRequestError('You need to create a company before posting a job');
        }
        // Pass request body, user ID, and company ID to the service
        const newJob = yield (0, job_service_js_1.createJob)(Object.assign(Object.assign({}, req.body), { postedById: userId, companyId: company.id }));
        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: newJob,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createJobHandler = createJobHandler;
const updateJobHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.params.id;
        // Pass job ID, update data, and user ID to the service
        const updatedJob = yield (0, job_service_js_1.updateJob)(jobId, req.body, req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: updatedJob,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateJobHandler = updateJobHandler;
const deleteJobHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedJob = yield (0, job_service_js_1.deleteExistingJob)(id, req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
            data: deletedJob,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteJobHandler = deleteJobHandler;
