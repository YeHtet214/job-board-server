import { userSignIn, userSignUp, refreshAccessToken, verifyEmail, userLogout, resendVerificationEmail, requestPasswordReset, resetPassword } from "../services/auth.service.js";
/**
 * Handles user sign-up.
 * @param req - Express request object, expects body with firstName, lastName, email, password, and role.
 * @param res - Express response object.
 * @returns A promise that resolves to sending a JSON response.
 */
export const signUp = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        const { accessToken, refreshToken, user } = await userSignUp(firstName, lastName, email, password, role);
        res.status(201).json({
            success: true,
            message: "Successfully signed up. Please check your email for verification.",
            data: { accessToken, refreshToken, user }
        });
    }
    catch (error) {
        next(error);
    }
};
export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await userSignIn(email, password);
        res.status(200).json({
            success: true,
            message: "Successfully signed in",
            data: { user, accessToken, refreshToken }
        });
    }
    catch (error) {
        next(error);
    }
};
export const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const { accessToken } = await refreshAccessToken(refreshToken);
        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: { accessToken }
        });
    }
    catch (error) {
        next(error);
    }
};
export const verifyEmailToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const result = await verifyEmail(token);
        res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        // Get token from authorization header
        const token = req.headers['authorization']?.split(' ')[1] || '';
        const result = await userLogout(token);
        res.status(200).json({ success: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
};
/**
 * Resends verification email to the user
 */
export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await resendVerificationEmail(email);
        res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        next(error);
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await requestPasswordReset(email);
        res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        next(error);
    }
};
export const resetPasswordHandler = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const result = await resetPassword(token, newPassword);
        res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        next(error);
    }
};
