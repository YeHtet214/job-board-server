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
exports.fetchUserById = exports.fetchUsers = void 0;
const client_js_1 = __importDefault(require("@/lib/client.js"));
/**
 * Get all users without sensitive information
 * @returns Array of user data without sensitive fields
 */
const fetchUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield client_js_1.default.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Exclude sensitive fields like passwordHash, tokens, etc.
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    if (!users || users.length === 0) {
        const error = new Error('Users not found');
        error.status = 404;
        throw error;
    }
    return users;
});
exports.fetchUsers = fetchUsers;
/**
 * Get user by ID without sensitive information
 * @param id User ID to fetch
 * @returns User data without sensitive fields
 */
const fetchUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield client_js_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Exclude sensitive fields like passwordHash, tokens, etc.
        }
    });
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    return user;
});
exports.fetchUserById = fetchUserById;
