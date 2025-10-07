"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_js_1 = require("@/controllers/company.controller.js");
const auth_middleware_js_1 = __importDefault(require("@/middleware/auth.middleware.js"));
const role_middleware_js_1 = require("@/middleware/role.middleware.js");
const companyRouter = (0, express_1.Router)();
// Public route - anyone can view company details
companyRouter.get('/', company_controller_js_1.getAllCompanies);
// Important: Route order matters - specific routes before parameterized routes
// @ts-ignore - The authorize middleware adds the user property to the request
companyRouter.get('/my-company', auth_middleware_js_1.default, company_controller_js_1.getCurrentCompany);
companyRouter.get('/:id', company_controller_js_1.getCompanyById);
// Protected routes - only authenticated employers can perform these actions
companyRouter.post('/', auth_middleware_js_1.default, role_middleware_js_1.employerOnly, company_controller_js_1.createCompany);
companyRouter.put('/:id', auth_middleware_js_1.default, role_middleware_js_1.employerOnly, company_controller_js_1.updateCompany);
companyRouter.delete('/:id', auth_middleware_js_1.default, role_middleware_js_1.employerOnly, company_controller_js_1.deleteCompany);
exports.default = companyRouter;
