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
   * ログイン（メール・パスワード認証 + カスタムトークン発行）
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'email and password are required',
          },
        });
      }

      // Firebase REST APIでメール・パスワード認証
      const firebaseAuth = await require('../utils/firebaseAuth').signInWithEmailAndPassword(
        email,
        password
      );

      // データベースからユーザーを取得
      let user = await userModel.getUserByFirebaseUid(firebaseAuth.localId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not registered in database. Please contact support.',
          },
        });
      }

      // カスタムトークン発行
      const customToken = await require('../utils/firebaseAuth').createCustomToken(
        firebaseAuth.localId
      );

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
          customToken,
          idToken: firebaseAuth.idToken,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);

      // Firebase エラー
      if (error.message === 'EMAIL_NOT_FOUND' || error.message === 'INVALID_PASSWORD' || error.message === 'INVALID_LOGIN_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      if (error.message === 'USER_DISABLED') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'USER_DISABLED',
            message: 'This account has been disabled',
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
   * ユーザー登録（Firebase + DB）
   * POST /api/auth/register
   * Body: { email, password, role }
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      // バリデーション
      if (!email || !password || !role) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'email, password, and role are required',
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

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 6 characters',
          },
        });
      }

      // Firebase REST APIで新規ユーザー作成
      const firebaseUser = await require('../utils/firebaseAuth').createUserWithEmailAndPassword(
        email,
        password
      );

      // データベースにユーザー作成
      const user = await userModel.createUser(firebaseUser.localId, email, role);

      // カスタムトークン発行
      const customToken = await require('../utils/firebaseAuth').createCustomToken(
        firebaseUser.localId
      );

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
          customToken,
          idToken: firebaseUser.idToken,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);

      // Firebase エラー
      if (error.message === 'EMAIL_EXISTS') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email already registered',
          },
        });
      }

      if (error.message === 'WEAK_PASSWORD') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password is too weak',
          },
        });
      }

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

  /**
   * カスタムトークン発行（開発・テスト用）
   * POST /api/auth/custom-token
   * Body: { firebaseUid }
   */
  async getCustomToken(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.body;

      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'firebaseUid is required',
          },
        });
      }

      // カスタムトークン発行
      const customToken = await require('../utils/firebaseAuth').createCustomToken(firebaseUid);

      // IDトークンに交換
      const idToken = await require('../utils/firebaseAuth').exchangeCustomTokenForIdToken(
        customToken
      );

      res.json({
        success: true,
        data: {
          customToken,
          idToken,
          note: 'Use idToken in Authorization: Bearer <idToken> header',
        },
      });
    } catch (error: any) {
      console.error('Custom token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create custom token',
        },
      });
    }
  },
};
