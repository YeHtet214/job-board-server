import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is required');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
}

export const DATABASE_URL = process.env.DATABASE_URL
export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI as string;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string;

export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
export const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY as string;
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID as string;
export const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID as string;
export const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID as string;
export const FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID as string;
