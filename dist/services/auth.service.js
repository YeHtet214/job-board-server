import prisma from "../prisma/client.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError, InternalServerError } from '../middleware/errorHandler.js';
import { JWT_SECRET, REFRESH_TOKEN_SECRET, SMTP_CONFIG, SMTP_FROM_EMAIL, FRONTEND_URL } from "../config/env.config.js";
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';
const transporter = nodemailer.createTransport(SMTP_CONFIG);
const checkUserExists = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });
    return user;
};
export const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};
export const storeRefreshToken = async (userId, refreshToken) => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId,
            expiresAt
        }
    });
};
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;
    await transporter.sendMail({
        from: SMTP_FROM_EMAIL,
        to: email,
        subject: 'Verify your email address',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #211951;">
          <h1 style="color: #211951; margin: 0;">Job Board</h1>
          <p style="color: #666; font-size: 14px; margin-top: 5px;">Connect with opportunities</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for creating an account! To get started, please verify your email address by clicking the button below.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #211951; color: white; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px;">Verify Email Address</a>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.5;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #333;">${verificationLink}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #777; font-size: 14px;">
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 4px; margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Need help? Contact our support team at <a href="mailto:support@jobboard.com" style="color: #211951;">support@jobboard.com</a></p>
          <p>&copy; ${new Date().getFullYear()} Job Board. All rights reserved.</p>
        </div>
      </div>
    `
    });
};
export const userSignUp = async (firstName, lastName, email, password, role) => {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
        throw new BadRequestError('All fields are required');
    }
    const existingUser = await checkUserExists(email);
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            passwordHash: hashedPassword,
            role,
            emailVerificationToken: verificationToken
        }
    });
    await sendVerificationEmail(email, verificationToken);
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);
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
};
export const userSignIn = async (email, password) => {
    // Validate required fields
    if (!email || !password) {
        throw new BadRequestError('Email and password are required');
    }
    const user = await checkUserExists(email);
    if (!user || !user.passwordHash) {
        throw new UnauthorizedError('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
    }
    if (!user.isEmailVerified) {
        throw new UnauthorizedError('Please verify your email before signing in');
    }
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);
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
};
export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new BadRequestError('Refresh token is required');
    }
    // Find the refresh token in the database
    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            token: refreshToken,
            expiresAt: {
                gt: new Date()
            }
        }
    });
    if (!storedToken) {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        // Generate new access token
        const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        return { accessToken };
    }
    catch (error) {
        throw new UnauthorizedError('Invalid refresh token');
    }
};
export const userLogout = async (token) => {
    if (!token) {
        throw new BadRequestError('Token is required');
    }
    try {
        // Verify the access token to get the user ID
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.userId) {
            throw new UnauthorizedError('Invalid token');
        }
        // Delete all refresh tokens for this user (effectively logging them out everywhere)
        await prisma.refreshToken.deleteMany({
            where: {
                userId: decoded.userId
            }
        });
        // Add token to blacklist to prevent reuse
        await prisma.blacklistedToken.create({
            data: {
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });
        return { message: 'Logged out successfully' };
    }
    catch (error) {
        // If the token is invalid or expired
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        }
        // For any other unexpected error
        throw new InternalServerError('Error during logout process');
    }
};
export const verifyEmail = async (token) => {
    if (!token) {
        throw new BadRequestError('Verification token is required');
    }
    // First check if token is already in blacklist (previously used)
    const blacklistedToken = await prisma.blacklistedToken.findFirst({
        where: { token }
    });
    // If token is blacklisted, it means it was already used for verification
    if (blacklistedToken) {
        return { message: 'Your email has already been verified. Please log in.' };
    }
    // Find user with this verification token
    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: token
        }
    });
    if (!user) {
        throw new BadRequestError('Invalid verification token');
    }
    // Check if email is already verified
    if (user.isEmailVerified) {
        return { message: 'Email already verified. Please log in.' };
    }
    // Verify the email
    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null
        }
    });
    // Add the token to blacklist to prevent reuse
    await prisma.blacklistedToken.create({
        data: {
            token,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
    });
    // Create profile for JOB_SEEKER only
    if (user.role === 'JOBSEEKER') {
        try {
            // Create a job seeker profile
            await prisma.$executeRaw `
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
};
export const resendVerificationEmail = async (email) => {
    if (!email) {
        throw new BadRequestError('Email is required');
    }
    const user = await checkUserExists(email);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    if (user.isEmailVerified) {
        throw new BadRequestError('Email is already verified');
    }
    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Update the user with the new token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken: verificationToken,
            updatedAt: new Date() // Update the timestamp
        }
    });
    // Send the verification email with the new token
    await sendVerificationEmail(email, verificationToken);
    return { message: 'Verification email has been resent successfully. Please check your inbox.' };
};
export const requestPasswordReset = async (email) => {
    if (!email) {
        throw new BadRequestError('Email is required');
    }
    const user = await checkUserExists(email);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpiry: resetTokenExpiry
        }
    });
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
        from: SMTP_FROM_EMAIL,
        to: email,
        subject: 'Reset Your Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #211951;">
          <h1 style="color: #211951; margin: 0;">Job Board</h1>
          <p style="color: #666; font-size: 14px; margin-top: 5px;">Connect with opportunities</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #333;">Reset Password</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">To get access to your account back, reset password by clicking the button below.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #211951; color: white; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px;">Reset Password</a>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.5;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #333;">${resetLink}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #777; font-size: 14px;">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 4px; margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Need help? Contact our support team at <a href="mailto:support@jobboard.com" style="color: #211951;">support@jobboard.com</a></p>
          <p>&copy; ${new Date().getFullYear()} Job Board. All rights reserved.</p>
        </div>
      </div>
    `
    });
    return { message: 'Password reset email sent successfully' };
};
export const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) {
        throw new BadRequestError('Token and new password are required');
    }
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpiry: {
                gt: new Date()
            }
        }
    });
    if (!user) {
        throw new BadRequestError('Invalid or expired reset token');
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        }
    });
    // Blacklist the token to prevent reuse
    await prisma.blacklistedToken.create({
        data: {
            token,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
    });
    return { message: 'Password reset successful' };
};
