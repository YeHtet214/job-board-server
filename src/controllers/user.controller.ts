import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../types/users.js";
import { fetchUserById, fetchUsers } from '../services/user.service.js';

export const getCurrentUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;

        // Get user data without sensitive information
        const user = await fetchUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("Current User is fetch: ", user);

        res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get all users without sensitive information
        const users = await fetchUsers();
        
        // Check if users were found
        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
            count: users.length
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await fetchUserById(id);
  
      res.status(200).json({ success: true, message: "Successfully fetched user by id", data: user });
    } catch (error) {
      next(error);
    }
};
  