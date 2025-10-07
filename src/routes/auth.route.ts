import { RequestHandler, Router } from "express";
import passport from 'passport';
import { signUp, signIn, logout, refresh, verifyEmailToken, resendVerification, forgotPassword, resetPasswordHandler } from "../controllers/auth.controller";
import authorize from "../middleware/auth.middleware.js";
import { generateTokens, storeRefreshToken } from "../services/auth.service.js";
import { FRONTEND_URL } from "../config/env.config.js";

const authRouter = Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.post('/refresh-token', refresh);
authRouter.get('/verify-email/:token', verifyEmailToken);
authRouter.post('/logout', authorize as RequestHandler, logout as RequestHandler);
authRouter.post('/resend-verification', resendVerification);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPasswordHandler);

// Google OAuth routes
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login?error=authentication_failed`,
    session: false
}),
    async (req, res) => {
        try {
            // User will be available from passport
            const user = req.user;

            if (!user || !user.id) {
                return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
            }

            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(user.id, user.email);

            // Store refresh token in database
            await storeRefreshToken(user.id, refreshToken);

            // Redirect to frontend with tokens
            res.redirect(`${FRONTEND_URL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${FRONTEND_URL}/login?error=server_error`);
        }
    }
);

export default authRouter;