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
exports.resumeUploadToAppwrite = exports.mediaUploadToCloudinary = void 0;
const node_appwrite_1 = require("node-appwrite");
const appwrite_config_js_1 = require("../config/appwrite.config.js");
const cloudinary_config_js_1 = __importDefault(require("../config/cloudinary.config.js"));
const index_js_1 = require("../utils/index.js");
const env_config_js_1 = require("../config/env.config.js");
const resume_service_js_1 = require("./resume.service.js");
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
const resumeUploadToAppwrite = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(file instanceof File))
            return { fileId: undefined };
        const { $id: fileId } = yield appwrite_config_js_1.storage.createFile(env_config_js_1.APPWRITE_BUCKET_ID, node_appwrite_1.ID.unique(), file, []);
        const tokenSecret = yield appwrite_config_js_1.tokens.createFileToken({
            bucketId: env_config_js_1.APPWRITE_BUCKET_ID,
            fileId,
        });
        yield (0, resume_service_js_1.saveResume)(fileId, tokenSecret.secret);
        return { fileId, tokenSecret };
    }
    catch (error) {
        console.log('resume upload error: ', error);
        throw error;
    }
});
exports.resumeUploadToAppwrite = resumeUploadToAppwrite;
