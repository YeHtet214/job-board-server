"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobValidation = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validation rules for job endpoints
 */
exports.jobValidation = {
    // Validation for getting all jobs with optional filters
    getAll: [
        (0, express_validator_1.query)('title')
            .optional()
            .isString().withMessage('Title must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.query)('location')
            .optional()
            .isString().withMessage('Location must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.query)('type')
            .optional()
            .isString().withMessage('Job type must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer')
            .toInt(),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
            .toInt()
    ],
    // Validation for getting a job by ID
    getById: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Job ID is required')
            .isString().withMessage('Job ID must be a string')
            .trim()
            .escape()
    ],
    // Validation for getting jobs by company ID
    getByCompanyId: [
        (0, express_validator_1.param)('companyId')
            .notEmpty().withMessage('Company ID is required')
            .isString().withMessage('Company ID must be a string')
            .trim()
            .escape()
    ],
    // Validation for creating a job
    create: [
        (0, express_validator_1.body)('title')
            .notEmpty().withMessage('Job title is required')
            .isString().withMessage('Job title must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('description')
            .notEmpty().withMessage('Job description is required')
            .isString().withMessage('Job description must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('requirements')
            .notEmpty().withMessage('Job requirements are required')
            .isArray().withMessage('Job requirements must be an array')
            .custom(requirements => {
            if (!requirements.every((requirement) => typeof requirement === 'string')) {
                throw new Error('Each requirement must be a string');
            }
            return true;
        }),
        (0, express_validator_1.body)('location')
            .notEmpty().withMessage('Job location is required')
            .isString().withMessage('Job location must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('salary')
            .optional()
            .isObject().withMessage('Salary must be an object'),
        (0, express_validator_1.body)('salary.min')
            .optional()
            .isNumeric().withMessage('Minimum salary must be a number')
            .toFloat(),
        (0, express_validator_1.body)('salary.max')
            .optional()
            .isNumeric().withMessage('Maximum salary must be a number')
            .toFloat()
            .custom((max, { req }) => {
            var _a;
            const min = (_a = req.body.salary) === null || _a === void 0 ? void 0 : _a.min;
            if (min && max && max < min) {
                throw new Error('Maximum salary cannot be less than minimum salary');
            }
            return true;
        }),
        (0, express_validator_1.body)('salary.currency')
            .optional()
            .isString().withMessage('Salary currency must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('type')
            .notEmpty().withMessage('Job type is required')
            .isString().withMessage('Job type must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('companyId')
            .notEmpty().withMessage('Company ID is required')
            .isString().withMessage('Company ID must be a string')
            .trim()
            .escape()
    ],
    // Validation for updating a job
    update: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Job ID is required')
            .isString().withMessage('Job ID must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('title')
            .optional()
            .isString().withMessage('Job title must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('description')
            .optional()
            .isString().withMessage('Job description must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('requirements')
            .optional()
            .isArray().withMessage('Job requirements must be an array')
            .custom(requirements => {
            if (!requirements.every((requirement) => typeof requirement === 'string')) {
                throw new Error('Each requirement must be a string');
            }
            return true;
        }),
        (0, express_validator_1.body)('location')
            .optional()
            .isString().withMessage('Job location must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('salary')
            .optional()
            .isObject().withMessage('Salary must be an object'),
        (0, express_validator_1.body)('salary.min')
            .optional()
            .isNumeric().withMessage('Minimum salary must be a number')
            .toFloat(),
        (0, express_validator_1.body)('salary.max')
            .optional()
            .isNumeric().withMessage('Maximum salary must be a number')
            .toFloat()
            .custom((max, { req }) => {
            var _a;
            const min = (_a = req.body.salary) === null || _a === void 0 ? void 0 : _a.min;
            if (min && max && max < min) {
                throw new Error('Maximum salary cannot be less than minimum salary');
            }
            return true;
        }),
        (0, express_validator_1.body)('salary.currency')
            .optional()
            .isString().withMessage('Salary currency must be a string')
            .trim()
            .escape(),
        (0, express_validator_1.body)('type')
            .optional()
            .isString().withMessage('Job type must be a string')
            .trim()
            .escape()
    ],
    // Validation for deleting a job
    delete: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Job ID is required')
            .isString().withMessage('Job ID must be a string')
            .trim()
            .escape()
    ]
};
