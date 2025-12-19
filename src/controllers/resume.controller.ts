import { RequestWithUser } from "../types/users.js";
import { NextFunction, Response } from "express";
import { resumeUploadToAppwrite } from "../services/uploadCloud.service";

export const uploadResumeFile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { fileId, tokenSecret } = await resumeUploadToAppwrite(file);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: { fileId, tokenSecret }
    });
  } catch (error) {
    next(error);
  }
}
