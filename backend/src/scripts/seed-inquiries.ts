import { query } from '../config/database';

const inquiryTypes = ['vacancy', 'viewing', 'other'];
const statuses = ['unread', 'read', 'responded'];

const inquiryMessages = {
  vacancy: [
    '現在の空室状況を教えてください。',
    '最新の空室情報を知りたいです。',
    'いつから入居可能でしょうか？',
  ],
  viewing: [
    '物件の内見を希望します。来週の平日でお願いできますか？',
    '実際に見学させていただきたいです。土日の対応は可能でしょうか？',
    '内見の予約をしたいのですが、いつが空いていますか？',
  ],
  other: [
    'ペットの飼育は可能でしょうか？小型犬1匹を飼っています。',
    '駐車場はありますか？月額料金も教えてください。',
    '契約時に必要な書類を教えてください。',
    '更新料や保険について詳しく知りたいです。',
    '周辺環境について教えてください。スーパーやコンビニは近いですか？',
  ],
};

export async function seedInquiries() {
  console.log('🌱 Seeding 60 inquiries...');

  // ユーザーID取得
  const users = [
    { email: 'iyggf66974-2@yahoo.ne.jp', name: '山田 太郎' },
    { email: 'iyggf66974-3@yahoo.ne.jp', name: '佐藤 花子' },
    { email: 'iyggf66974-4@yahoo.ne.jp', name: '鈴木 次郎' },
  ];

  const userIds = [];
  for (const user of users) {
    const result = await query(
      `SELECT id FROM users WHERE email = $1 AND role = 'individual'`,
      [user.email]
    );
    if (result.rows.length === 0) {
      throw new Error(`User not found: ${user.email}`);
    }
    userIds.push({ id: result.rows[0].id, name: user.name, email: user.email });
  }

  // 企業ユーザーID取得
  const corporateResult = await query(
    `SELECT id FROM users WHERE email = 'iyggf66974@yahoo.ne.jp' AND role = 'corporate'`
  );
  const corporateUserId = corporateResult.rows[0].id;

  // 物件ID取得
  const propertiesResult = await query(
    `SELECT id FROM properties WHERE corporate_user_id = $1 ORDER BY id`,
    [corporateUserId]
  );

  if (propertiesResult.rows.length === 0) {
    throw new Error('No properties found');
  }

  const propertyIds = propertiesResult.rows.map((row: any) => row.id);

  let inquiryCount = 0;

  // 各ユーザーから20件ずつ
  for (const user of userIds) {
    for (let i = 0; i < 20; i++) {
      // ランダムに物件を選択
      const propertyId = propertyIds[Math.floor(Math.random() * propertyIds.length)];

      // ランダムに問い合わせタイプを選択
      const inquiryType = inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)];

      // メッセージ作成
      let message = '';
      if (inquiryType === 'vacancy') {
        message = '【最新の空室状況を知りたい】\n';
        message += inquiryMessages.vacancy[Math.floor(Math.random() * inquiryMessages.vacancy.length)];
      } else if (inquiryType === 'viewing') {
        message = '【実際に見学したい】\n';
        message += inquiryMessages.viewing[Math.floor(Math.random() * inquiryMessages.viewing.length)];
      } else {
        message = '【その他の問い合わせ】\n';
        message += inquiryMessages.other[Math.floor(Math.random() * inquiryMessages.other.length)];
      }

      // ステータスをランダムに選択（配分: unread 30%, read 30%, responded 40%）
      let status;
      const rand = Math.random();
      if (rand < 0.3) {
        status = 'unread';
      } else if (rand < 0.6) {
        status = 'read';
      } else {
        status = 'responded';
      }

      // 問い合わせ作成
      const result = await query(
        `INSERT INTO inquiries (
          property_id, individual_user_id, corporate_user_id,
          contact_name, contact_email, contact_phone, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          propertyId,
          user.id,
          corporateUserId,
          user.name,
          user.email,
          `080-${1000 + i}-${5000 + i}`,
          message,
          status,
        ]
      );

      inquiryCount++;
      console.log(`✅ Created inquiry ${inquiryCount}/60: ${user.name} -> Property ${propertyId} (${status})`);
    }
  }

  console.log('✅ Inquiries seeding completed!');
  console.log(`📊 Status breakdown:`);

  const statusCount = await query(
    `SELECT status, COUNT(*) as count
     FROM inquiries
     GROUP BY status
     ORDER BY status`
  );

  statusCount.rows.forEach((row: any) => {
    console.log(`   ${row.status}: ${row.count} inquiries`);
  });
}

// 直接実行された場合のみ実行
if (require.main === module) {
  seedInquiries().catch((error) => {
    console.error('❌ Error seeding inquiries:', error);
    process.exit(1);
  });
}
