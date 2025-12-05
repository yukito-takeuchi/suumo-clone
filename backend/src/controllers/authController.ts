import { Request, Response } from 'express';
import { userModel } from '../models/user';

export const authController = {
  /**
   * 開発環境用ログイン
   * POST /api/auth/dev-login
   * Body: { email }
   */
  async devLogin(req: Request, res: Response) {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Development login is only available in development mode',
        },
      });
    }

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'email is required',
          },
        });
      }

      // メールアドレスでユーザーを検索
      const result = await require('../config/database').query(
        'SELECT id, firebase_uid, email, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const user = result.rows[0];

      // プロフィール取得
      let profile = null;
      if (user.role === 'individual') {
        profile = await userModel.getIndividualProfile(user.id);
      } else if (user.role === 'corporate') {
        profile = await userModel.getCorporateProfile(user.id);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firebaseUid: user.firebase_uid,
            email: user.email,
            role: user.role,
          },
          profile,
          devNote: 'Use X-Dev-User-Id: ' + user.id + ' header for authenticated requests',
        },
      });
    } catch (error) {
      console.error('Dev login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to login',
        },
      });
    }
  },

  /**
   * ログイン（トークン検証 + ユーザー情報取得）
   * POST /api/auth/login
   * Body: { idToken }
   */
  async login(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'idToken is required',
          },
        });
      }

      // Firebaseが無効な場合（開発環境）
      if (!require('../config/firebase').auth) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FIREBASE_NOT_CONFIGURED',
            message: 'Firebase authentication is not configured. Use development mode with X-Dev-User-Id header.',
          },
        });
      }

      // Firebase IDトークンを検証
      const decodedToken = await require('../config/firebase').auth.verifyIdToken(idToken);
      const { uid, email } = decodedToken;

      // データベースからユーザーを取得
      let user = await userModel.getUserByFirebaseUid(uid);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not registered. Please register first.',
          },
        });
      }

      // プロフィール取得
      let profile = null;
      if (user.role === 'individual') {
        profile = await userModel.getIndividualProfile(user.id);
      } else if (user.role === 'corporate') {
        profile = await userModel.getCorporateProfile(user.id);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firebaseUid: user.firebase_uid,
            email: user.email,
            role: user.role,
          },
          profile,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);

      // Firebaseトークンエラー
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'ID token has expired',
          },
        });
      }

      if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid ID token',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to login',
        },
      });
    }
  },

  /**
   * ユーザー登録
   * POST /api/auth/register
   * Body: { firebaseUid, email, role }
   */
  async register(req: Request, res: Response) {
    try {
      const { firebaseUid, email, role } = req.body;

      // バリデーション
      if (!firebaseUid || !email || !role) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'firebaseUid, email, and role are required',
          },
        });
      }

      if (!['individual', 'corporate'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'role must be either "individual" or "corporate"',
          },
        });
      }

      // 既存ユーザーチェック
      const existingUser = await userModel.getUserByFirebaseUid(firebaseUid);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'User already registered',
          },
        });
      }

      // ユーザー作成
      const user = await userModel.createUser(firebaseUid, email, role);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            firebaseUid: user.firebase_uid,
            email: user.email,
            role: user.role,
            createdAt: user.created_at,
          },
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);

      // ユニーク制約違反
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'User already registered',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to register user',
        },
      });
    }
  },

  /**
   * 現在のユーザー情報取得
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const { userId, role } = req.user;

      // ユーザー基本情報を取得
      const user = await userModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      // ロールに応じてプロフィールを取得
      let profile = null;
      if (role === 'individual') {
        profile = await userModel.getIndividualProfile(userId);
      } else if (role === 'corporate') {
        profile = await userModel.getCorporateProfile(userId);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firebaseUid: user.firebase_uid,
            email: user.email,
            role: user.role,
          },
          profile,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get user information',
        },
      });
    }
  },

  /**
   * プロフィール更新
   * PUT /api/auth/profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const { userId, role } = req.user;

      let updatedProfile = null;

      if (role === 'individual') {
        const { first_name, last_name, phone } = req.body;
        updatedProfile = await userModel.updateIndividualProfile(userId, {
          first_name,
          last_name,
          phone,
        });
      } else if (role === 'corporate') {
        const { company_name, license_number, phone, address, description } = req.body;
        updatedProfile = await userModel.updateCorporateProfile(userId, {
          company_name,
          license_number,
          phone,
          address,
          description,
        });
      }

      res.json({
        success: true,
        data: {
          profile: updatedProfile,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update profile',
        },
      });
    }
  },
};
