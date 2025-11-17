import { query } from 'express-validator';

export const companyValidation = {
  getAll: [
    query('searchTerm').isString().trim().escape(),
    query('industry').isString().trim().escape(),
    query('companySize').contains('1-10 11-50 51-200 201-500 500+'),
    query('page').notEmpty().isInt({ min: 1 }).toInt(),
    query('limit').notEmpty().isInt({ min: 1, max: 100 }).toInt(),
  ],
};
