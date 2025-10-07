import prisma from '@/lib/client.js';
import { UnauthorizedError } from '@/middleware/errorHandler.js';

/**
 * Calculates job seeker profile completion percentage
 * @param userId The user ID
 * @returns Profile completion percentage
 */
export const calculateJobSeekerProfileCompletion = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) return 0;

  let completionPercentage = 0;

  // Base completion for having a profile
  completionPercentage += 20;

  // Has education entries
  if (profile.education && Array.isArray(JSON.parse(JSON.stringify(profile.education))) &&
    JSON.parse(JSON.stringify(profile.education)).length > 0) {
    completionPercentage += 20;
  }

  // Has experience entries
  if (profile.experience && Array.isArray(JSON.parse(JSON.stringify(profile.experience))) &&
    JSON.parse(JSON.stringify(profile.experience)).length > 0) {
    completionPercentage += 20;
  }

  // Has skills
  if (profile.skills && profile.skills.length > 0) {
    completionPercentage += 20;
  }

  // Has resume
  if (profile.resumeUrl) {
    completionPercentage += 20;
  }

  return completionPercentage;
};

/**
 * Calculates company profile completion status
 * @param company The company object
 * @returns Completion percentage and whether the profile is complete
 */
export const calculateCompanyProfileCompletion = (company: any) => {
  let percentage = 0;
  let requiredFieldsCount = 0;
  let completedFieldsCount = 0;

  // Basic info
  const requiredFields = [
    'name',
    'website',
    'industry',
    'size',
    'location',
    'description'
  ];

  requiredFieldsCount += requiredFields.length;

  for (const field of requiredFields) {
    if (company[field]) {
      completedFieldsCount++;
    }
  }

  // Company logo
  requiredFieldsCount++;
  if (company.logo) {
    completedFieldsCount++;
  }

  // Calculate percentage
  percentage = Math.round((completedFieldsCount / requiredFieldsCount) * 100);

  // Mark as complete if 80% or more is complete
  return {
    percentage,
    complete: percentage >= 80
  };
};

/**
 * Gets company profile completion information for an employer
 * @param userId The user ID (employer)
 */
export const getCompanyProfileCompletion = async (userId: string) => {
  // Verify the user is an employer
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user || user.role !== 'EMPLOYER') {
    throw new UnauthorizedError('User is not an employer');
  }

  // Get the company for this employer
  const company = await prisma.company.findFirst({
    where: { ownerId: userId }
  });

  if (!company) {
    return { complete: false, percentage: 0 };
  }

  return calculateCompanyProfileCompletion(company);
};
