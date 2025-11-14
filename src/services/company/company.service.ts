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
  
  // Add industry filter if provided
  if (industry) {
    whereClause.industry = {
      contains: industry,
      mode: 'insensitive',
    };
  }
  
  // Add size filter if provided
  if (size) {
    whereClause.size = {
      contains: size,
      mode: 'insensitive',
    };
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

  const company = await prisma.company.create({
    data: companyData,
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

  const company = await prisma.company.update({
    where: { id },
    data,
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
