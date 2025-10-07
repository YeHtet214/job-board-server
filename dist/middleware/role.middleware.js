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
exports.jobseekerOnly = exports.employerOnly = exports.checkRole = void 0;
const client_js_1 = __importDefault(require("@/lib/client.js"));
/**
 * Middleware to check if a user has the required role
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
const checkRole = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // User should already be authenticated at this point
            const { userId } = req.user;
            if (!userId) {
                const error = new Error('Authentication required');
                error.status = 401;
                throw error;
            }
            // Fetch the user from the database to get their role
            const user = yield client_js_1.default.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });
            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }
            if (!roles.includes(user.role)) {
                const error = new Error('You do not have permission to perform this action');
                error.status = 403;
                throw error;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.checkRole = checkRole;
/**
 * Middleware specifically for employer-only routes
 */
exports.employerOnly = (0, exports.checkRole)(['EMPLOYER']);
/**
 * Middleware specifically for jobseeker-only routes
 */
exports.jobseekerOnly = (0, exports.checkRole)(['JOBSEEKER']);
