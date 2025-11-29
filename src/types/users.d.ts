import { Request } from 'express';

// Define the file interface to match our UploadedFile type
export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

// Define the user type
export interface AuthenticatedUser {
  userId: string;
  email: string;
  userName: string;
  role: UserRole;
}

// Extend the Express namespace to include our custom user type
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    
    interface Request {
      user?: User;
    }
  }
}

// Update the interface to use proper generic parameters from Express Request
export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
  file?: any; // For single file uploads
  files?: any[]; // For multiple file uploads
}

export type UserRole = 'EMPLOYER' | 'JOBSEEKER';