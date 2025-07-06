import { param } from 'express-validator';
/**
 * Validation rules for user endpoints
 */
export const userValidation = {
    // Validation for getting a user by ID
    getById: [
        param('id')
            .notEmpty().withMessage('User ID is required')
            .isString().withMessage('User ID must be a string')
            .trim()
            .escape()
    ]
};
