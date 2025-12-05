import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ユーザー登録（認証不要）
router.post('/auth/register', authController.register);

// 現在のユーザー情報取得（認証必須）
router.get('/auth/me', requireAuth, authController.getCurrentUser);

// プロフィール更新（認証必須）
router.put('/auth/profile', requireAuth, authController.updateProfile);

export default router;
