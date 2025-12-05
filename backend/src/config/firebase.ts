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

  if (FIREBASE_PROJECT_ID && FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
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
  } else {
    console.warn('⚠️  Firebase credentials not found in environment variables');
    console.warn('⚠️  Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    console.warn('⚠️  Firebase authentication is DISABLED');
  }
}

export const auth = admin.apps.length > 0 ? admin.auth() : null;
export default admin;
