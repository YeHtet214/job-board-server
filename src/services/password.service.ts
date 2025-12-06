import prisma from '../lib/prismaClient';
import bcrypt from 'bcrypt';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

/**
 * Set password for users who registered via OAuth (Google, etc.)
 * This allows OAuth users to also login with email/password
 */
export const setPasswordForOAuthUser = async (
  userId: string,
  newPassword: string,
) => {
  if (!userId || !newPassword) {
    throw new BadRequestError('User ID and password are required');
  }

  // Validate password strength
  if (newPassword.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters long');
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if user already has a password
  if (user.passwordHash) {
    throw new BadRequestError(
      'Password already set. Use change password instead.',
    );
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update user with new password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
    },
  });

  return {
    message: 'Password set successfully. You can now login with email and password.',
  };
};

/**
 * Change password for existing users (requires current password)
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  if (!userId || !currentPassword || !newPassword) {
    throw new BadRequestError('All fields are required');
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    throw new BadRequestError('New password must be at least 8 characters long');
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.passwordHash) {
    throw new BadRequestError(
      'No password set. Please use set password instead.',
    );
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update user with new password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
    },
  });

  return { message: 'Password changed successfully' };
};

/**
 * Check if user has a password set
 */
export const hasPassword = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  return !!user?.passwordHash;
};
