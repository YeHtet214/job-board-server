import { validationResult } from 'express-validator';
import { authValidation } from './auth.validation.js';
import { jobValidation } from './job.validation.js';
import { applicationValidation } from './application.validation.js';
import { profileValidation } from './profile.validation.js';
/**
 * Middleware to validate request data based on the validation chains
 * @returns Express middleware function
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = {};
    errors.array().forEach((err) => {
        if (err.type === 'field' && err.path && err.msg) {
            extractedErrors[err.path] = err.msg;
        }
    });
    const error = new Error('Validation failed');
    error.status = 400;
    error.data = extractedErrors;
    next(error);
};
export { authValidation, jobValidation, applicationValidation, profileValidation };
