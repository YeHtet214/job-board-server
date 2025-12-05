import { CookieOptions, NextFunction, Request, Response } from 'express';
import {
  userSignIn,
  userSignUp,
  verifyEmail,
  userLogout,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  refreshTokenService,
} from '../services/auth.service.js';
import { RequestWithUser } from '../types/users.js';
import { UnauthorizedError } from '@/middleware/errorHandler.js';

// Cookie configuration
const REFRESH_TOKEN_COOKIE_CONFIG: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Handles user sign-up.
 * @param req - Express request object, expects body with firstName, lastName, email, password, and role.
 * @param res - Express response object.
 * @returns A promise that resolves to sending a JSON response.
 */

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const { accessToken, refreshToken, user } = await userSignUp(
      firstName,
      lastName,
      email,
      password,
      role,
    );

    if (!refreshToken) throw new UnauthorizedError('Invalid credentials');

    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_CONFIG);

    res.status(201).json({
      success: true,
      message:
        'Successfully signed up. Please check your email for verification.',
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await userSignIn(
      email,
      password,
    );

    if (!refreshToken) throw new UnauthorizedError('Invalid credentials');

    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_CONFIG);

    res.status(200).json({
      success: true,
      message: 'Successfully signed in',
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken  = req.cookies.refreshToken;


    console.log("refresh token in cookie: ", refreshToken)
    const { accessToken } = await refreshTokenService(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    const result = await verifyEmail(token);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from authorization header
    const token = req.headers['authorization']?.split(' ')[1] || '';

    const result = await userLogout(token);

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Resends verification email to the user
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const result = await resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const result = await requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, newPassword } = req.body;

    const result = await resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
