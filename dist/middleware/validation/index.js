"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileValidation = exports.applicationValidation = exports.jobValidation = exports.authValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const auth_validation_js_1 = require("./auth.validation.js");
Object.defineProperty(exports, "authValidation", { enumerable: true, get: function () { return auth_validation_js_1.authValidation; } });
const job_validation_js_1 = require("./job.validation.js");
Object.defineProperty(exports, "jobValidation", { enumerable: true, get: function () { return job_validation_js_1.jobValidation; } });
const application_validation_js_1 = require("./application.validation.js");
Object.defineProperty(exports, "applicationValidation", { enumerable: true, get: function () { return application_validation_js_1.applicationValidation; } });
const profile_validation_js_1 = require("./profile.validation.js");
Object.defineProperty(exports, "profileValidation", { enumerable: true, get: function () { return profile_validation_js_1.profileValidation; } });
/**
 * Middleware to validate request data based on the validation chains
 * @returns Express middleware function
 */
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
exports.validate = validate;
