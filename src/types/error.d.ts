export interface CustomError extends Error {
    status: number;
    data?: Record<string, any>;
}
