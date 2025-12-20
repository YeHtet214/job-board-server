import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../types/error.js';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
      const message = err.message || 'Invalid data type';

      error = new Error(message) as CustomError;
      error.status = 400;
    }
    
    if (err.name === 'ValidationError') {
      const message = err.message || 'Validation failed';
      error = new Error(message) as CustomError;
      error.status = 400;
    }
    
    if (err.name === 'NotFoundError') {
      const message = err.message || 'Resource not found';
      error = new Error(message) as CustomError;
      error.status = 404;
    }
    
    if (err.name === 'UnauthorizedError') {
      const message = err.message || 'Unauthorized access';
      error = new Error(message) as CustomError;
      error.status = 401;
    } 
    
    if (err.name === 'ForbiddenError') {
      const message = err.message || 'Forbidden access';
      error = new Error(message) as CustomError;
      error.status = 403;
    } 
    
    if (err.name === 'ConflictError') {
      const message = err.message || 'Resource conflict';
      error = new Error(message) as CustomError;
      error.status = 409;
    }
    
    if (err.name === 'InternalServerError') {
      const message = err.message || 'Internal server error';
      error = new Error(message) as CustomError;
      error.status = 500;
    }

    // Handle Prisma database connection errors
    if (err.message && err.message.includes("Can't reach database server")) {
      const message = 'Database connection failed. Please check your network.';
      error = new Error(message) as CustomError;
      error.status = 503; // Service Unavailable
    }

    res.status(error.status || 500).json({ 
      message: error.message || 'Internal server error',
      data: err.data
    });
  } catch (error) {
      next(error);
  }
};

export default errorHandler;