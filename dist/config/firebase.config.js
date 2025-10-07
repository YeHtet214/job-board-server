"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
const app_1 = require("firebase-admin/app");
const env_config_js_1 = require("./env.config.js");
const storage_1 = require("firebase-admin/storage");
if (!env_config_js_1.FIREBASE_STORAGE_BUCKET) {
    throw new Error('Firebase Storage bucket name is not defined. Please set FIREBASE_STORAGE_BUCKET in your environment variables.');
}
const firebaseConfig = {
    credential: (0, app_1.applicationDefault)(),
    storageBucket: env_config_js_1.FIREBASE_STORAGE_BUCKET,
};
const app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase Storage with explicit bucket name
exports.bucket = (0, storage_1.getStorage)().bucket(env_config_js_1.FIREBASE_STORAGE_BUCKET);
console.log("Firebase Storage initialized with bucket:", env_config_js_1.FIREBASE_STORAGE_BUCKET);
