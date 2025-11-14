import { query } from 'express-validator';

export const companyValidation = {
  getAll: [
    query('searchTerm').isString().trim().escape(),
    query('industry').isString().trim().escape(),
    query('size').isString().trim().escape(),
    query('page').notEmpty().isInt({ min: 1 }).toInt(),
    query('limit').notEmpty().isInt({ min: 1, max: 100 }).toInt(),
  ],
};
