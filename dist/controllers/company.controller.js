"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getCurrentCompany = exports.getCompanyById = exports.getAllCompanies = void 0;
const company_service_js_1 = require("../services/company/company.service.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const express_validator_1 = require("express-validator");
const uploadCloud_service_js_1 = require("../services/uploadCloud.service.js");
const getAllCompanies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield (0, company_service_js_1.fetchAllCompanies)();
        return res.status(200).json({ success: true, message: 'Companies fetched successfully', data: companies });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCompanies = getAllCompanies;
const getCompanyById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const company = yield (0, company_service_js_1.getExistingCompany)(id);
        return res.status(200).json({ success: true, message: 'Company fetched successfully', data: company });
    }
    catch (error) {
        next(error);
    }
});
exports.getCompanyById = getCompanyById;
const getCurrentCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        try {
            const company = yield (0, company_service_js_1.getCompanyByOwnerId)(userId);
            return res.status(200).json({
                success: true,
                message: 'Company fetched successfully',
                data: company
            });
        }
        catch (error) {
            if (error.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: 'No company profile found for this user',
                    data: null
                });
            }
            throw error;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentCompany = getCurrentCompany;
const createCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['body'] });
        const logoURL = yield (0, uploadCloud_service_js_1.mediaUploadToCloudinary)(req.file);
        const company = yield (0, company_service_js_1.createNewCompany)(Object.assign(Object.assign({}, validatedData), { logo: logoURL, ownerId: userId }));
        res.status(201).json({ success: true, message: 'Company created successfully', data: company });
    }
    catch (error) {
        next(error);
    }
});
exports.createCompany = createCompany;
const updateCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const validatedData = (0, express_validator_1.matchedData)(req, { locations: ['body'] });
        const logoURL = yield (0, uploadCloud_service_js_1.mediaUploadToCloudinary)(req.file);
        // First check if the company exists and if the user is the owner
        const existingCompany = yield (0, company_service_js_1.getExistingCompany)(id);
        if (existingCompany.ownerId !== userId) {
            throw new errorHandler_js_1.ForbiddenError("You don't have permission to update this company");
        }
        const company = yield (0, company_service_js_1.updateExistingCompany)(id, Object.assign(Object.assign({}, validatedData), { logo: logoURL }));
        res.status(200).json({ success: true, message: 'Company updated successfully', data: company });
    }
    catch (error) {
        next(error);
    }
});
exports.updateCompany = updateCompany;
const deleteCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // First check if the company exists and if the user is the owner
        const existingCompany = yield (0, company_service_js_1.getExistingCompany)(id);
        if (existingCompany.ownerId !== userId) {
            throw new errorHandler_js_1.ForbiddenError("You don't have permission to delete this company");
        }
        const company = yield (0, company_service_js_1.deleteExistingCompany)(id);
        res.status(200).json({ success: true, message: 'Company deleted successfully', data: company });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCompany = deleteCompany;
