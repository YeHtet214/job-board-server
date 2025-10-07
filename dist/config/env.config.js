"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_MEASUREMENT_ID = exports.FIREBASE_MESSAGING_SENDER_ID = exports.FIREBASE_APP_ID = exports.FIREBASE_PROJECT_ID = exports.FIREBASE_API_KEY = exports.FIREBASE_STORAGE_BUCKET = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.GOOGLE_REDIRECT_URI = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.SMTP_PORT = exports.SMTP_HOST = exports.SMTP_PASS = exports.SMTP_USER = exports.SESSION_SECRET = exports.FRONTEND_URL = exports.REFRESH_TOKEN_SECRET = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is required');
}
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
}
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.FRONTEND_URL = process.env.FRONTEND_URL;
exports.SESSION_SECRET = process.env.SESSION_SECRET;
exports.SMTP_USER = process.env.SMTP_USER;
exports.SMTP_PASS = process.env.SMTP_PASS;
exports.SMTP_HOST = process.env.SMTP_HOST;
exports.SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
exports.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
exports.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
exports.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
exports.FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
exports.FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
exports.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
exports.FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;
exports.FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID;
exports.FIREBASE_MEASUREMENT_ID = process.env.FIREBASE_MEASUREMENT_ID;
