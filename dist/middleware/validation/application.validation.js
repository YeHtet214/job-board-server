"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationValidation = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validation rules for application endpoints
 */
exports.applicationValidation = {
    // Validation for creating a new application
    create: [
        (0, express_validator_1.param)('jobId')
            .notEmpty().withMessage('Job ID is required')
            .isString().withMessage('Job ID must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('fullName')
            .notEmpty().withMessage('Full name is required')
            .isString().withMessage('Full name must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('email')
            .notEmpty().withMessage('Email is required')
            .isString().withMessage('Email must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('phone')
            .notEmpty().withMessage('Phone is required')
            .isString().withMessage('Phone must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('resume')
            .optional()
            .custom((value) => {
            if (value && value.mimetype !== 'application/pdf') {
                throw new Error('Resume must be a PDF file');
            }
            return true;
        }),
        (0, express_validator_1.body)('useExistingResume')
            .optional()
            .isBoolean().withMessage('Use existing resume must be a boolean'),
        (0, express_validator_1.body)('resumeUrl')
            .notEmpty().withMessage('Resume URL is required')
            .isURL().withMessage('Resume URL must be a valid URL')
            .trim(),
        (0, express_validator_1.body)('coverLetter')
            .notEmpty().withMessage('Cover letter is required')
            .isString().withMessage('Cover letter must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('acceptTerms')
            .notEmpty().withMessage('Accept terms is required')
            .isBoolean().withMessage('Accept terms must be a boolean'),
        (0, express_validator_1.body)('additionalInfo')
            .optional()
            .isString().withMessage('Additional info must be a string')
            .trim()
            .escape()
    ],
    // Validation for updating an application
    update: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Application ID is required')
            .isString().withMessage('Application ID must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('resumeUrl')
            .optional()
            .isURL().withMessage('Resume URL must be a valid URL')
            .trim(),
        (0, express_validator_1.body)('coverLetter')
            .optional()
            .isString().withMessage('Cover letter must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('status')
            .optional()
            .isString().withMessage('Status must be a string')
            .trim()
            .escape()
            .isIn(['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED']).withMessage('Status must be PENDING, INTERVIEW, ACCEPTED, or REJECTED'),
        (0, express_validator_1.body)('fullName')
            .notEmpty().withMessage('Full name is required')
            .isString().withMessage('Full name must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('email')
            .notEmpty().withMessage('Email is required')
            .isString().withMessage('Email must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('phone')
            .notEmpty().withMessage('Phone is required')
            .isString().withMessage('Phone must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('resume')
            .optional()
            .custom((value) => {
            if (value && value.mimetype !== 'application/pdf') {
                throw new Error('Resume must be a PDF file');
            }
            return true;
        }),
        (0, express_validator_1.body)('useExistingResume')
            .optional()
            .isBoolean().withMessage('Use existing resume must be a boolean'),
        (0, express_validator_1.body)('resumeUrl')
            .notEmpty().withMessage('Resume URL is required')
            .isURL().withMessage('Resume URL must be a valid URL')
            .trim(),
        (0, express_validator_1.body)('coverLetter')
            .optional()
            .isString().withMessage('Cover letter must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('acceptTerms')
            .notEmpty().withMessage('Accept terms is required')
            .isBoolean().withMessage('Accept terms must be a boolean'),
        (0, express_validator_1.body)('additionalInfo')
            .optional()
            .isString().withMessage('Additional info must be a string')
            .trim()
            .escape()
    ],
    // Validation for getting an application by ID
    getByJobId: [
        (0, express_validator_1.param)('jobId')
            .notEmpty().withMessage('Application ID is required')
            .isString().withMessage('Application ID must be a string')
            .trim()
            .escape()
    ],
    // Validation for getting an application by ID
    getById: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Application ID is required')
            .isString().withMessage('Application ID must be a string')
            .trim()
            .escape()
    ],
    // Validation for deleting an application
    delete: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Application ID is required')
            .isString().withMessage('Application ID must be a string')
            .trim()
            .escape()
    ]
};
