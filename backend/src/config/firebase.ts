import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK の初期化
// 本番環境: サービスアカウントキーを使用
// 開発環境: エミュレーターまたはダミー設定を使用
if (!admin.apps.length) {
  if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_SERVICE_ACCOUNT) {
    // 本番環境: サービスアカウントキーのJSONを環境変数から読み込み
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('🔥 Firebase Admin initialized with service account');
  } else {
    // 開発環境: ダミー設定（実際のFirebase検証はスキップ）
    // 注: 本番デプロイ前にサービスアカウントキーを設定すること
    console.warn('⚠️  Running in development mode without Firebase credentials');
    console.warn('⚠️  Firebase authentication is DISABLED');
    // admin.initializeApp();
  }
}

export const auth = admin.apps.length > 0 ? admin.auth() : null;
export default admin;
