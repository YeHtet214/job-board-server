import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from './errorHandler.js';
import { RequestWithUser, AuthenticatedUser } from '../types/users.js';
import { JWT_SECRET } from '../config/env.config.js';
import prisma from '../lib/prismaClient.js';

export const verifyToken = (token: string): Promise<AuthenticatedUser> => {
  const decoded = jwt.decode(token);

  if (typeof decoded === 'object' && decoded !== null) {
    if (
      !decoded ||
      (decoded.exp && decoded.exp < Date.now().valueOf() / 1000)
    ) {
      throw new UnauthorizedError('Token has expired');
    }
  }

  const user = jwt.verify(token, JWT_SECRET);

  if (typeof user === 'string' || !user || typeof user !== 'object') {
    throw new UnauthorizedError('Invalid token payload');
  }

  const payload = user as JwtPayload;

  if (!payload.userId || !payload.email || !payload.userName) {
    throw new UnauthorizedError('Invalid token payload structure');
  }

  return Promise.resolve(payload as AuthenticatedUser);
};

const authorize = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new BadRequestError('Authentication token is required');
    }

    // Check if token is in blacklist
    const isBlacklistedToken = await prisma.blacklistedToken.findFirst({
      where: { token },
    });

    if (isBlacklistedToken) {
      throw new UnauthorizedError('Token has been revoked');
    }

    try {
      const user = await verifyToken(token);
      req.user = user;
      next();
    } catch (jwtError) {
      throw new UnauthorizedError('Invalid authentication token');
    }
  } catch (error) {
    next(error);
  }
};

export default authorize;
