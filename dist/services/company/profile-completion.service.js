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
exports.getCompanyProfileCompletion = exports.calculateCompanyProfileCompletion = exports.calculateJobSeekerProfileCompletion = void 0;
const client_js_1 = __importDefault(require("@/prisma/client.js"));
const errorHandler_js_1 = require("@/middleware/errorHandler.js");
/**
 * Calculates job seeker profile completion percentage
 * @param userId The user ID
 * @returns Profile completion percentage
 */
const calculateJobSeekerProfileCompletion = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield client_js_1.default.profile.findUnique({
        where: { userId }
    });
    if (!profile)
        return 0;
    let completionPercentage = 0;
    // Base completion for having a profile
    completionPercentage += 20;
    // Has education entries
    if (profile.education && Array.isArray(JSON.parse(JSON.stringify(profile.education))) &&
        JSON.parse(JSON.stringify(profile.education)).length > 0) {
        completionPercentage += 20;
    }
    // Has experience entries
    if (profile.experience && Array.isArray(JSON.parse(JSON.stringify(profile.experience))) &&
        JSON.parse(JSON.stringify(profile.experience)).length > 0) {
        completionPercentage += 20;
    }
    // Has skills
    if (profile.skills && profile.skills.length > 2) {
        completionPercentage += 20;
    }
    // Has resume
    if (profile.resumeUrl) {
        completionPercentage += 20;
    }
    console.log("Profile: ", profile);
    console.log("Completion Percentage: ", completionPercentage);
    return completionPercentage;
});
exports.calculateJobSeekerProfileCompletion = calculateJobSeekerProfileCompletion;
/**
 * Calculates company profile completion status
 * @param company The company object
 * @returns Completion percentage and whether the profile is complete
 */
const calculateCompanyProfileCompletion = (company) => {
    let percentage = 0;
    let requiredFieldsCount = 0;
    let completedFieldsCount = 0;
    // Basic info
    const requiredFields = [
        'name',
        'website',
        'industry',
        'size',
        'location',
        'description'
    ];
    requiredFieldsCount += requiredFields.length;
    for (const field of requiredFields) {
        if (company[field]) {
            completedFieldsCount++;
        }
    }
    // Company logo
    requiredFieldsCount++;
    if (company.logo) {
        completedFieldsCount++;
    }
    // Calculate percentage
    percentage = Math.round((completedFieldsCount / requiredFieldsCount) * 100);
    // Mark as complete if 80% or more is complete
    return {
        percentage,
        complete: percentage >= 80
    };
};
exports.calculateCompanyProfileCompletion = calculateCompanyProfileCompletion;
/**
 * Gets company profile completion information for an employer
 * @param userId The user ID (employer)
 */
const getCompanyProfileCompletion = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify the user is an employer
    const user = yield client_js_1.default.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    if (!user || user.role !== "EMPLOYER") {
        throw new errorHandler_js_1.UnauthorizedError('User is not an employer');
    }
    // Get the company for this employer
    const company = yield client_js_1.default.company.findFirst({
        where: { ownerId: userId }
    });
    if (!company) {
        return { complete: false, percentage: 0 };
    }
    return (0, exports.calculateCompanyProfileCompletion)(company);
});
exports.getCompanyProfileCompletion = getCompanyProfileCompletion;
