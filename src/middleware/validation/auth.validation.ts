import { body, param } from 'express-validator';

/**
 * Validation rules for authentication endpoints
 */
export const authValidation = {
  // Validation for user signup
  signUp: [
    body('firstName')
      .notEmpty().withMessage('First name is required')
      .isString().withMessage('First name must be a string')
      .trim()
      .escape(),
    body('lastName')
      .notEmpty().withMessage('Last name is required')
      .isString().withMessage('Last name must be a string')
      .trim()
      .escape(),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid')
      .normalizeEmail()
      .trim(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      .trim(),
    body('role')
      .optional()
      .isIn(['JOBSEEKER', 'EMPLOYER']).withMessage('Role must be either JOBSEEKER or EMPLOYER')
      .trim()
  ],
  
  // Validation for user signin
  signIn: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid')
      .normalizeEmail()
      .trim(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .trim()
  ],
  
  // Validation for email verification
  verifyEmail: [
    param('token')
      .notEmpty().withMessage('Verification token is required')
      .isString().withMessage('Verification token must be a string')
      .trim()
  ]
};
