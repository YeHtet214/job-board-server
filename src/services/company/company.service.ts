import prisma from "../../prisma/client.js";
import { BadRequestError, NotFoundError, ConflictError } from "../../middleware/errorHandler.js";
import { CreateCompanyDto, UpdateCompanyDto } from "../../types/company.js";

export const fetchAllCompanies = async () => {
    const companies = await prisma.company.findMany();
    return companies;
}

export const getExistingCompany = async (id: string) => {
    if (!id) {
        throw new BadRequestError('Company ID is required');
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
        throw new NotFoundError('Company not found');
    }
    return company;
}

export const getCompanyByOwnerId = async (ownerId: string) => {
    if (!ownerId) {
        throw new BadRequestError('Owner ID is required');
    }

    const company = await prisma.company.findFirst({
        where: { ownerId }
    });

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    return company;
}

export const createNewCompany = async (companyData: CreateCompanyDto) => {
    if (!companyData.name || !companyData.ownerId) {
        throw new BadRequestError('Company name and owner ID are required');
    }

    const existingCompany = await prisma.company.findFirst({
        where: { ownerId: companyData.ownerId }
    });

    if (existingCompany) {
        throw new ConflictError('Employer already has a company profile');
    }
    
    const company = await prisma.company.create({
        data: companyData
    });
    return company;
}

export const updateExistingCompany = async (id: string, data: UpdateCompanyDto) => {
    if (!id) {
        throw new BadRequestError('Company ID is required');
    }
    
    // First check if company exists
    await getExistingCompany(id);
    
    const company = await prisma.company.update({
        where: { id },
        data
    });
    return company;
}

export const deleteExistingCompany = async (id: string) => {
    if (!id) {
        throw new BadRequestError('Company ID is required');
    }
    
    // First check if company exists
    await getExistingCompany(id);
    
    const company = await prisma.company.delete({ where: { id } });
    return company;
}
