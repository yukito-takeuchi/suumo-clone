import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { query } from '../config/database';

// リクエストに認証情報を追加
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        userId: number;
        role: 'individual' | 'corporate';
      };
    }
  }
}

/**
 * Firebase トークン検証ミドルウェア
 * Authorization: Bearer <token> ヘッダーからトークンを取得して検証
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 開発環境でFirebaseが無効な場合、ダミー認証を使用
    if (process.env.NODE_ENV === 'development' && !auth) {
      // 開発用: ヘッダーから直接ユーザー情報を取得
      const devUserId = req.headers['x-dev-user-id'];
      if (devUserId) {
        const result = await query(
          'SELECT id, firebase_uid, email, role FROM users WHERE id = $1',
          [parseInt(devUserId as string)]
        );
        if (result.rows.length > 0) {
          const user = result.rows[0];
          req.user = {
            uid: user.firebase_uid,
            email: user.email,
            userId: user.id,
            role: user.role,
          };
          return next();
        }
      }
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Development mode: Set X-Dev-User-Id header',
        },
      });
    }

    // Authorization ヘッダーを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided',
        },
      });
    }

    // トークンを抽出
    const token = authHeader.substring(7);

    // Firebase トークンを検証
    const decodedToken = await auth!.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // データベースからユーザー情報を取得
    const result = await query(
      'SELECT id, role FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not registered in database',
        },
      });
    }

    const user = result.rows[0];

    // リクエストにユーザー情報を追加
    req.user = {
      uid,
      email: email || '',
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
};

/**
 * ロールベースアクセス制御ミドルウェア
 * 指定されたロールのいずれかに該当するユーザーのみアクセス可能
 */
export const requireRole = (allowedRoles: ('individual' | 'corporate')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        },
      });
    }

    next();
  };
};
