import { body, param } from 'express-validator';

/**
 * Validation rules for application endpoints
 */
export const applicationValidation = {
  // Validation for creating a new application
  create: [
    param('jobId')
      .notEmpty().withMessage('Job ID is required')
      .isString().withMessage('Job ID must be a string')
      .trim()
      .escape(),
    body('fullName')
      .notEmpty().withMessage('Full name is required')
      .isString().withMessage('Full name must be a string')
      .trim()
      .escape(),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isString().withMessage('Email must be a string')
      .trim()
      .escape(),
    body('phone')
      .notEmpty().withMessage('Phone is required')
      .isString().withMessage('Phone must be a string')
      .trim()
      .escape(),
    body('resume')
      .optional()
      .custom((value: any) => {
        if (value && value.mimetype !== 'application/pdf') {
          throw new Error('Resume must be a PDF file');
        }
        return true;
      }),
    body('useExistingResume')
      .optional()
      .isBoolean().withMessage('Use existing resume must be a boolean'),
    body('resumeUrl')
      .notEmpty().withMessage('Resume URL is required')
      .isURL().withMessage('Resume URL must be a valid URL')
      .trim(),
    body('coverLetter')
      .notEmpty().withMessage('Cover letter is required')
      .isString().withMessage('Cover letter must be a string')
      .trim()
      .escape(),
    body('acceptTerms')
      .notEmpty().withMessage('Accept terms is required')
      .isBoolean().withMessage('Accept terms must be a boolean'),
    body('additionalInfo')
      .optional()
      .isString().withMessage('Additional info must be a string')
      .trim()
      .escape()
  ],

  // Validation for updating an application
  update: [
    param('id')
      .notEmpty().withMessage('Application ID is required')
      .isString().withMessage('Application ID must be a string')
      .trim()
      .escape(),
    body('resumeUrl')
      .optional()
      .isURL().withMessage('Resume URL must be a valid URL')
      .trim(),
    body('coverLetter')
      .optional()
      .isString().withMessage('Cover letter must be a string')
      .trim()
      .escape(),
    body('status')
      .optional()
      .isString().withMessage('Status must be a string')
      .trim()
      .escape()
      .isIn(['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED']).withMessage('Status must be PENDING, INTERVIEW, ACCEPTED, or REJECTED'),
    body('fullName')
      .notEmpty().withMessage('Full name is required')
      .isString().withMessage('Full name must be a string')
      .trim()
      .escape(),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isString().withMessage('Email must be a string')
      .trim()
      .escape(),
    body('phone')
      .notEmpty().withMessage('Phone is required')
      .isString().withMessage('Phone must be a string')
      .trim()
      .escape(),
    body('resume')
      .optional()
      .custom((value: any) => {
        if (value && value.mimetype !== 'application/pdf') {
          throw new Error('Resume must be a PDF file');
        }
        return true;
      }),
    body('useExistingResume')
      .optional()
      .isBoolean().withMessage('Use existing resume must be a boolean'),
    body('resumeUrl')
      .notEmpty().withMessage('Resume URL is required')
      .isURL().withMessage('Resume URL must be a valid URL')
      .trim(),
    body('coverLetter')
      .optional()
      .isString().withMessage('Cover letter must be a string')
      .trim()
      .escape(),
    body('acceptTerms')
      .notEmpty().withMessage('Accept terms is required')
      .isBoolean().withMessage('Accept terms must be a boolean'),
    body('additionalInfo')
      .optional()
      .isString().withMessage('Additional info must be a string')
      .trim()
      .escape()
  ],

  // Validation for getting an application by ID
  getByJobId: [
    param('jobId')
      .notEmpty().withMessage('Application ID is required')
      .isString().withMessage('Application ID must be a string')
      .trim()
      .escape()
  ],

  // Validation for getting an application by ID
  getById: [
    param('id')
      .notEmpty().withMessage('Application ID is required')
      .isString().withMessage('Application ID must be a string')
      .trim()
      .escape()
  ],

  // Validation for deleting an application
  delete: [
    param('id')
      .notEmpty().withMessage('Application ID is required')
      .isString().withMessage('Application ID must be a string')
      .trim()
      .escape()
  ]
};
