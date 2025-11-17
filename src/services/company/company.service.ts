import { equal } from 'assert';
import prisma from '../../lib/prismaClient.js';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../middleware/errorHandler.js';
import {
  CompaniesSearchQuery,
  CreateCompanyDto,
  UpdateCompanyDto,
} from '../../types/company.js';
import { CompanySize, Industry } from '@prisma/client';

// Map request values to Prisma enum values
const industryMap: Record<string, Industry> = {
  'technology': Industry.Technology,
  'healthcare': Industry.Healthcare,
  'finance': Industry.Finance,
  'education': Industry.Education,
  'manufacturing': Industry.Manufacturing,
  'retail': Industry.Retail,
  'hospitality': Industry.Hospitality,
  'media': Industry.Media,
  'transportation': Industry.Transportation,
  'construction': Industry.Construction,
};

// Map request values (display format) to Prisma enum values
const sizeMap: Record<string, CompanySize> = {
  '1-10': CompanySize.Startup_1_10,
  '11-50': CompanySize.Small_11_50,
  '51-200': CompanySize.Medium_51_200,
  '201-500': CompanySize.Large_201_500,
  '500+': CompanySize.Enterprise_500_plus,
};

export const fetchAllCompanies = async (query: CompaniesSearchQuery) => {
  const { searchTerm, industry, size, page, limit = 10 } = query;

  const whereClause: any = {};

  // Build OR conditions for searchTerm if provided
  if (searchTerm) {
    whereClause.OR = [
      {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        location: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Map industry from request format to Prisma enum
  if (industry && typeof industry === 'string') {
    const mappedIndustry = industryMap[industry.toLowerCase()];
    if (mappedIndustry) {
      whereClause.industry = mappedIndustry;
    }
  }

  // Map size from request format to Prisma enum
  if (size && typeof size === 'string') {
    const mappedSize = sizeMap[size];
    if (mappedSize) {
      whereClause.size = mappedSize;
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  const companies = await prisma.company.findMany({
    where: whereClause,
    skip: skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get total count for pagination
  const total = await prisma.company.count({
    where: whereClause,
  });

  return {
    companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getExistingCompany = async (id: string) => {
  if (!id) {
    throw new BadRequestError('Company ID is required');
  }

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  return company;
};

export const getCompanyByOwnerId = async (ownerId: string) => {
  if (!ownerId) {
    throw new BadRequestError('Owner ID is required');
  }

  const company = await prisma.company.findFirst({
    where: { ownerId },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return company;
};

export const createNewCompany = async (companyData: CreateCompanyDto) => {
  if (!companyData.name || !companyData.ownerId) {
    throw new BadRequestError('Company name and owner ID are required');
  }

  const existingCompany = await prisma.company.findFirst({
    where: { ownerId: companyData.ownerId },
  });

  if (existingCompany) {
    throw new ConflictError('Employer already has a company profile');
  }

  // Map industry and size from string to enum
  const mappedIndustry = industryMap[companyData.industry.toLowerCase()];
  if (!mappedIndustry) {
    throw new BadRequestError('Invalid industry value');
  }

  const mappedSize = companyData.size ? sizeMap[companyData.size] : undefined;
  if (companyData.size && !mappedSize) {
    throw new BadRequestError('Invalid size value');
  }

  const company = await prisma.company.create({
    data: {
      ...companyData,
      industry: mappedIndustry,
      size: mappedSize,
    },
  });
  return company;
};

export const updateExistingCompany = async (
  id: string,
  data: UpdateCompanyDto,
) => {
  if (!id) {
    throw new BadRequestError('Company ID is required');
  }

  // First check if company exists
  await getExistingCompany(id);

  // Map industry and size if provided
  const updateData: any = { ...data };
  
  if (data.industry) {
    const mappedIndustry = industryMap[data.industry.toLowerCase()];
    if (!mappedIndustry) {
      throw new BadRequestError('Invalid industry value');
    }
    updateData.industry = mappedIndustry;
  }

  if (data.size) {
    const mappedSize = sizeMap[data.size];
    if (!mappedSize) {
      throw new BadRequestError('Invalid size value');
    }
    updateData.size = mappedSize;
  }

  // Remove ownerId from update data as it shouldn't be updated
  delete updateData.ownerId;

  const company = await prisma.company.update({
    where: { id },
    data: updateData,
  });
  return company;
};

export const deleteExistingCompany = async (id: string) => {
  if (!id) {
    throw new BadRequestError('Company ID is required');
  }

  // First check if company exists
  await getExistingCompany(id);

  const company = await prisma.company.delete({ where: { id } });
  return company;
};
