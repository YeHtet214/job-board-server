import { sanitizeName } from ".";

export const FormatResumeFileId = (id: string, file: Express.Multer.File) => `${id}_${Date.now()}_${sanitizeName(file.originalname)}`