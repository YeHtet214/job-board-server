import { InputFile } from "node-appwrite/file";
import { ID } from "node-appwrite";
import storage from "../config/appwrite.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { bucket } from "../config/firebase.config.js";
import { sanitizeName } from "../utils/index.js";
import { APPWRITE_BUCKET_ID } from "../config/env.config.js";
import prisma from "@/lib/prismaClient.js";
import { FormatResumeFileId } from "@/utils/constants.js";
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
  const formattedId = FormatResumeFileId(ID.unique(), file)

  try {
    const { $id: fileId } = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      inputFile,
      []
    );

    await saveResume(fileId)

    return { fileId };
  } catch (error) {
    console.log('resume upload error: ', error);
    throw error;
  }
};


export const resumeUploadToFirebase = async (file: Express.Multer.File, userId: string) => {
  if (!file) return;

  const uniqueName = `${userId}_${Date.now()}_${sanitizeName(file.originalname)}`;
  const blob = bucket.file(`resumes/${uniqueName}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise<string>((resolve, reject) => {
    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", async () => {
      await blob.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    blobStream.end(file.buffer);
  });
};
