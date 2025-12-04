import { InputFile } from "node-appwrite/file";
import { ID } from "node-appwrite";
import { storage, tokens } from "../config/appwrite.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { sanitizeName } from "../utils/index.js";
import { APPWRITE_BUCKET_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "../config/env.config.js";
import { saveResume } from "./resume.service.js";

export const mediaUploadToCloudinary  = async (file: Express.Multer.File) => {
    if (!file) return;
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const fileName = sanitizeName(file.originalname);

    try {
        const result = await cloudinary.uploader.upload(base64, {
            resource_type: 'auto',
            folder: 'media',
            public_id: fileName,
            upload_preset: 'media_upload',
        });

        return result.secure_url;
    } catch (error) {
        throw error;
    }
}

export const resumeUploadToAppwrite = async (file: Express.Multer.File) => {
  const inputFile = InputFile.fromBuffer(file.buffer, file.originalname);

  try {
    const { $id: fileId } = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      inputFile,
      []
    );
    
    const tokenSecret = await tokens.createFileToken({
      bucketId: APPWRITE_BUCKET_ID,
      fileId,
    })

    await saveResume(fileId, tokenSecret.secret)

    return { fileId, tokenSecret };
  } catch (error) {
    console.log('resume upload error: ', error);
    throw error;
  }
};
