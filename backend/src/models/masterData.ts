import { query } from '../config/database';

export const masterDataModel = {
  // 都道府県一覧取得
  async getPrefectures() {
    const result = await query(`
      SELECT id, name
      FROM prefectures
      ORDER BY id
    `);
    return result.rows;
  },

  // 沿線一覧取得（都道府県でフィルタ可能）
  async getRailwayLines(prefectureId?: number) {
    let sql = `
      SELECT rl.id, rl.name, rl.prefecture_id, p.name as prefecture_name
      FROM railway_lines rl
      JOIN prefectures p ON rl.prefecture_id = p.id
    `;
    const params: any[] = [];

    if (prefectureId) {
      sql += ' WHERE rl.prefecture_id = $1';
      params.push(prefectureId);
    }

    sql += ' ORDER BY rl.prefecture_id, rl.name';

    const result = await query(sql, params);
    return result.rows;
  },

  // 駅一覧取得（沿線でフィルタ可能）
  async getStations(railwayLineId?: number) {
    let sql = `
      SELECT s.id, s.name, s.railway_line_id, rl.name as railway_line_name
      FROM stations s
      JOIN railway_lines rl ON s.railway_line_id = rl.id
    `;
    const params: any[] = [];

    if (railwayLineId) {
      sql += ' WHERE s.railway_line_id = $1';
      params.push(railwayLineId);
    }

    sql += ' ORDER BY s.railway_line_id, s.name';

    const result = await query(sql, params);
    return result.rows;
  },

  // 間取りタイプ一覧取得
  async getFloorPlanTypes() {
    const result = await query(`
      SELECT id, name, display_order
      FROM floor_plan_types
      ORDER BY display_order
    `);
    return result.rows;
  },

  // 建物種類一覧取得
  async getBuildingTypes() {
    const result = await query(`
      SELECT id, name
      FROM building_types
      ORDER BY name
    `);
    return result.rows;
  },

  // こだわり条件一覧取得
  async getPropertyFeatures() {
    const result = await query(`
      SELECT id, name, description
      FROM property_features
      ORDER BY name
    `);
    return result.rows;
  },
};
