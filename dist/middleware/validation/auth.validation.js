"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validation rules for authentication endpoints
 */
exports.authValidation = {
    // Validation for user signup
    signUp: [
        (0, express_validator_1.body)('firstName')
            .notEmpty().withMessage('First name is required')
            .isString().withMessage('First name must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('lastName')
            .notEmpty().withMessage('Last name is required')
            .isString().withMessage('Last name must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be valid')
            .normalizeEmail()
            .trim(),
        (0, express_validator_1.body)('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
            .trim(),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(['JOBSEEKER', 'EMPLOYER']).withMessage('Role must be either JOBSEEKER or EMPLOYER')
            .trim()
    ],
    // Validation for user signin
    signIn: [
        (0, express_validator_1.body)('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email must be valid')
            .normalizeEmail()
            .trim(),
        (0, express_validator_1.body)('password')
            .notEmpty().withMessage('Password is required')
            .trim()
    ],
    // Validation for email verification
    verifyEmail: [
        (0, express_validator_1.param)('token')
            .notEmpty().withMessage('Verification token is required')
            .isString().withMessage('Verification token must be a string')
            .trim()
    ]
};
