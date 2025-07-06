import dotenv from 'dotenv';
dotenv.config();
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is required');
}
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
}
if (!process.env.SMTP_FROM_EMAIL) {
    throw new Error('SMTP_FROM_EMAIL is required');
}
export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
export const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;
export const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID;
export const FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID;
export const SMTP_CONFIG = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // SendGrid requires TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};
