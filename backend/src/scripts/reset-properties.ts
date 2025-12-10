import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function resetProperties() {
  const client = await pool.connect();

  try {
    console.log('🗑️  物件データの初期化を開始します...\n');

    await client.query('BEGIN');

    // 1. 物件関連データを削除（外部キー制約の順序に注意）
    const propertyFeaturesResult = await client.query('DELETE FROM property_property_features RETURNING property_id');
    console.log(`✅ 物件こだわり条件を削除しました: ${propertyFeaturesResult.rowCount}件`);

    const propertyStationsResult = await client.query('DELETE FROM property_stations RETURNING property_id');
    console.log(`✅ 物件駅情報を削除しました: ${propertyStationsResult.rowCount}件`);

    // 3. 物件画像を削除（画像ファイルも削除）
    const imagesResult = await client.query('SELECT image_url FROM property_images');
    const imageUrls = imagesResult.rows.map((row: any) => row.image_url);

    // 画像ファイルを削除（/uploads/seed/ 以外）
    let deletedFileCount = 0;
    imageUrls.forEach((imageUrl: string) => {
      // seed画像は削除しない
      if (!imageUrl.includes('/seed/')) {
        try {
          const filename = path.basename(imageUrl);
          const filepath = path.join(__dirname, '../../public/uploads', filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            deletedFileCount++;
          }
        } catch (error) {
          console.error(`画像ファイル削除エラー: ${imageUrl}`, error);
        }
      }
    });

    const propertyImagesResult = await client.query('DELETE FROM property_images RETURNING id');
    console.log(`✅ 物件画像を削除しました: ${propertyImagesResult.rowCount}件（ファイル: ${deletedFileCount}件）`);

    // 4. 物件データを削除
    const propertiesResult = await client.query('DELETE FROM properties RETURNING id');
    console.log(`✅ 物件データを削除しました: ${propertiesResult.rowCount}件`);

    await client.query('COMMIT');

    console.log('\n🎉 物件データの初期化が完了しました！');
    console.log('\n📊 削除サマリー:');
    console.log(`   - 物件: ${propertiesResult.rowCount}件`);
    console.log(`   - 画像: ${propertyImagesResult.rowCount}件`);
    console.log(`   - 駅情報: ${propertyStationsResult.rowCount}件`);
    console.log(`   - こだわり条件: ${propertyFeaturesResult.rowCount}件`);
    console.log('\n💡 マスターデータ、ユーザーデータ、問い合わせデータは保持されています。');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 初期化中にエラーが発生しました:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// スクリプト実行
resetProperties()
  .then(() => {
    console.log('\n✨ スクリプトが正常に終了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('スクリプト実行エラー:', error);
    process.exit(1);
  });
