import { Pool } from 'pg';
import dotenv from 'dotenv';
import { seedUsers } from './seed-users';
import { seedPropertiesFull } from './seed-properties-full';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedMasterData(client: any) {
  console.log('🌱 Seeding master data...');

  // 1. Seed prefectures (都道府県)
  console.log('Seeding prefectures...');
  await client.query(`
    INSERT INTO prefectures (name) VALUES
      ('東京都'), ('神奈川県'), ('千葉県'), ('埼玉県'), ('大阪府'),
      ('京都府'), ('兵庫県'), ('愛知県'), ('福岡県'), ('北海道')
    ON CONFLICT (name) DO NOTHING;
  `);

  // 2. Seed railway lines (沿線)
  console.log('Seeding railway lines...');
  const { rows: prefectures } = await client.query('SELECT id, name FROM prefectures');
  const tokyoId = prefectures.find((p: any) => p.name === '東京都')?.id;
  const kanagawaId = prefectures.find((p: any) => p.name === '神奈川県')?.id;

  if (tokyoId) {
    await client.query(`
      INSERT INTO railway_lines (prefecture_id, name) VALUES
        ($1, 'JR山手線'),
        ($1, 'JR中央線'),
        ($1, '東京メトロ丸ノ内線'),
        ($1, '東京メトロ銀座線'),
        ($1, '東京メトロ日比谷線'),
        ($1, '京王線'),
        ($1, '小田急線')
      ON CONFLICT (prefecture_id, name) DO NOTHING;
    `, [tokyoId]);
  }

  if (kanagawaId) {
    await client.query(`
      INSERT INTO railway_lines (prefecture_id, name) VALUES
        ($1, 'JR横浜線'),
        ($1, '東急東横線'),
        ($1, '京急本線')
      ON CONFLICT (prefecture_id, name) DO NOTHING;
    `, [kanagawaId]);
  }

  // 3. Seed stations (駅)
  console.log('Seeding stations...');
  const { rows: railwayLines } = await client.query('SELECT id, name FROM railway_lines');

  const yamanoteLine = railwayLines.find((r: any) => r.name === 'JR山手線')?.id;
  if (yamanoteLine) {
    await client.query(`
      INSERT INTO stations (railway_line_id, name) VALUES
        ($1, '東京'), ($1, '新橋'), ($1, '品川'), ($1, '渋谷'),
        ($1, '新宿'), ($1, '池袋'), ($1, '上野'), ($1, '秋葉原')
      ON CONFLICT (railway_line_id, name) DO NOTHING;
    `, [yamanoteLine]);
  }

  const chuoLine = railwayLines.find((r: any) => r.name === 'JR中央線')?.id;
  if (chuoLine) {
    await client.query(`
      INSERT INTO stations (railway_line_id, name) VALUES
        ($1, '新宿'), ($1, '中野'), ($1, '高円寺'), ($1, '吉祥寺'),
        ($1, '三鷹'), ($1, '国分寺'), ($1, '立川')
      ON CONFLICT (railway_line_id, name) DO NOTHING;
    `, [chuoLine]);
  }

  // 4. Seed floor plan types (間取り)
  console.log('Seeding floor plan types...');
  await client.query(`
    INSERT INTO floor_plan_types (name, display_order) VALUES
      ('ワンルーム', 1),
      ('1K', 2),
      ('1DK', 3),
      ('1LDK', 4),
      ('2K', 5),
      ('2DK', 6),
      ('2LDK', 7),
      ('3K', 8),
      ('3DK', 9),
      ('3LDK', 10),
      ('4LDK以上', 11)
    ON CONFLICT (name) DO NOTHING;
  `);

  // 5. Seed building types (建物種類)
  console.log('Seeding building types...');
  await client.query(`
    INSERT INTO building_types (name) VALUES
      ('アパート'),
      ('マンション'),
      ('一戸建て'),
      ('タウンハウス'),
      ('テラスハウス')
    ON CONFLICT (name) DO NOTHING;
  `);

  // 6. Seed property features (こだわり条件)
  console.log('Seeding property features...');
  await client.query(`
    INSERT INTO property_features (name, description) VALUES
      ('バス・トイレ別', 'バスルームとトイレが別々になっている'),
      ('オートロック', 'エントランスにオートロック付き'),
      ('ペット可', 'ペットの飼育が可能'),
      ('駐車場あり', '駐車場が利用可能'),
      ('2階以上', '2階以上の部屋'),
      ('最上階', '建物の最上階'),
      ('角部屋', '角部屋'),
      ('南向き', '南向きの部屋'),
      ('エアコン付き', 'エアコン設置済み'),
      ('フローリング', '床がフローリング'),
      ('室内洗濯機置場', '室内に洗濯機置き場あり'),
      ('独立洗面台', '独立した洗面台あり'),
      ('宅配ボックス', '宅配ボックス設置済み'),
      ('インターネット無料', 'インターネット回線無料'),
      ('デザイナーズ', 'デザイナーズ物件'),
      ('新築', '新築物件'),
      ('リノベーション', 'リノベーション済み'),
      ('敷金礼金なし', '敷金・礼金が不要')
    ON CONFLICT (name) DO NOTHING;
  `);
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // マスターデータ投入
    await seedMasterData(client);

    await client.query('COMMIT');
    console.log('✅ Master data seeding completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Master data seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }

  // ユーザーデータ投入（別トランザクション）
  try {
    await seedUsers();
  } catch (error) {
    console.error('❌ User seeding failed:', error);
    throw error;
  }

  await pool.end();

  // 物件データ投入（ユーザーデータ投入後に実行）
  try {
    await seedPropertiesFull();
  } catch (error) {
    console.error('❌ Property seeding failed:', error);
  }

  console.log('✅ All seeding completed successfully!');
}

seed().catch(console.error);
