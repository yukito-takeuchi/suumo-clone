import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK の初期化
// 環境変数から認証情報を読み込み
if (!admin.apps.length) {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
  } = process.env;

  // Firebase認証情報が全て揃っている場合のみ初期化
  if (
    FIREBASE_PROJECT_ID &&
    FIREBASE_PRIVATE_KEY &&
    FIREBASE_CLIENT_EMAIL &&
    FIREBASE_PROJECT_ID !== 'your-project-id' // デフォルト値でない
  ) {
    try {
      // 環境変数から認証情報を組み立て
      const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('🔥 Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      console.warn('⚠️  Firebase authentication is DISABLED');
    }
  } else {
    console.warn('⚠️  Firebase credentials not configured');
    console.warn('⚠️  Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    console.warn('⚠️  Firebase authentication is DISABLED (using dev mode)');
  }
}

export const auth = admin.apps.length > 0 ? admin.auth() : null;
export default admin;
