import { CompanySize, Industry } from "@prisma/client";

export interface CreateCompanyDto {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  location: string;
  industry: string;
  ownerId: string;
  foundedYear: string;
  size?: string;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {}

export interface CompanyResponse {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  location?: string;
  industry?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompaniesSearchQuery {
  searchTerm?: string;
  page: number;
  limit?: number;
  industry?: Industry;
  size?: CompanySize;
}
