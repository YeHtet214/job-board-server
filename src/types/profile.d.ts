export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}

export interface CreateProfileDto {
  userId: string;
  bio: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  profileImageURL?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface UpdateProfileDto extends Partial<CreateProfileDto> {}

export interface ProfileResponse {
  id: string;
  userId: string;
  bio: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  resumeUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileCompletionItemType {
  completed: boolean;
  text: string;
};