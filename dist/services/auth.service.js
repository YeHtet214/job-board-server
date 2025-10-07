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
exports.resetPassword = exports.requestPasswordReset = exports.resendVerificationEmail = exports.verifyEmail = exports.userLogout = exports.refreshAccessToken = exports.userSignIn = exports.userSignUp = exports.storeRefreshToken = exports.generateTokens = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const errorHandler_1 = require("../middleware/errorHandler");
const env_config_1 = require("../config/env.config");
const emailService_config_1 = __importDefault(require("../config/emailService.config"));
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const checkUserExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prismaClient_1.default.user.findUnique({
        where: { email }
    });
    return user;
});
/**
 * Generates an access token and refresh token for a given user ID and email.
 * Access token is used to authenticate user for a short period of time.
 * Refresh token is used to generate a new access token once the existing one expires.
 *
 * @param userId the ID of the user
 * @param email the email of the user
 * @returns an object containing the access token and refresh token
 */
const generateTokens = (userId, email) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId, email }, env_config_1.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, email }, env_config_1.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const storeRefreshToken = (userId, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    yield prismaClient_1.default.refreshToken.create({
        data: {
            token: refreshToken,
            userId,
            expiresAt
        }
    });
});
exports.storeRefreshToken = storeRefreshToken;
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationLink = `${env_config_1.FRONTEND_URL}/verify-email/${token}`;
    yield (0, emailService_config_1.default)({
        email,
        link: verificationLink,
        type: 'verify'
    });
});
const userSignUp = (firstName, lastName, email, password, role) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
        throw new errorHandler_1.BadRequestError('All fields are required');
    }
    const existingUser = yield checkUserExists(email);
    if (existingUser) {
        throw new errorHandler_1.ConflictError('User with this email already exists');
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    const user = yield prismaClient_1.default.user.create({
        data: {
            firstName,
            lastName,
            email,
            passwordHash: hashedPassword,
            role,
            emailVerificationToken: verificationToken
        }
    });
    yield sendVerificationEmail(email, verificationToken);
    const { accessToken, refreshToken } = (0, exports.generateTokens)(user.id, user.email);
    yield (0, exports.storeRefreshToken)(user.id, refreshToken);
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        }
    };
});
exports.userSignUp = userSignUp;
const userSignIn = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate required fields
    if (!email || !password) {
        throw new errorHandler_1.BadRequestError('Email and password are required');
    }
    const user = yield checkUserExists(email);
    if (!user || !user.passwordHash) {
        throw new errorHandler_1.UnauthorizedError('Invalid credentials');
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new errorHandler_1.UnauthorizedError('Invalid credentials');
    }
    if (!user.isEmailVerified) {
        throw new errorHandler_1.UnauthorizedError('Please verify your email before signing in');
    }
    const { accessToken, refreshToken } = (0, exports.generateTokens)(user.id, email);
    yield (0, exports.storeRefreshToken)(user.id, refreshToken);
    return {
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken
    };
});
exports.userSignIn = userSignIn;
const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken) {
        throw new errorHandler_1.BadRequestError('Refresh token is required');
    }
    // Find the refresh token in the database
    const storedToken = yield prismaClient_1.default.refreshToken.findFirst({
        where: {
            token: refreshToken,
            expiresAt: {
                gt: new Date()
            }
        }
    });
    if (!storedToken) {
        throw new errorHandler_1.UnauthorizedError('Invalid or expired refresh token');
    }
    try {
        // Verify the refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_config_1.REFRESH_TOKEN_SECRET);
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, env_config_1.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        return { accessToken };
    }
    catch (error) {
        throw new errorHandler_1.UnauthorizedError('Invalid refresh token');
    }
});
exports.refreshAccessToken = refreshAccessToken;
const userLogout = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new errorHandler_1.BadRequestError('Token is required');
    }
    try {
        // Verify the access token to get the user ID
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            throw new errorHandler_1.UnauthorizedError('Invalid token');
        }
        // Delete all refresh tokens for this user (effectively logging them out everywhere)
        yield prismaClient_1.default.refreshToken.deleteMany({
            where: {
                userId: decoded.userId
            }
        });
        // Add token to blacklist to prevent reuse
        yield prismaClient_1.default.blacklistedToken.create({
            data: {
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });
        return { message: 'Logged out successfully' };
    }
    catch (error) {
        // If the token is invalid or expired
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errorHandler_1.UnauthorizedError('Invalid token');
        }
        // For any other unexpected error
        throw new errorHandler_1.InternalServerError('Error during logout process');
    }
});
exports.userLogout = userLogout;
const verifyEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new errorHandler_1.BadRequestError('Verification token is required');
    }
    // First check if token is already in blacklist (previously used)
    const blacklistedToken = yield prismaClient_1.default.blacklistedToken.findFirst({
        where: { token }
    });
    // If token is blacklisted, it means it was already used for verification
    if (blacklistedToken) {
        return { message: 'Your email has already been verified. Please log in.' };
    }
    // Find user with this verification token
    const user = yield prismaClient_1.default.user.findFirst({
        where: {
            emailVerificationToken: token
        }
    });
    if (!user) {
        throw new errorHandler_1.BadRequestError('Invalid verification token');
    }
    // Check if email is already verified
    if (user.isEmailVerified) {
        return { message: 'Email already verified. Please log in.' };
    }
    // Verify the email
    yield prismaClient_1.default.user.update({
        where: {
            id: user.id
        },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null
        }
    });
    // Add the token to blacklist to prevent reuse
    yield prismaClient_1.default.blacklistedToken.create({
        data: {
            token,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
    });
    // Create profile for JOB_SEEKER only
    if (user.role === 'JOBSEEKER') {
        try {
            // Create a job seeker profile
            yield prismaClient_1.default.$executeRaw `
        INSERT INTO "JobSeekerProfile" ("userId", "createdAt", "updatedAt")
        VALUES (${user.id}, NOW(), NOW())
      `;
        }
        catch (error) {
            console.error('Error creating job seeker profile:', error);
            // Don't throw here, as email verification succeeded
        }
    }
    return { message: 'Email verified successfully. You can now log in.' };
});
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new errorHandler_1.BadRequestError('Email is required');
    }
    const user = yield checkUserExists(email);
    if (!user) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    if (user.isEmailVerified) {
        throw new errorHandler_1.BadRequestError('Email is already verified');
    }
    // Generate a new verification token
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    // Update the user with the new token
    yield prismaClient_1.default.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken: verificationToken,
            updatedAt: new Date() // Update the timestamp
        }
    });
    // Send the verification email with the new token
    yield sendVerificationEmail(email, verificationToken);
    return { message: 'Verification email has been resent successfully. Please check your inbox.' };
});
exports.resendVerificationEmail = resendVerificationEmail;
const requestPasswordReset = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new errorHandler_1.BadRequestError('Email is required');
    }
    const user = yield checkUserExists(email);
    if (!user) {
        throw new errorHandler_1.NotFoundError('User not found');
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    yield prismaClient_1.default.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpiry: resetTokenExpiry
        }
    });
    const resetLink = `${env_config_1.FRONTEND_URL}/reset-password/${resetToken}`;
    yield (0, emailService_config_1.default)({
        email,
        link: resetLink,
        type: 'resetPassword'
    });
    return { message: 'Password reset email sent successfully' };
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token || !newPassword) {
        throw new errorHandler_1.BadRequestError('Token and new password are required');
    }
    const user = yield prismaClient_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpiry: {
                gt: new Date()
            }
        }
    });
    if (!user) {
        throw new errorHandler_1.BadRequestError('Invalid or expired reset token');
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
    yield prismaClient_1.default.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        }
    });
    // Blacklist the token to prevent reuse
    yield prismaClient_1.default.blacklistedToken.create({
        data: {
            token,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
    });
    return { message: 'Password reset successful' };
});
exports.resetPassword = resetPassword;
