import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/users.js';
import {
  fetchAllCompanies,
  getExistingCompany,
  createNewCompany,
  updateExistingCompany,
  deleteExistingCompany,
  getCompanyByOwnerId
} from '../services/company.service.js';
import { ForbiddenError } from '../middleware/errorHandler.js';
import { matchedData } from 'express-validator';
import { mediaUploadToCloudinary } from '../services/uploadCloud.service.js';
import { CreateCompanyDto } from '../types/company.js';

export const getAllCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companies = await fetchAllCompanies();

    return res.status(200).json({ success: true, message: 'Companies fetched successfully', data: companies });
  } catch (error) {
    next(error);
  }
}

export const getCompanyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const company = await getExistingCompany(id);

    return res.status(200).json({ success: true, message: 'Company fetched successfully', data: company });
  } catch (error) {
    next(error);
  }
};


export const getCurrentCompany = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    
    try {
      const company = await getCompanyByOwnerId(userId);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Company fetched successfully', 
        data: company 
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ 
          success: false, 
          message: 'No company profile found for this user',
          data: null
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const validatedData = matchedData(req, { locations: ['body'] }) as CreateCompanyDto;
    const logoURL = await mediaUploadToCloudinary(req.file);

    const company = await createNewCompany({
      ...validatedData,
      logo: logoURL,
      ownerId: userId
    });

    res.status(201).json({ success: true, message: 'Company created successfully', data: company });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const validatedData = matchedData(req, { locations: ['body'] }) as CreateCompanyDto;
    const logoURL = await mediaUploadToCloudinary(req.file);

    // First check if the company exists and if the user is the owner
    const existingCompany = await getExistingCompany(id);

    if (existingCompany.ownerId !== userId) {
      throw new ForbiddenError("You don't have permission to update this company");
    }

    const company = await updateExistingCompany(id, {
      ...validatedData,
      logo: logoURL,
    });

    res.status(200).json({ success: true, message: 'Company updated successfully', data: company });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // First check if the company exists and if the user is the owner
    const existingCompany = await getExistingCompany(id);

    if (existingCompany.ownerId !== userId) {
      throw new ForbiddenError("You don't have permission to delete this company");
    }

    const company = await deleteExistingCompany(id);

    res.status(200).json({ success: true, message: 'Company deleted successfully', data: company });
  } catch (error) {
    next(error);
  }
};