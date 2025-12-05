import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// テストユーザーデータ
const testUsers = [
  {
    firebaseUid: 'BhrwjLkzQVPzMUJqdYZe39NyZMt1',
    email: 'iyggf66974-2@yahoo.ne.jp',
    role: 'individual' as const,
    profile: {
      first_name: '太郎',
      last_name: '山田',
      phone: '090-1234-5678',
    },
  },
  {
    firebaseUid: 'pXMfXOqRvbZ2oHM28udzDuCyU4A3',
    email: 'iyggf66974@yahoo.ne.jp',
    role: 'corporate' as const,
    profile: {
      company_name: 'テスト不動産株式会社',
      license_number: '東京都知事(1)第12345号',
      phone: '03-1234-5678',
      address: '東京都渋谷区渋谷1-1-1',
      description: 'テスト用の不動産会社です。',
    },
  },
];

async function seedUsers() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding users...');

    for (const userData of testUsers) {
      // ユーザーが既に存在するかチェック
      const existingUser = await client.query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [userData.firebaseUid]
      );

      let userId: number;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        console.log(`✓ User already exists: ${userData.email} (ID: ${userId})`);
      } else {
        // ユーザーを作成
        const userResult = await client.query(
          `INSERT INTO users (firebase_uid, email, role)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [userData.firebaseUid, userData.email, userData.role]
        );
        userId = userResult.rows[0].id;
        console.log(`✅ Created user: ${userData.email} (ID: ${userId}, Role: ${userData.role})`);
      }

      // プロフィールを作成または更新
      if (userData.role === 'individual') {
        const profileExists = await client.query(
          'SELECT id FROM individual_profiles WHERE user_id = $1',
          [userId]
        );

        if (profileExists.rows.length > 0) {
          // 更新
          await client.query(
            `UPDATE individual_profiles
             SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4`,
            [
              userData.profile.first_name,
              userData.profile.last_name,
              userData.profile.phone,
              userId,
            ]
          );
          console.log(`  ✓ Updated individual profile`);
        } else {
          // 作成
          await client.query(
            `INSERT INTO individual_profiles (user_id, first_name, last_name, phone)
             VALUES ($1, $2, $3, $4)`,
            [
              userId,
              userData.profile.first_name,
              userData.profile.last_name,
              userData.profile.phone,
            ]
          );
          console.log(`  ✅ Created individual profile`);
        }
      } else if (userData.role === 'corporate') {
        const profileExists = await client.query(
          'SELECT id FROM corporate_profiles WHERE user_id = $1',
          [userId]
        );

        if (profileExists.rows.length > 0) {
          // 更新
          await client.query(
            `UPDATE corporate_profiles
             SET company_name = $1, license_number = $2, phone = $3, address = $4, description = $5, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $6`,
            [
              userData.profile.company_name,
              userData.profile.license_number,
              userData.profile.phone,
              userData.profile.address,
              userData.profile.description,
              userId,
            ]
          );
          console.log(`  ✓ Updated corporate profile`);
        } else {
          // 作成
          await client.query(
            `INSERT INTO corporate_profiles (user_id, company_name, license_number, phone, address, description)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              userData.profile.company_name,
              userData.profile.license_number,
              userData.profile.phone,
              userData.profile.address,
              userData.profile.description,
            ]
          );
          console.log(`  ✅ Created corporate profile`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Users seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Users seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 直接実行された場合のみ実行
if (require.main === module) {
  seedUsers().catch(console.error);
}

export { seedUsers, testUsers };
