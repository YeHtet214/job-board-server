import { Request, Response, NextFunction } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { CustomError } from '../../types/error.js';
import { authValidation } from './auth.validation.js';
import { jobValidation } from './job.validation.js';
import { applicationValidation } from './application.validation.js';
import { profileValidation } from './profile.validation.js';

/**
 * Middleware to validate request data based on the validation chains
 * @returns Express middleware function
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: Record<string, string> = {};
  errors.array().forEach((err: ValidationError) => {
    if (err.type === 'field' && err.path && err.msg) {
      extractedErrors[err.path] = err.msg;
    }
  });

  const error = new Error('Validation failed') as CustomError;
  error.status = 400;
  error.data = extractedErrors;
  
  next(error);
};

export { authValidation, jobValidation, applicationValidation, profileValidation };
