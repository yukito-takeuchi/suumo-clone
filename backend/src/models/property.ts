import { query } from '../config/database';
import { PropertySearchParams, PropertyWithStations, PropertySearchResult } from '../types/property';

export const propertyModel = {
  /**
   * 物件検索（フィルタリング、ソート、ページネーション対応）
   */
  async searchProperties(params: PropertySearchParams): Promise<PropertySearchResult> {
    const {
      prefecture_ids,
      railway_line_ids,
      station_ids,
      walking_minutes_max,
      rent_min,
      rent_max,
      floor_plan_type_ids,
      building_type_ids,
      area_min,
      area_max,
      building_age_max,
      feature_ids,
      keyword,
      sort_by = 'created_at_desc',
      page = 1,
      limit = 20,
    } = params;

    const whereClauses: string[] = ['p.is_published = true'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // 都道府県フィルタ
    if (prefecture_ids && prefecture_ids.length > 0) {
      whereClauses.push(`p.prefecture_id = ANY($${paramIndex})`);
      queryParams.push(prefecture_ids);
      paramIndex++;
    }

    // 沿線フィルタ（駅経由）
    if (railway_line_ids && railway_line_ids.length > 0) {
      whereClauses.push(`
        EXISTS (
          SELECT 1 FROM property_stations ps
          JOIN stations s ON ps.station_id = s.id
          WHERE ps.property_id = p.id
          AND s.railway_line_id = ANY($${paramIndex})
        )
      `);
      queryParams.push(railway_line_ids);
      paramIndex++;
    }

    // 駅フィルタ
    if (station_ids && station_ids.length > 0) {
      whereClauses.push(`
        EXISTS (
          SELECT 1 FROM property_stations ps
          WHERE ps.property_id = p.id
          AND ps.station_id = ANY($${paramIndex})
        )
      `);
      queryParams.push(station_ids);
      paramIndex++;
    }

    // 駅徒歩フィルタ
    if (walking_minutes_max !== undefined) {
      whereClauses.push(`
        EXISTS (
          SELECT 1 FROM property_stations ps
          WHERE ps.property_id = p.id
          AND ps.walking_minutes <= $${paramIndex}
        )
      `);
      queryParams.push(walking_minutes_max);
      paramIndex++;
    }

    // 賃料フィルタ
    if (rent_min !== undefined) {
      whereClauses.push(`p.rent >= $${paramIndex}`);
      queryParams.push(rent_min);
      paramIndex++;
    }
    if (rent_max !== undefined) {
      whereClauses.push(`p.rent <= $${paramIndex}`);
      queryParams.push(rent_max);
      paramIndex++;
    }

    // 間取りフィルタ
    if (floor_plan_type_ids && floor_plan_type_ids.length > 0) {
      whereClauses.push(`p.floor_plan_type_id = ANY($${paramIndex})`);
      queryParams.push(floor_plan_type_ids);
      paramIndex++;
    }

    // 建物種類フィルタ
    if (building_type_ids && building_type_ids.length > 0) {
      whereClauses.push(`p.building_type_id = ANY($${paramIndex})`);
      queryParams.push(building_type_ids);
      paramIndex++;
    }

    // 面積フィルタ
    if (area_min !== undefined) {
      whereClauses.push(`p.area >= $${paramIndex}`);
      queryParams.push(area_min);
      paramIndex++;
    }
    if (area_max !== undefined) {
      whereClauses.push(`p.area <= $${paramIndex}`);
      queryParams.push(area_max);
      paramIndex++;
    }

    // 築年数フィルタ
    if (building_age_max !== undefined) {
      whereClauses.push(`(p.building_age IS NULL OR p.building_age <= $${paramIndex})`);
      queryParams.push(building_age_max);
      paramIndex++;
    }

    // こだわり条件フィルタ（すべての条件を満たす物件）
    if (feature_ids && feature_ids.length > 0) {
      whereClauses.push(`
        (
          SELECT COUNT(DISTINCT ppf.feature_id)
          FROM property_property_features ppf
          WHERE ppf.property_id = p.id
          AND ppf.feature_id = ANY($${paramIndex})
        ) = $${paramIndex + 1}
      `);
      queryParams.push(feature_ids, feature_ids.length);
      paramIndex += 2;
    }

    // フリーワード検索（全文検索）
    if (keyword) {
      whereClauses.push(`
        to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.description, ''))
        @@ plainto_tsquery('simple', $${paramIndex})
      `);
      queryParams.push(keyword);
      paramIndex++;
    }

    // WHERE句の組み立て
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // ソート順の設定
    let orderByClause = '';
    switch (sort_by) {
      case 'rent_asc':
        orderByClause = 'ORDER BY p.rent ASC, p.id DESC';
        break;
      case 'rent_desc':
        orderByClause = 'ORDER BY p.rent DESC, p.id DESC';
        break;
      case 'area_desc':
        orderByClause = 'ORDER BY p.area DESC, p.id DESC';
        break;
      case 'created_at_desc':
      default:
        orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
        break;
    }

    // ページネーション
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    // メインクエリ（物件一覧取得 + 総件数）
    const mainQuery = `
      SELECT
        p.*,
        pref.name as prefecture_name,
        bt.name as building_type_name,
        fpt.name as floor_plan_type_name,
        COUNT(*) OVER() as total_count
      FROM properties p
      JOIN prefectures pref ON p.prefecture_id = pref.id
      JOIN building_types bt ON p.building_type_id = bt.id
      JOIN floor_plan_types fpt ON p.floor_plan_type_id = fpt.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await query(mainQuery, queryParams);
    const properties = result.rows;
    const total = properties.length > 0 ? parseInt(properties[0].total_count) : 0;

    // 物件IDリストを取得
    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      return {
        properties: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // 各物件の駅情報を取得
    const stationsQuery = `
      SELECT
        ps.property_id,
        ps.walking_minutes,
        ps.display_order,
        s.id,
        s.name,
        rl.name as railway_line_name
      FROM property_stations ps
      JOIN stations s ON ps.station_id = s.id
      JOIN railway_lines rl ON s.railway_line_id = rl.id
      WHERE ps.property_id = ANY($1)
      ORDER BY ps.property_id, ps.display_order
    `;
    const stationsResult = await query(stationsQuery, [propertyIds]);

    // 各物件の画像を取得
    const imagesQuery = `
      SELECT
        property_id,
        id,
        image_url,
        display_order
      FROM property_images
      WHERE property_id = ANY($1)
      ORDER BY property_id, display_order
    `;
    const imagesResult = await query(imagesQuery, [propertyIds]);

    // 各物件のこだわり条件を取得
    const featuresQuery = `
      SELECT
        ppf.property_id,
        pf.id,
        pf.name
      FROM property_property_features ppf
      JOIN property_features pf ON ppf.feature_id = pf.id
      WHERE ppf.property_id = ANY($1)
      ORDER BY ppf.property_id, pf.name
    `;
    const featuresResult = await query(featuresQuery, [propertyIds]);

    // データを整形
    const propertiesWithDetails: PropertyWithStations[] = properties.map(p => {
      const stations = stationsResult.rows
        .filter(s => s.property_id === p.id)
        .map(s => ({
          id: s.id,
          name: s.name,
          railway_line_name: s.railway_line_name,
          walking_minutes: s.walking_minutes,
          display_order: s.display_order,
        }));

      const images = imagesResult.rows
        .filter(i => i.property_id === p.id)
        .map(i => ({
          id: i.id,
          image_url: i.image_url,
          display_order: i.display_order,
        }));

      const features = featuresResult.rows
        .filter(f => f.property_id === p.id)
        .map(f => ({
          id: f.id,
          name: f.name,
        }));

      // total_countを除外
      const { total_count, ...propertyData } = p;

      return {
        ...propertyData,
        stations,
        images,
        features,
      };
    });

    return {
      properties: propertiesWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * 物件詳細取得（ID指定）
   */
  async getPropertyById(id: number): Promise<PropertyWithStations | null> {
    const result = await query(
      `
      SELECT
        p.*,
        pref.name as prefecture_name,
        bt.name as building_type_name,
        fpt.name as floor_plan_type_name
      FROM properties p
      JOIN prefectures pref ON p.prefecture_id = pref.id
      JOIN building_types bt ON p.building_type_id = bt.id
      JOIN floor_plan_types fpt ON p.floor_plan_type_id = fpt.id
      WHERE p.id = $1 AND p.is_published = true
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const property = result.rows[0];

    // 駅情報を取得
    const stationsResult = await query(
      `
      SELECT
        ps.walking_minutes,
        ps.display_order,
        s.id,
        s.name,
        rl.name as railway_line_name
      FROM property_stations ps
      JOIN stations s ON ps.station_id = s.id
      JOIN railway_lines rl ON s.railway_line_id = rl.id
      WHERE ps.property_id = $1
      ORDER BY ps.display_order
      `,
      [id]
    );

    // 画像を取得
    const imagesResult = await query(
      `
      SELECT id, image_url, display_order
      FROM property_images
      WHERE property_id = $1
      ORDER BY display_order
      `,
      [id]
    );

    // こだわり条件を取得
    const featuresResult = await query(
      `
      SELECT pf.id, pf.name
      FROM property_property_features ppf
      JOIN property_features pf ON ppf.feature_id = pf.id
      WHERE ppf.property_id = $1
      ORDER BY pf.name
      `,
      [id]
    );

    return {
      ...property,
      stations: stationsResult.rows,
      images: imagesResult.rows,
      features: featuresResult.rows,
    };
  },
};
