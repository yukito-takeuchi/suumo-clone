import { query } from '../config/database';

const propertyData = [
  { title: 'グランドメゾン渋谷', address: '渋谷区道玄坂1-2-3', rent: 120000, floor_plan: '1LDK', building_type: 'マンション', area: 35.5, building_age: 3, floor_number: 5, stations: [1, 2], features: [1, 2, 3, 5] },
  { title: 'パークハイム新宿', address: '新宿区西新宿2-1-1', rent: 95000, floor_plan: '1K', building_type: 'マンション', area: 25.0, building_age: 5, floor_number: 3, stations: [3], features: [1, 4, 6] },
  { title: 'コーポ池袋', address: '豊島区東池袋3-4-5', rent: 75000, floor_plan: '1K', building_type: 'アパート', area: 22.0, building_age: 10, floor_number: 2, stations: [4, 5], features: [2, 7] },
  { title: 'リバーサイド品川', address: '品川区北品川1-2-3', rent: 140000, floor_plan: '2LDK', building_type: 'マンション', area: 55.0, building_age: 2, floor_number: 8, stations: [6], features: [1, 2, 3, 4, 8] },
  { title: 'サンライト目黒', address: '目黒区目黒3-5-7', rent: 105000, floor_plan: '1DK', building_type: 'マンション', area: 30.0, building_age: 7, floor_number: 4, stations: [7, 8], features: [1, 3, 5] },
  { title: 'ハイツ中野', address: '中野区中野5-1-2', rent: 68000, floor_plan: '1K', building_type: 'アパート', area: 20.0, building_age: 15, floor_number: 2, stations: [9], features: [6, 7] },
  { title: 'ベルメゾン恵比寿', address: '渋谷区恵比寿西2-3-4', rent: 130000, floor_plan: '1LDK', building_type: 'マンション', area: 40.0, building_age: 4, floor_number: 6, stations: [10, 1], features: [1, 2, 4, 5, 8] },
  { title: 'グリーンヒル吉祥寺', address: '武蔵野市吉祥寺本町1-2-3', rent: 88000, floor_plan: '1K', building_type: 'アパート', area: 24.0, building_age: 8, floor_number: 3, stations: [11], features: [2, 3, 6] },
  { title: 'パレス赤坂', address: '港区赤坂3-4-5', rent: 150000, floor_plan: '1LDK', building_type: 'マンション', area: 42.0, building_age: 1, floor_number: 10, stations: [12, 13], features: [1, 2, 3, 4, 5] },
  { title: 'コスモ高田馬場', address: '新宿区高田馬場2-1-1', rent: 72000, floor_plan: '1K', building_type: 'マンション', area: 21.0, building_age: 12, floor_number: 4, stations: [14], features: [1, 6] },
  { title: 'エスポワール三軒茶屋', address: '世田谷区三軒茶屋1-2-3', rent: 82000, floor_plan: '1K', building_type: 'アパート', area: 23.0, building_age: 9, floor_number: 2, stations: [15, 1], features: [2, 7, 8] },
  { title: 'シティハイツ銀座', address: '中央区銀座5-1-1', rent: 145000, floor_plan: '2LDK', building_type: 'マンション', area: 50.0, building_age: 3, floor_number: 7, stations: [2], features: [1, 2, 3, 4] },
  { title: 'メゾン下北沢', address: '世田谷区北沢2-3-4', rent: 79000, floor_plan: '1K', building_type: 'アパート', area: 22.5, building_age: 11, floor_number: 3, stations: [3, 4], features: [3, 6, 7] },
  { title: 'プラザ五反田', address: '品川区西五反田1-2-3', rent: 92000, floor_plan: '1DK', building_type: 'マンション', area: 28.0, building_age: 6, floor_number: 5, stations: [5], features: [1, 2, 5] },
  { title: 'レジデンス表参道', address: '港区南青山3-4-5', rent: 135000, floor_plan: '1LDK', building_type: 'マンション', area: 38.0, building_age: 2, floor_number: 9, stations: [6, 7], features: [1, 2, 3, 4, 8] },
  { title: 'ヴィラ中目黒', address: '目黒区上目黒2-1-1', rent: 98000, floor_plan: '1DK', building_type: 'マンション', area: 29.0, building_age: 5, floor_number: 4, stations: [8], features: [1, 3, 5] },
  { title: 'ハイム蒲田', address: '大田区蒲田5-2-3', rent: 65000, floor_plan: '1K', building_type: 'アパート', area: 19.5, building_age: 13, floor_number: 2, stations: [9, 10], features: [6, 7] },
  { title: 'グランド六本木', address: '港区六本木6-1-2', rent: 148000, floor_plan: '1LDK', building_type: 'マンション', area: 43.0, building_age: 1, floor_number: 11, stations: [11], features: [1, 2, 3, 4, 5, 8] },
  { title: 'サニーコート練馬', address: '練馬区練馬1-3-4', rent: 62000, floor_plan: '1K', building_type: 'アパート', area: 20.5, building_age: 14, floor_number: 2, stations: [12], features: [6, 7] },
  { title: 'リバティ自由が丘', address: '目黒区自由が丘2-2-2', rent: 110000, floor_plan: '1LDK', building_type: 'マンション', area: 36.0, building_age: 4, floor_number: 6, stations: [13, 14], features: [1, 2, 3, 5] },
  { title: 'エクセル神田', address: '千代田区神田1-1-1', rent: 85000, floor_plan: '1K', building_type: 'マンション', area: 24.5, building_age: 8, floor_number: 5, stations: [15], features: [1, 4, 6] },
  { title: 'パーク上野', address: '台東区上野3-2-1', rent: 78000, floor_plan: '1K', building_type: 'アパート', area: 22.0, building_age: 10, floor_number: 3, stations: [1, 2], features: [2, 7] },
  { title: 'オーシャンビュー浜松町', address: '港区浜松町2-3-4', rent: 115000, floor_plan: '1DK', building_type: 'マンション', area: 32.0, building_age: 5, floor_number: 8, stations: [3], features: [1, 2, 4, 5] },
  { title: 'フォレスト成城', address: '世田谷区成城2-1-1', rent: 125000, floor_plan: '2LDK', building_type: 'マンション', area: 48.0, building_age: 3, floor_number: 4, stations: [4], features: [1, 3, 4, 8] },
  { title: 'スカイハイツ北千住', address: '足立区千住1-2-3', rent: 58000, floor_plan: '1K', building_type: 'アパート', area: 19.0, building_age: 16, floor_number: 2, stations: [5], features: [6, 7] },
  { title: 'ロイヤル麻布', address: '港区麻布十番2-3-4', rent: 142000, floor_plan: '1LDK', building_type: 'マンション', area: 41.0, building_age: 2, floor_number: 9, stations: [6, 7], features: [1, 2, 3, 4, 5] },
  { title: 'アーバン錦糸町', address: '墨田区錦糸1-1-1', rent: 71000, floor_plan: '1K', building_type: 'マンション', area: 21.5, building_age: 11, floor_number: 6, stations: [8], features: [1, 6] },
  { title: 'ガーデン代々木', address: '渋谷区代々木1-2-3', rent: 89000, floor_plan: '1DK', building_type: 'アパート', area: 26.0, building_age: 9, floor_number: 3, stations: [9, 10], features: [2, 3, 7] },
  { title: 'プレミア白金', address: '港区白金2-1-1', rent: 138000, floor_plan: '1LDK', building_type: 'マンション', area: 39.0, building_age: 1, floor_number: 10, stations: [11], features: [1, 2, 3, 4, 8] },
  { title: 'サンシャイン西荻窪', address: '杉並区西荻北3-2-1', rent: 67000, floor_plan: '1K', building_type: 'アパート', area: 20.0, building_age: 12, floor_number: 2, stations: [12], features: [6, 7] },
];

export async function seedPropertiesFull() {
  console.log('🌱 Seeding 30 properties...');

  // 企業ユーザーIDを取得
  const corporateUserResult = await query(
    `SELECT id FROM users WHERE email = 'iyggf66974@yahoo.ne.jp' AND role = 'corporate'`
  );

  if (corporateUserResult.rows.length === 0) {
    throw new Error('Corporate user not found');
  }

  const corporateUserId = corporateUserResult.rows[0].id;

    // 間取り・建物種類のマッピング
    const floorPlanMap: any = {};
    const floorPlanResult = await query('SELECT id, name FROM floor_plan_types');
    floorPlanResult.rows.forEach((row: any) => {
      floorPlanMap[row.name] = row.id;
    });

    const buildingTypeMap: any = {};
    const buildingTypeResult = await query('SELECT id, name FROM building_types');
    buildingTypeResult.rows.forEach((row: any) => {
      buildingTypeMap[row.name] = row.id;
    });

    for (let i = 0; i < propertyData.length; i++) {
      const property = propertyData[i];
      const isPublished = i < 24; // 最初の24件を公開、残り6件を非公開

      // 物件作成
      const propertyResult = await query(
        `INSERT INTO properties (
          corporate_user_id, title, prefecture_id, address, floor_plan_type_id,
          building_type_id, rent, management_fee, deposit, key_money,
          area, building_age, floor_number, is_published, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          corporateUserId,
          property.title,
          1, // 東京都
          property.address,
          floorPlanMap[property.floor_plan],
          buildingTypeMap[property.building_type],
          property.rent,
          5000, // 管理費
          property.rent, // 敷金 = 賃料1ヶ月
          property.rent, // 礼金 = 賃料1ヶ月
          property.area,
          property.building_age,
          property.floor_number,
          isPublished,
          `${property.title}は${property.address}にある築${property.building_age}年の${property.building_type}です。`,
        ]
      );

      const propertyId = propertyResult.rows[0].id;

      // 駅情報追加
      for (let j = 0; j < property.stations.length && j < 3; j++) {
        await query(
          `INSERT INTO property_stations (property_id, station_id, walking_minutes, display_order)
           VALUES ($1, $2, $3, $4)`,
          [propertyId, property.stations[j], 5 + j * 2, j + 1]
        );
      }

      // こだわり条件追加
      for (const featureId of property.features) {
        await query(
          `INSERT INTO property_property_features (property_id, feature_id)
           VALUES ($1, $2)`,
          [propertyId, featureId]
        );
      }

      // 画像追加（各物件に1枚ずつ）
      const imageUrl = `/uploads/seed/property-${i + 1}.jpg`;
      await query(
        `INSERT INTO property_images (property_id, image_url, display_order)
         VALUES ($1, $2, $3)`,
        [propertyId, imageUrl, 1]
      );

      console.log(`✅ Created property ${i + 1}/30: ${property.title}`);
    }

    console.log('✅ Properties seeding completed!');
}

// 直接実行された場合のみ実行
if (require.main === module) {
  seedPropertiesFull().catch((error) => {
    console.error('❌ Error seeding properties:', error);
    process.exit(1);
  });
}
