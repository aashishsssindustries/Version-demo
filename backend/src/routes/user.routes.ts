import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.get('/me', authenticateToken, UserController.getCurrentUser);
router.put('/profile', authenticateToken, UserController.updateProfile);
router.put('/change-password', authenticateToken, UserController.changePassword);

export default router;
