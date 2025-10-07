"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validation rules for user endpoints
 */
exports.userValidation = {
    // Validation for getting a user by ID
    getById: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('User ID is required')
            .isString().withMessage('User ID must be a string')
            .trim()
            .escape()
    ]
};
