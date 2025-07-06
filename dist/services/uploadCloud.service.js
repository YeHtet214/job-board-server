import cloudinary from "../config/cloudinary.config.js";
import { bucket } from "../config/firebase.config.js";
import { sanitizeName } from "../utils/sanitizedName.js";
export const mediaUploadToCloudinary = async (file) => {
    if (!file)
        return;
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
    }
    catch (error) {
        throw error;
    }
};
export const resumeUploadToFirebase = async (file, userId) => {
    if (!file)
        throw new Error("No file provided");
    const uniqueName = `${userId}_${Date.now()}_${sanitizeName(file.originalname)}`;
    const blob = bucket.file(`resumes/${uniqueName}`);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });
    return new Promise((resolve, reject) => {
        blobStream.on("error", (err) => reject(err));
        blobStream.on("finish", async () => {
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });
        blobStream.end(file.buffer);
    });
};
