import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedTestProperties() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding test properties...');

    // テスト用企業ユーザーを作成
    const userResult = await client.query(`
      INSERT INTO users (firebase_uid, email, role)
      VALUES ('test-corporate-uid-001', 'test-corporate@example.com', 'corporate')
      ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
      RETURNING id;
    `);
    const corporateUserId = userResult.rows[0].id;

    await client.query(`
      INSERT INTO corporate_profiles (user_id, company_name, phone, address)
      VALUES ($1, 'テスト不動産株式会社', '03-1234-5678', '東京都渋谷区渋谷1-1-1')
      ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name;
    `, [corporateUserId]);

    // 必要なマスターデータのIDを取得
    const { rows: [tokyo] } = await client.query("SELECT id FROM prefectures WHERE name = '東京都'");
    const { rows: [yamanote] } = await client.query("SELECT id FROM stations WHERE name = '渋谷'");
    const { rows: [shinjuku] } = await client.query("SELECT id FROM stations WHERE name = '新宿'");
    const { rows: [oneK] } = await client.query("SELECT id FROM floor_plan_types WHERE name = '1K'");
    const { rows: [oneLDK] } = await client.query("SELECT id FROM floor_plan_types WHERE name = '1LDK'");
    const { rows: [twoLDK] } = await client.query("SELECT id FROM floor_plan_types WHERE name = '2LDK'");
    const { rows: [mansion] } = await client.query("SELECT id FROM building_types WHERE name = 'マンション'");
    const { rows: [apartment] } = await client.query("SELECT id FROM building_types WHERE name = 'アパート'");

    // テスト物件を作成
    const properties = [
      {
        title: '渋谷駅徒歩5分 1K 新築マンション',
        description: '渋谷駅から徒歩5分の好立地。新築で設備充実。',
        prefecture_id: tokyo.id,
        address: '東京都渋谷区渋谷2-1-1',
        building_type_id: mansion.id,
        building_name: 'シブヤレジデンス',
        building_age: 0,
        floor_number: 5,
        total_floors: 10,
        floor_plan_type_id: oneK.id,
        area: 25.5,
        rent: 95000,
        management_fee: 5000,
        deposit: 95000,
        key_money: 95000,
        is_published: true,
        stations: [{ id: yamanote.id, walking_minutes: 5, display_order: 1 }],
        features: ['オートロック', 'バス・トイレ別', 'エアコン付き'],
      },
      {
        title: '新宿駅近 1LDK ペット可物件',
        description: '新宿駅から徒歩8分。ペット飼育可能な広めの1LDK。',
        prefecture_id: tokyo.id,
        address: '東京都新宿区西新宿3-2-1',
        building_type_id: mansion.id,
        building_name: 'シンジュクハイツ',
        building_age: 5,
        floor_number: 3,
        total_floors: 8,
        floor_plan_type_id: oneLDK.id,
        area: 45.2,
        rent: 135000,
        management_fee: 8000,
        deposit: 135000,
        key_money: 135000,
        is_published: true,
        stations: [{ id: shinjuku.id, walking_minutes: 8, display_order: 1 }],
        features: ['ペット可', 'バス・トイレ別', 'オートロック', '宅配ボックス'],
      },
      {
        title: '渋谷・新宿2駅利用可 2LDK ファミリー向け',
        description: '渋谷・新宿の2駅が利用可能。ファミリーにおすすめの2LDK。',
        prefecture_id: tokyo.id,
        address: '東京都渋谷区代々木1-1-1',
        building_type_id: mansion.id,
        building_name: 'ヨヨギパークサイド',
        building_age: 10,
        floor_number: 7,
        total_floors: 12,
        floor_plan_type_id: twoLDK.id,
        area: 60.8,
        rent: 180000,
        management_fee: 10000,
        deposit: 180000,
        key_money: 180000,
        is_published: true,
        stations: [
          { id: yamanote.id, walking_minutes: 12, display_order: 1 },
          { id: shinjuku.id, walking_minutes: 10, display_order: 2 },
        ],
        features: ['バス・トイレ別', 'オートロック', '南向き', '宅配ボックス', '駐車場あり'],
      },
      {
        title: '渋谷駅徒歩3分 1K 格安アパート',
        description: '渋谷駅至近の好立地ながら格安の1K。',
        prefecture_id: tokyo.id,
        address: '東京都渋谷区渋谷1-5-3',
        building_type_id: apartment.id,
        building_name: 'シブヤアパート',
        building_age: 20,
        floor_number: 2,
        total_floors: 3,
        floor_plan_type_id: oneK.id,
        area: 18.0,
        rent: 65000,
        management_fee: 3000,
        deposit: 65000,
        key_money: 0,
        is_published: true,
        stations: [{ id: yamanote.id, walking_minutes: 3, display_order: 1 }],
        features: ['敷金礼金なし'],
      },
      {
        title: '新宿駅徒歩15分 2LDK リノベーション済み',
        description: 'リノベーション済みで内装がきれいな2LDK。',
        prefecture_id: tokyo.id,
        address: '東京都新宿区西新宿5-10-5',
        building_type_id: mansion.id,
        building_name: 'ニシシンジュクレジデンス',
        building_age: 15,
        floor_number: 4,
        total_floors: 10,
        floor_plan_type_id: twoLDK.id,
        area: 55.3,
        rent: 160000,
        management_fee: 8000,
        deposit: 160000,
        key_money: 160000,
        is_published: true,
        stations: [{ id: shinjuku.id, walking_minutes: 15, display_order: 1 }],
        features: ['リノベーション', 'バス・トイレ別', 'フローリング', '独立洗面台'],
      },
    ];

    for (const prop of properties) {
      // 物件を挿入
      const propertyResult = await client.query(`
        INSERT INTO properties (
          corporate_user_id, title, description, prefecture_id, address,
          building_type_id, building_name, building_age, floor_number, total_floors,
          floor_plan_type_id, area, rent, management_fee, deposit, key_money, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id;
      `, [
        corporateUserId, prop.title, prop.description, prop.prefecture_id, prop.address,
        prop.building_type_id, prop.building_name, prop.building_age, prop.floor_number, prop.total_floors,
        prop.floor_plan_type_id, prop.area, prop.rent, prop.management_fee, prop.deposit, prop.key_money, prop.is_published,
      ]);

      const propertyId = propertyResult.rows[0].id;

      // 駅情報を挿入
      for (const station of prop.stations) {
        await client.query(`
          INSERT INTO property_stations (property_id, station_id, walking_minutes, display_order)
          VALUES ($1, $2, $3, $4);
        `, [propertyId, station.id, station.walking_minutes, station.display_order]);
      }

      // こだわり条件を挿入
      for (const featureName of prop.features) {
        const featureResult = await client.query(
          'SELECT id FROM property_features WHERE name = $1',
          [featureName]
        );
        if (featureResult.rows.length > 0) {
          await client.query(`
            INSERT INTO property_property_features (property_id, feature_id)
            VALUES ($1, $2);
          `, [propertyId, featureResult.rows[0].id]);
        }
      }

      console.log(`✅ Created property: ${prop.title}`);
    }

    await client.query('COMMIT');
    console.log('✅ Test properties seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test properties seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTestProperties().catch(console.error);
