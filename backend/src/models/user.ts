import { query, getClient } from '../config/database';

export const userModel = {
  /**
   * ユーザー登録（Firebase UID, email, role）
   */
  async createUser(firebaseUid: string, email: string, role: 'individual' | 'corporate') {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // ユーザーを作成
      const userResult = await client.query(
        `INSERT INTO users (firebase_uid, email, role)
         VALUES ($1, $2, $3)
         RETURNING id, firebase_uid, email, role, created_at`,
        [firebaseUid, email, role]
      );
      const user = userResult.rows[0];

      // ロールに応じてプロフィールテーブルを作成
      if (role === 'individual') {
        await client.query(
          `INSERT INTO individual_profiles (user_id) VALUES ($1)`,
          [user.id]
        );
      } else if (role === 'corporate') {
        await client.query(
          `INSERT INTO corporate_profiles (user_id, company_name) VALUES ($1, $2)`,
          [user.id, '未設定']
        );
      }

      await client.query('COMMIT');
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Firebase UIDでユーザーを取得
   */
  async getUserByFirebaseUid(firebaseUid: string) {
    const result = await query(
      `SELECT id, firebase_uid, email, role, created_at, updated_at
       FROM users
       WHERE firebase_uid = $1`,
      [firebaseUid]
    );
    return result.rows[0] || null;
  },

  /**
   * ユーザーIDでユーザーを取得
   */
  async getUserById(userId: number) {
    const result = await query(
      `SELECT id, firebase_uid, email, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * 個人ユーザープロフィール取得
   */
  async getIndividualProfile(userId: number) {
    const result = await query(
      `SELECT ip.*, u.email
       FROM individual_profiles ip
       JOIN users u ON ip.user_id = u.id
       WHERE ip.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * 個人ユーザープロフィール更新
   */
  async updateIndividualProfile(
    userId: number,
    data: { first_name?: string; last_name?: string; phone?: string }
  ) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.first_name !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(data.last_name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }

    if (fields.length === 0) {
      return this.getIndividualProfile(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE individual_profiles
       SET ${fields.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0];
  },

  /**
   * 企業ユーザープロフィール取得
   */
  async getCorporateProfile(userId: number) {
    const result = await query(
      `SELECT cp.*, u.email
       FROM corporate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * 企業ユーザープロフィール更新
   */
  async updateCorporateProfile(
    userId: number,
    data: {
      company_name?: string;
      license_number?: string;
      phone?: string;
      address?: string;
      description?: string;
    }
  ) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.company_name !== undefined) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(data.company_name);
    }
    if (data.license_number !== undefined) {
      fields.push(`license_number = $${paramIndex++}`);
      values.push(data.license_number);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      values.push(data.address);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (fields.length === 0) {
      return this.getCorporateProfile(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE corporate_profiles
       SET ${fields.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0];
  },
};
