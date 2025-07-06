import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errorHandler.js";
import { RequestWithUser } from "../types/users.type.js";
import { JWT_SECRET } from "../config/env.config.js";
import prisma from "../prisma/client.js";

const authorize = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new BadRequestError("Authentication token is required");
    }

    // Check if token is in blacklist
    const isBlacklistedToken = await prisma.blacklistedToken.findFirst({
      where: { token }
    });

    if (isBlacklistedToken) {
      throw new UnauthorizedError("Token has been revoked");
    }

    // Pre-check token expiration
    const decoded = jwt.decode(token as string);

    if (typeof decoded === 'object' && decoded !== null) {
      if (!decoded || (decoded.exp && decoded.exp < Date.now().valueOf() / 1000)) {
        throw new UnauthorizedError("Token has expired");
      }
    }

    // Verify token with the secret
    try {
      const secret = JWT_SECRET as string;
      const user = jwt.verify(token, secret) as { userId: string, [key: string]: any };
      
      req.user = user;
      next();
    } catch (jwtError) {
      throw new UnauthorizedError("Invalid authentication token");
    }
  } catch (error) {
    next(error);
  }
}

export default authorize;