"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeUploadToFirebase = exports.mediaUploadToCloudinary = void 0;
const cloudinary_config_js_1 = __importDefault(require("../config/cloudinary.config.js"));
const firebase_config_js_1 = require("../config/firebase.config.js");
const index_js_1 = require("../utils/index.js");
const mediaUploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        return;
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const fileName = (0, index_js_1.sanitizeName)(file.originalname);
    try {
        const result = yield cloudinary_config_js_1.default.uploader.upload(base64, {
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
});
exports.mediaUploadToCloudinary = mediaUploadToCloudinary;
const resumeUploadToFirebase = (file, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        return;
    const uniqueName = `${userId}_${Date.now()}_${(0, index_js_1.sanitizeName)(file.originalname)}`;
    const blob = firebase_config_js_1.bucket.file(`resumes/${uniqueName}`);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });
    return new Promise((resolve, reject) => {
        blobStream.on("error", (err) => reject(err));
        blobStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
            yield blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${firebase_config_js_1.bucket.name}/${blob.name}`;
            resolve(publicUrl);
        }));
        blobStream.end(file.buffer);
    });
});
exports.resumeUploadToFirebase = resumeUploadToFirebase;
