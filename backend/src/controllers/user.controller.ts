import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import logger from '../config/logger';

export class UserController {
    /**
     * Get current user details
     */
    static async getCurrentUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Don't send password hash
            const { password_hash, reset_password_token, reset_password_expires, pan_digest, ...safeUser } = user;

            return res.json({
                success: true,
                data: safeUser
            });
        } catch (error: any) {
            logger.error('Get user error', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch user details'
            });
        }
    }

    /**
     * Update user profile (name, mobile)
     */
    static async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { name, mobile } = req.body;

            if (!name && !mobile) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one field (name or mobile) is required'
                });
            }

            // Check if mobile is already taken by another user
            if (mobile) {
                const existingUser = await UserModel.findByMobile(mobile);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mobile number already in use'
                    });
                }
            }

            const updatedUser = await UserModel.updateProfile(userId, { name, mobile });
            const { password_hash, reset_password_token, reset_password_expires, pan_digest, ...safeUser } = updatedUser;

            return res.json({
                success: true,
                message: 'Profile updated successfully',
                data: safeUser
            });
        } catch (error: any) {
            logger.error('Update profile error', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }

    /**
     * Change password
     */
    static async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters'
                });
            }

            // Get user and verify current password
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            await UserModel.updatePassword(userId, newPasswordHash);

            return res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error: any) {
            logger.error('Change password error', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    }
}
