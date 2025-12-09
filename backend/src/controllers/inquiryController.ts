import { Request, Response } from 'express';
import { query } from '../config/database';

export const inquiryController = {
  /**
   * 問い合わせ送信（個人ユーザー）
   * POST /api/inquiries
   */
  async createInquiry(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'individual') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Individual user only',
          },
        });
      }

      const { property_id, inquiry_type, name, email, phone, message } = req.body;

      // バリデーション
      if (!property_id || !inquiry_type || !name || !email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'property_id, inquiry_type, name, and email are required',
          },
        });
      }

      // inquiry_type チェック
      if (!['vacancy', 'viewing', 'other'].includes(inquiry_type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'inquiry_type must be vacancy, viewing, or other',
          },
        });
      }

      // inquiry_type が other の場合、message 必須
      if (inquiry_type === 'other' && !message) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'message is required when inquiry_type is other',
          },
        });
      }

      // 物件が存在するか確認し、corporate_user_idを取得
      const propertyCheck = await query(
        'SELECT id, corporate_user_id FROM properties WHERE id = $1',
        [property_id]
      );

      if (propertyCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      const corporate_user_id = propertyCheck.rows[0].corporate_user_id;

      // inquiry_typeに応じたメッセージを作成
      let fullMessage = '';
      if (inquiry_type === 'vacancy') {
        fullMessage = '【最新の空室状況を知りたい】\n' + (message || '');
      } else if (inquiry_type === 'viewing') {
        fullMessage = '【実際に見学したい】\n' + (message || '');
      } else {
        fullMessage = '【その他の問い合わせ】\n' + message;
      }

      // 問い合わせ作成
      const result = await query(
        `INSERT INTO inquiries (
          property_id, individual_user_id, corporate_user_id,
          contact_name, contact_email, contact_phone, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          property_id,
          req.user.userId,
          corporate_user_id,
          name,
          email,
          phone || null,
          fullMessage,
          'unread',
        ]
      );

      res.status(201).json({
        success: true,
        data: {
          inquiry: result.rows[0],
        },
      });
    } catch (error) {
      console.error('Create inquiry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create inquiry',
        },
      });
    }
  },

  /**
   * 自分の問い合わせ一覧（個人ユーザー）
   * GET /api/inquiries
   */
  async getMyInquiries(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'individual') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Individual user only',
          },
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await query(
        `SELECT i.*,
                p.title as property_title,
                p.address as property_address,
                p.rent as property_rent,
                pref.name as prefecture_name
         FROM inquiries i
         JOIN properties p ON i.property_id = p.id
         LEFT JOIN prefectures pref ON p.prefecture_id = pref.id
         WHERE i.individual_user_id = $1
         ORDER BY i.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.userId, limit, offset]
      );

      const countResult = await query(
        'SELECT COUNT(*) FROM inquiries WHERE individual_user_id = $1',
        [req.user.userId]
      );

      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          inquiries: result.rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Get my inquiries error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get inquiries',
        },
      });
    }
  },

  /**
   * 問い合わせ詳細（個人ユーザー）
   * GET /api/inquiries/:id
   */
  async getInquiry(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'individual') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Individual user only',
          },
        });
      }

      const { id } = req.params;

      const result = await query(
        `SELECT i.*,
                p.title as property_title,
                p.address as property_address,
                p.rent as property_rent,
                p.management_fee as property_management_fee,
                pref.name as prefecture_name,
                cp.company_name,
                cp.phone as company_phone
         FROM inquiries i
         JOIN properties p ON i.property_id = p.id
         LEFT JOIN prefectures pref ON p.prefecture_id = pref.id
         LEFT JOIN corporate_profiles cp ON p.corporate_user_id = cp.user_id
         WHERE i.id = $1 AND i.individual_user_id = $2`,
        [id, req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Inquiry not found',
          },
        });
      }

      res.json({
        success: true,
        data: {
          inquiry: result.rows[0],
        },
      });
    } catch (error) {
      console.error('Get inquiry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get inquiry',
        },
      });
    }
  },

  /**
   * 受信した問い合わせ一覧（企業ユーザー）
   * GET /api/corporate/inquiries
   */
  async getCorporateInquiries(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'corporate') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Corporate user only',
          },
        });
      }

      const { page = 1, limit = 20, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let queryText = `
        SELECT i.*,
               p.title as property_title,
               p.address as property_address,
               pref.name as prefecture_name
        FROM inquiries i
        JOIN properties p ON i.property_id = p.id
        LEFT JOIN prefectures pref ON p.prefecture_id = pref.id
        WHERE p.corporate_user_id = $1
      `;

      const params: any[] = [req.user.userId];

      // ステータスフィルタ
      if (status) {
        params.push(status);
        queryText += ` AND i.status = $${params.length}`;
      }

      queryText += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // カウント
      let countQuery = `
        SELECT COUNT(*)
        FROM inquiries i
        JOIN properties p ON i.property_id = p.id
        WHERE p.corporate_user_id = $1
      `;
      const countParams: any[] = [req.user.userId];

      if (status) {
        countParams.push(status);
        countQuery += ` AND i.status = $${countParams.length}`;
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          inquiries: result.rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Get corporate inquiries error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get inquiries',
        },
      });
    }
  },

  /**
   * 問い合わせ詳細（企業ユーザー）
   * GET /api/corporate/inquiries/:id
   */
  async getCorporateInquiry(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'corporate') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Corporate user only',
          },
        });
      }

      const { id } = req.params;

      const result = await query(
        `SELECT i.*,
                p.id as property_id,
                p.title as property_title,
                p.address as property_address,
                p.rent as property_rent,
                p.management_fee as property_management_fee,
                p.floor_number,
                p.building_age,
                p.area,
                p.deposit,
                p.key_money,
                pref.id as prefecture_id,
                pref.name as prefecture_name,
                bt.id as building_type_id,
                bt.name as building_type_name,
                fpt.id as floor_plan_type_id,
                fpt.name as floor_plan_type_name
         FROM inquiries i
         JOIN properties p ON i.property_id = p.id
         LEFT JOIN prefectures pref ON p.prefecture_id = pref.id
         LEFT JOIN building_types bt ON p.building_type_id = bt.id
         LEFT JOIN floor_plan_types fpt ON p.floor_plan_type_id = fpt.id
         WHERE i.id = $1 AND p.corporate_user_id = $2`,
        [id, req.user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Inquiry not found',
          },
        });
      }

      const inquiryData = result.rows[0];

      // 物件情報を構造化
      const inquiry = {
        id: inquiryData.id,
        property_id: inquiryData.property_id,
        individual_user_id: inquiryData.individual_user_id,
        corporate_user_id: inquiryData.corporate_user_id,
        contact_name: inquiryData.contact_name,
        contact_email: inquiryData.contact_email,
        contact_phone: inquiryData.contact_phone,
        message: inquiryData.message,
        status: inquiryData.status,
        created_at: inquiryData.created_at,
        updated_at: inquiryData.updated_at,
        property: {
          id: inquiryData.property_id,
          title: inquiryData.property_title,
          address: inquiryData.property_address,
          rent: inquiryData.property_rent,
          management_fee: inquiryData.property_management_fee,
          floor_number: inquiryData.floor_number,
          building_age: inquiryData.building_age,
          area: inquiryData.area,
          deposit: inquiryData.deposit,
          key_money: inquiryData.key_money,
          prefecture: {
            id: inquiryData.prefecture_id,
            name: inquiryData.prefecture_name,
          },
          building_type: {
            id: inquiryData.building_type_id,
            name: inquiryData.building_type_name,
          },
          floor_plan_type: {
            id: inquiryData.floor_plan_type_id,
            name: inquiryData.floor_plan_type_name,
          },
        },
      };

      res.json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      console.error('Get corporate inquiry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get inquiry',
        },
      });
    }
  },

  /**
   * 問い合わせステータス更新（企業ユーザー）
   * PUT /api/corporate/inquiries/:id/status
   */
  async updateInquiryStatus(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'corporate') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Corporate user only',
          },
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      // バリデーション
      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'status is required',
          },
        });
      }

      if (!['unread', 'read', 'responded'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'status must be unread, read, or responded',
          },
        });
      }

      // 問い合わせの所有者確認
      const ownerCheck = await query(
        `SELECT i.id
         FROM inquiries i
         JOIN properties p ON i.property_id = p.id
         WHERE i.id = $1 AND p.corporate_user_id = $2`,
        [id, req.user.userId]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Inquiry not found',
          },
        });
      }

      // ステータス更新
      const result = await query(
        'UPDATE inquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      res.json({
        success: true,
        data: {
          inquiry: result.rows[0],
        },
      });
    } catch (error) {
      console.error('Update inquiry status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update inquiry status',
        },
      });
    }
  },
};
