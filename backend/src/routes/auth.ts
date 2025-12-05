import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// 開発環境用ログイン（認証不要）
router.post('/auth/dev-login', authController.devLogin);

// ログイン（認証不要）
router.post('/auth/login', authController.login);

// ユーザー登録（認証不要）
router.post('/auth/register', authController.register);

// カスタムトークン発行（開発・テスト用、認証不要）
router.post('/auth/custom-token', authController.getCustomToken);

// 現在のユーザー情報取得（認証必須）
router.get('/auth/me', requireAuth, authController.getCurrentUser);

// プロフィール更新（認証必須）
router.put('/auth/profile', requireAuth, authController.updateProfile);

export default router;
