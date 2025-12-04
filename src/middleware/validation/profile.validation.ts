import { body } from 'express-validator';

/**
 * Validation rules for profile endpoints
 */

export const profileValidation = {
  // Validation for creating a profile
  createProfile: [
    body('bio')
      .notEmpty()
      .withMessage('Bio is required')
      // .isString().withMessage('Bio must be a string')
      .trim(),
    body('skills')
      .isArray({ min: 1 })
      .withMessage('At least one skill is required')
      .custom((skills: string[]) => {
        if (!skills.every((skill: string) => typeof skill === 'string')) {
          throw new Error('All skills must be strings');
        }
        return true;
      }),
    body('education')
      .isArray()
      .withMessage('Education must be an array')
      .custom((educationArr: any[]) => {
        if (!educationArr.length) return true;

        for (const edu of educationArr) {
          if (!edu.institution || typeof edu.institution !== 'string') {
            throw new Error('Institution is required for each education entry');
          }
          if (!edu.degree || typeof edu.degree !== 'string') {
            throw new Error('Degree is required for each education entry');
          }
          if (!edu.fieldOfStudy || typeof edu.fieldOfStudy !== 'string') {
            throw new Error(
              'Field of study is required for each education entry',
            );
          }
          if (!edu.startDate || typeof edu.startDate !== 'string') {
            throw new Error('Start date is required for each education entry');
          }
        }
        return true;
      }),
    body('experience')
      .isArray()
      .withMessage('Experience must be an array')
      .custom((experienceArr: any[]) => {
        if (!experienceArr.length) return true;

        for (const exp of experienceArr) {
          if (!exp.company || typeof exp.company !== 'string') {
            throw new Error('Company is required for each experience entry');
          }
          if (!exp.position || typeof exp.position !== 'string') {
            throw new Error('Position is required for each experience entry');
          }
          if (!exp.startDate || typeof exp.startDate !== 'string') {
            throw new Error('Start date is required for each experience entry');
          }
          if (!exp.description || typeof exp.description !== 'string') {
            throw new Error(
              'Description is required for each experience entry',
            );
          }
        }
        return true;
      }),
    body('linkedInUrl')
      .optional()
      .isURL()
      .withMessage('LinkedIn URL must be a valid URL')
      .trim(),
    body('githubUrl')
      .isURL()
      .withMessage('GitHub URL must be a valid URL')
      .trim(),
    body('portfolioUrl')
      .isURL()
      .withMessage('Portfolio URL must be a valid URL')
      .trim(),
    body('resumeFileId')
      .isString()
      .withMessage('Resume file ID must be a string')
      .trim(),
  ],

  // Validation for updating a profile - similar to create but all fields are optional
  updateProfile: [
    body('bio')
      .optional()
      .isString()
      .withMessage('Bio must be a string')
      .trim(),
    body('skills')
      .isArray({ min: 1 })
      .withMessage('At least one skill is required')
      .custom((skills: string[] | undefined) => {
        if (!skills) return true;
        if (!skills.every((skill: string) => typeof skill === 'string')) {
          throw new Error('All skills must be strings');
        }
        return true;
      }),
    body('education')
      .optional()
      .isArray()
      .withMessage('Education must be an array')
      .custom((educationArr: any[] | undefined) => {
        if (!educationArr || !educationArr.length) return true;

        for (const edu of educationArr) {
          if (!edu.institution || typeof edu.institution !== 'string') {
            throw new Error('Institution is required for each education entry');
          }
          if (!edu.degree || typeof edu.degree !== 'string') {
            throw new Error('Degree is required for each education entry');
          }
          if (!edu.fieldOfStudy || typeof edu.fieldOfStudy !== 'string') {
            throw new Error(
              'Field of study is required for each education entry',
            );
          }
          if (!edu.startDate || typeof edu.startDate !== 'string') {
            throw new Error('Start date is required for each education entry');
          }
        }
        return true;
      }),
    body('experience')
      .optional()
      .isArray()
      .withMessage('Experience must be an array')
      .custom((experienceArr: any[] | undefined) => {
        if (!experienceArr || !experienceArr.length) return true;

        for (const exp of experienceArr) {
          if (!exp.company || typeof exp.company !== 'string') {
            throw new Error('Company is required for each experience entry');
          }
          if (!exp.position || typeof exp.position !== 'string') {
            throw new Error('Position is required for each experience entry');
          }
          if (!exp.startDate || typeof exp.startDate !== 'string') {
            throw new Error('Start date is required for each experience entry');
          }
          if (!exp.description || typeof exp.description !== 'string') {
            throw new Error(
              'Description is required for each experience entry',
            );
          }
        }
        return true;
      }),
    body('linkedInUrl')
      .optional({ values: 'falsy' })
      .isURL()
      .withMessage('LinkedIn URL must be a valid URL')
      .trim(),
    body('githubUrl')
      .isURL()
      .withMessage('GitHub URL must be a valid URL')
      .trim(),
    body('portfolioUrl')
      .optional({ values: 'falsy' })
      .isURL()
      .withMessage('Portfolio URL must be a valid URL')
      .trim(),
    body('resumeFileId')
      .optional({ values: 'falsy' })
      .isString()
      .withMessage('Resume file ID must be a string')
      .trim(),
  ],
};
