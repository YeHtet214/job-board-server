import { query } from 'express-validator';
import { RequestHandler, Router } from 'express';
import {
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getAllCompanies,
  getCurrentCompany,
} from '../controllers/company.controller.js';
import authorize from '../middleware/auth.middleware.js';
import { employerOnly } from '../middleware/role.middleware.js';
import { companyValidation } from '../middleware/validation/company.validation.js';

const companyRouter = Router();

// Public route - anyone can view company details
companyRouter.get('/', companyValidation.getAll, getAllCompanies as RequestHandler);
// Important: Route order matters - specific routes before parameterized routes
// @ts-ignore - The authorize middleware adds the user property to the request
companyRouter.get('/my-company', authorize, getCurrentCompany);

companyRouter.get('/:id', getCompanyById as RequestHandler);

// Protected routes - only authenticated employers can perform these actions
companyRouter.post(
  '/',
  authorize as RequestHandler,
  employerOnly as RequestHandler,
  createCompany as RequestHandler,
);

companyRouter.put(
  '/:id',
  authorize as RequestHandler,
  employerOnly as RequestHandler,
  updateCompany as RequestHandler,
);

companyRouter.delete(
  '/:id',
  authorize as RequestHandler,
  employerOnly as RequestHandler,
  deleteCompany as RequestHandler,
);

export default companyRouter;
