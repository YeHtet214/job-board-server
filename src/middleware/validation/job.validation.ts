import { body, param, query } from 'express-validator';

/**
 * Validation rules for job endpoints
 */
export const jobValidation = {
  // Validation for getting all jobs with optional filters
  getAll: [
    query('title')
      .optional()
      .isString().withMessage('Title must be a string')
      .trim()
      .escape(),
    query('location')
      .optional()
      .isString().withMessage('Location must be a string')
      .trim()
      .escape(),
    query('type')
      .optional()
      .isString().withMessage('Job type must be a string')
      .trim()
      .escape(),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt()
  ],
  
  // Validation for getting a job by ID
  getById: [
    param('id')
      .notEmpty().withMessage('Job ID is required')
      .isString().withMessage('Job ID must be a string')
      .trim()
      .escape()
  ],
  
  // Validation for getting jobs by company ID
  getByCompanyId: [
    param('companyId')
      .notEmpty().withMessage('Company ID is required')
      .isString().withMessage('Company ID must be a string')
      .trim()
      .escape()
  ],
  
  // Validation for creating a job
  create: [
    body('title')
      .notEmpty().withMessage('Job title is required')
      .isString().withMessage('Job title must be a string')
      .trim()
      .escape(),
    body('description')
      .notEmpty().withMessage('Job description is required')
      .isString().withMessage('Job description must be a string')
      .trim()
      .escape(),
    body('requirements')
      .notEmpty().withMessage('Job requirements are required')
      .isArray().withMessage('Job requirements must be an array')
      .custom(requirements => {
        if (!requirements.every(req => typeof req === 'string')) {
          throw new Error('Each requirement must be a string');
        }
        return true;
      }),
    body('location')
      .notEmpty().withMessage('Job location is required')
      .isString().withMessage('Job location must be a string')
      .trim()
      .escape(),
    body('salary')
      .optional()
      .isObject().withMessage('Salary must be an object'),
    body('salary.min')
      .optional()
      .isNumeric().withMessage('Minimum salary must be a number')
      .toFloat(),
    body('salary.max')
      .optional()
      .isNumeric().withMessage('Maximum salary must be a number')
      .toFloat()
      .custom((max, { req }) => {
        const min = req.body.salary?.min;
        if (min && max && max < min) {
          throw new Error('Maximum salary cannot be less than minimum salary');
        }
        return true;
      }),
    body('salary.currency')
      .optional()
      .isString().withMessage('Salary currency must be a string')
      .trim()
      .escape(),
    body('type')
      .notEmpty().withMessage('Job type is required')
      .isString().withMessage('Job type must be a string')
      .trim()
      .escape(),
    body('companyId')
      .notEmpty().withMessage('Company ID is required')
      .isString().withMessage('Company ID must be a string')
      .trim()
      .escape()
  ],
  
  // Validation for updating a job
  update: [
    param('id')
      .notEmpty().withMessage('Job ID is required')
      .isString().withMessage('Job ID must be a string')
      .trim()
      .escape(),
    body('title')
      .optional()
      .isString().withMessage('Job title must be a string')
      .trim()
      .escape(),
    body('description')
      .optional()
      .isString().withMessage('Job description must be a string')
      .trim()
      .escape(),
    body('requirements')
      .optional()
      .isArray().withMessage('Job requirements must be an array')
      .custom(requirements => {
        if (!requirements.every(req => typeof req === 'string')) {
          throw new Error('Each requirement must be a string');
        }
        return true;
      }),
    body('location')
      .optional()
      .isString().withMessage('Job location must be a string')
      .trim()
      .escape(),
    body('salary')
      .optional()
      .isObject().withMessage('Salary must be an object'),
    body('salary.min')
      .optional()
      .isNumeric().withMessage('Minimum salary must be a number')
      .toFloat(),
    body('salary.max')
      .optional()
      .isNumeric().withMessage('Maximum salary must be a number')
      .toFloat()
      .custom((max, { req }) => {
        const min = req.body.salary?.min;
        if (min && max && max < min) {
          throw new Error('Maximum salary cannot be less than minimum salary');
        }
        return true;
      }),
    body('salary.currency')
      .optional()
      .isString().withMessage('Salary currency must be a string')
      .trim()
      .escape(),
    body('type')
      .optional()
      .isString().withMessage('Job type must be a string')
      .trim()
      .escape()
  ],
  
  // Validation for deleting a job
  delete: [
    param('id')
      .notEmpty().withMessage('Job ID is required')
      .isString().withMessage('Job ID must be a string')
      .trim()
      .escape()
  ]
};
