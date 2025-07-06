import { applicationDefault, initializeApp } from "firebase-admin/app";
import { FIREBASE_STORAGE_BUCKET } from "./env.config.js";
import { getStorage } from "firebase-admin/storage";
initializeApp({
    credential: applicationDefault(),
    storageBucket: FIREBASE_STORAGE_BUCKET,
});
console.log("STORAGE BUCKET: ", FIREBASE_STORAGE_BUCKET);
export const bucket = getStorage().bucket();
