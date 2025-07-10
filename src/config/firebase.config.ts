import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FIREBASE_STORAGE_BUCKET } from "./env.config.js";
import { getStorage } from "firebase-admin/storage";

if (!FIREBASE_STORAGE_BUCKET) {
  throw new Error('Firebase Storage bucket name is not defined. Please set FIREBASE_STORAGE_BUCKET in your environment variables.');
}

const firebaseConfig = {
  credential: applicationDefault(),
  storageBucket: FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage with explicit bucket name
export const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

console.log("Firebase Storage initialized with bucket:", FIREBASE_STORAGE_BUCKET);
