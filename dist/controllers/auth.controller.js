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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.forgotPassword = exports.resendVerification = exports.logout = exports.verifyEmailToken = exports.refresh = exports.signIn = exports.signUp = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
/**
 * Handles user sign-up.
 * @param req - Express request object, expects body with firstName, lastName, email, password, and role.
 * @param res - Express response object.
 * @returns A promise that resolves to sending a JSON response.
 */
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        const { accessToken, refreshToken, user } = yield (0, auth_service_js_1.userSignUp)(firstName, lastName, email, password, role);
        res.status(201).json({
            success: true,
            message: 'Successfully signed up. Please check your email for verification.',
            data: { accessToken, refreshToken, user },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.signUp = signUp;
const signIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("Sign in email & password: ", email, password);
        const { user, accessToken, refreshToken } = yield (0, auth_service_js_1.userSignIn)(email, password);
        res.status(200).json({
            success: true,
            message: 'Successfully signed in',
            data: { user, accessToken, refreshToken },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.signIn = signIn;
const refresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        const { accessToken } = yield (0, auth_service_js_1.refreshAccessToken)(refreshToken);
        res.status(200).json({
            success: true,
            message: 'Access token refreshed successfully',
            data: { accessToken },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.refresh = refresh;
const verifyEmailToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const result = yield (0, auth_service_js_1.verifyEmail)(token);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmailToken = verifyEmailToken;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get token from authorization header
        const token = ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || '';
        const result = yield (0, auth_service_js_1.userLogout)(token);
        res.status(200).json({ success: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
/**
 * Resends verification email to the user
 */
const resendVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const result = yield (0, auth_service_js_1.resendVerificationEmail)(email);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.resendVerification = resendVerification;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const result = yield (0, auth_service_js_1.requestPasswordReset)(email);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPasswordHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        const result = yield (0, auth_service_js_1.resetPassword)(token, newPassword);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPasswordHandler = resetPasswordHandler;
