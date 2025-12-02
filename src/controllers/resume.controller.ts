import storage from "../config/appwrite.config";
import { RequestWithUser } from "../types/users.js";
import { NextFunction, Response } from "express";
import { APPWRITE_BUCKET_ID } from "../config/env.config";
import { resumeUploadToAppwrite } from "@/services/uploadCloud.service";

export const viewResume = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const resume = await storage.getFileView(APPWRITE_BUCKET_ID, fileId)

    console.log("resume detail: ", resume)

    res.header('Content-Type', 'application/pdf')

    res.send(resume)
  } catch (error) {
    next(error);
  }
}

export const uploadResumeFile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // const resumeUrl = await resumeUploadToFirebase(file, userId);
    const { fileId } = await resumeUploadToAppwrite(file);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: { fileId }
    });
  } catch (error) {
    next(error);
  }
}
