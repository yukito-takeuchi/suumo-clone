import { query } from '../config/database';

const additionalUsers = [
  {
    firebaseUid: 'C2WOEsEf38ginCT31RTQIG1SEpK2',
    email: 'iyggf66974-3@yahoo.ne.jp',
    role: 'individual',
    profile: {
      first_name: '花子',
      last_name: '佐藤',
      phone: '080-2345-6789',
    },
  },
  {
    firebaseUid: 'tXmaYJAVTlYMn5dLNsXNA5SZlNg1',
    email: 'iyggf66974-4@yahoo.ne.jp',
    role: 'individual',
    profile: {
      first_name: '次郎',
      last_name: '鈴木',
      phone: '070-3456-7890',
    },
  },
];

export async function seedAdditionalUsers() {
  console.log('🌱 Seeding additional users...');

  for (const userData of additionalUsers) {
    // ユーザー作成
    const userResult = await query(
      `INSERT INTO users (firebase_uid, email, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid) DO NOTHING
       RETURNING id`,
      [userData.firebaseUid, userData.email, userData.role]
    );

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      // 個人プロフィール作成
      await query(
        `INSERT INTO individual_profiles (user_id, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO NOTHING`,
        [
          userId,
          userData.profile.first_name,
          userData.profile.last_name,
          userData.profile.phone,
        ]
      );

      console.log(`✅ Created user: ${userData.email}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }

  console.log('✅ Additional users seeding completed!');
}

// 直接実行された場合のみ実行
if (require.main === module) {
  seedAdditionalUsers().catch((error) => {
    console.error('❌ Error seeding additional users:', error);
    process.exit(1);
  });
}
