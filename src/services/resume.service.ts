import prisma from "../lib/prismaClient"
import { APPWRITE_BUCKET_ID } from "../config/env.config"

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

export const saveResume = async (fileId: string) => {
    try {
        const resume = await prisma.resume.create({
            data: {
                fileId,
                bucketId: APPWRITE_BUCKET_ID
            }
        })

        return resume
    } catch (error) {
        const customError = new Error(error instanceof Error ? error.message : 'Failed to save resume') as CustomError;
        customError.status = 400;
        throw customError;
    }
}