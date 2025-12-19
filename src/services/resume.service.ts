import prisma from "../lib/prismaClient"
import { APPWRITE_BUCKET_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "../config/env.config"
import { CustomError } from "../types/error"

export const FileURLConstructor = (fileId: string, tokenSecret: string) => {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}&token=${tokenSecret}`
}

export const ViewResume = async (fileId: string) => {
    try {
        const resume = await prisma.resume.findUnique({
            where: {
                fileId
            }
        })

        return resume
    } catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to view resume') as CustomError;
        customError.status = 400;
        throw customError;
    }
}

export const saveResume = async (fileId: string, tokenSecret: string) => {
    try {
        const resume = await prisma.resume.create({
            data: {
                fileId,
                bucketId: APPWRITE_BUCKET_ID,
                tokenSecret
            }
        })

        return resume
    } catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to save resume') as CustomError;
        customError.status = 400;
        throw customError;
    }
}