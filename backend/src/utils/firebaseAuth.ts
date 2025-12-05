import axios from 'axios';
import admin from '../config/firebase';

const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY;

interface FirebaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

interface FirebaseErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

/**
 * Firebase REST APIでメール・パスワード認証
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<FirebaseAuthResponse> {
  if (!FIREBASE_API_KEY) {
    throw new Error('FIREBASE_WEB_API_KEY is not configured');
  }

  try {
    const response = await axios.post<FirebaseAuthResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const firebaseError = error.response.data as FirebaseErrorResponse;
      const errorMessage = firebaseError.error.message;

      // Firebase エラーメッセージを分かりやすく変換
      if (errorMessage.includes('EMAIL_NOT_FOUND')) {
        throw new Error('EMAIL_NOT_FOUND');
      }
      if (errorMessage.includes('INVALID_PASSWORD')) {
        throw new Error('INVALID_PASSWORD');
      }
      if (errorMessage.includes('USER_DISABLED')) {
        throw new Error('USER_DISABLED');
      }
      if (errorMessage.includes('INVALID_LOGIN_CREDENTIALS')) {
        throw new Error('INVALID_LOGIN_CREDENTIALS');
      }

      throw new Error(errorMessage);
    }

    throw error;
  }
}

/**
 * Firebase REST APIで新規ユーザー作成
 */
export async function createUserWithEmailAndPassword(
  email: string,
  password: string
): Promise<FirebaseAuthResponse> {
  if (!FIREBASE_API_KEY) {
    throw new Error('FIREBASE_WEB_API_KEY is not configured');
  }

  try {
    const response = await axios.post<FirebaseAuthResponse>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const firebaseError = error.response.data as FirebaseErrorResponse;
      const errorMessage = firebaseError.error.message;

      if (errorMessage.includes('EMAIL_EXISTS')) {
        throw new Error('EMAIL_EXISTS');
      }
      if (errorMessage.includes('WEAK_PASSWORD')) {
        throw new Error('WEAK_PASSWORD');
      }

      throw new Error(errorMessage);
    }

    throw error;
  }
}

/**
 * Firebase Admin SDKでカスタムトークン発行
 */
export async function createCustomToken(uid: string): Promise<string> {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin is not initialized');
  }

  const customToken = await admin.auth().createCustomToken(uid);
  return customToken;
}

/**
 * カスタムトークンをIDトークンに交換
 */
export async function exchangeCustomTokenForIdToken(
  customToken: string
): Promise<string> {
  if (!FIREBASE_API_KEY) {
    throw new Error('FIREBASE_WEB_API_KEY is not configured');
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
      {
        token: customToken,
        returnSecureToken: true,
      }
    );

    return response.data.idToken;
  } catch (error: any) {
    throw new Error('Failed to exchange custom token for ID token');
  }
}
