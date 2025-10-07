import prisma from "../lib/prismaClient";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { UserRole } from '../types/users';
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError, InternalServerError } from '../middleware/errorHandler';
import { JWT_SECRET, REFRESH_TOKEN_SECRET, FRONTEND_URL } from "../config/env.config";
import sendEmailService from "../config/emailService.config";

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const checkUserExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  return user;
}

/**
 * Generates an access token and refresh token for a given user ID and email.
 * Access token is used to authenticate user for a short period of time.
 * Refresh token is used to generate a new access token once the existing one expires.
 * 
 * @param userId the ID of the user
 * @param email the email of the user
 * @returns an object containing the access token and refresh token
 */
export const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { userId, email },
    JWT_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRY }  
  );

  const refreshToken = jwt.sign(
    { userId, email },
    REFRESH_TOKEN_SECRET as string,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

export const storeRefreshToken = async (userId: string, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt
    }
  });
}

const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;

  await sendEmailService({
    email,
    link: verificationLink,
    type: 'verify'
  });
}

export const userSignUp = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: UserRole
) => {
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

  const { accessToken, refreshToken } = generateTokens(user.id, user.email);
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
}

export const userSignIn = async (email: string, password: string) => {
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

  const { accessToken, refreshToken } = generateTokens(user.id, email);
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
}

export const refreshAccessToken = async (refreshToken: string) => {
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
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as string) as { userId: string };
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET as string,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return { accessToken };
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export const userLogout = async (token: string) => {
  if (!token) {
    throw new BadRequestError('Token is required');
  }

  try {
    // Verify the access token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };
    
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
  } catch (error) {
    // If the token is invalid or expired
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    
    // For any other unexpected error
    throw new InternalServerError('Error during logout process');
  }
}

export const verifyEmail = async (token: string) => {
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
      await prisma.$executeRaw`
        INSERT INTO "JobSeekerProfile" ("userId", "createdAt", "updatedAt")
        VALUES (${user.id}, NOW(), NOW())
      `;
    } catch (error) {
      console.error('Error creating job seeker profile:', error);
      // Don't throw here, as email verification succeeded
    }
  }

  return { message: 'Email verified successfully. You can now log in.' };
}

export const resendVerificationEmail = async (email: string) => {
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
}

export const requestPasswordReset = async (email: string) => {
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

  await sendEmailService({
    email,
    link: resetLink,
    type: 'resetPassword'
  })

  return { message: 'Password reset email sent successfully' };
}

export const resetPassword = async (token: string, newPassword: string) => {
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
}