import prisma from "../prisma/client.js";
/**
 * Get all users without sensitive information
 * @returns Array of user data without sensitive fields
 */
export const fetchUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Exclude sensitive fields like passwordHash, tokens, etc.
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    if (!users || users.length === 0) {
        const error = new Error('Users not found');
        error.status = 404;
        throw error;
    }
    return users;
};
/**
 * Get user by ID without sensitive information
 * @param id User ID to fetch
 * @returns User data without sensitive fields
 */
export const fetchUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Exclude sensitive fields like passwordHash, tokens, etc.
        }
    });
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    return user;
};
