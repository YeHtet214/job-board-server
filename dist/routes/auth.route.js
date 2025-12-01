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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_js_1 = __importDefault(require("../middleware/auth.middleware.js"));
const auth_service_js_1 = require("../services/auth.service.js");
const env_config_js_1 = require("../config/env.config.js");
const validation_1 = require("@/middleware/validation");
const authRouter = (0, express_1.Router)();
authRouter.post('/signup', validation_1.authValidation.signUp, auth_controller_1.signUp);
authRouter.post('/signin', validation_1.authValidation.signIn, auth_controller_1.signIn);
authRouter.post('/refresh-token', auth_controller_1.refresh);
authRouter.get('/verify-email/:token', validation_1.authValidation.verifyEmail, auth_controller_1.verifyEmailToken);
authRouter.post('/logout', auth_middleware_js_1.default, auth_controller_1.logout);
authRouter.post('/resend-verification', auth_controller_1.resendVerification);
authRouter.post('/forgot-password', auth_controller_1.forgotPassword);
authRouter.post('/reset-password', auth_controller_1.resetPasswordHandler);
// Google OAuth routes
authRouter.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${env_config_js_1.FRONTEND_URL}/login?error=authentication_failed`,
    session: false
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User will be available from passport
        const user = req.user;
        if (!user || !user.userId) {
            return res.redirect(`${env_config_js_1.FRONTEND_URL}/login?error=authentication_failed`);
        }
        // Generate tokens
        const { accessToken, refreshToken } = (0, auth_service_js_1.generateTokens)(user.userId, user.email, "JOBSEEKER", user.userName);
        // Store refresh token in database
        yield (0, auth_service_js_1.storeRefreshToken)(user.userId, refreshToken);
        // Redirect to frontend with tokens
        res.redirect(`${env_config_js_1.FRONTEND_URL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
    catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${env_config_js_1.FRONTEND_URL}/login?error=server_error`);
    }
}));
exports.default = authRouter;
