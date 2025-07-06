import { Router } from "express";
import { getCompanyById, createCompany, updateCompany, deleteCompany, getAllCompanies, getCurrentCompany } from "../controllers/company.controller.js";
import authorize from "../middleware/auth.middleware.js";
import { employerOnly } from "../middleware/role.middleware.js";
const companyRouter = Router();
// Public route - anyone can view company details
companyRouter.get('/', getAllCompanies);
// Important: Route order matters - specific routes before parameterized routes
// @ts-ignore - The authorize middleware adds the user property to the request
companyRouter.get('/my-company', authorize, getCurrentCompany);
companyRouter.get('/:id', getCompanyById);
// Protected routes - only authenticated employers can perform these actions
companyRouter.post('/', authorize, employerOnly, createCompany);
companyRouter.put('/:id', authorize, employerOnly, updateCompany);
companyRouter.delete('/:id', authorize, employerOnly, deleteCompany);
export default companyRouter;
