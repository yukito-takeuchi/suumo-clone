import { Request, Response } from 'express';
import { query } from '../config/database';
import pool from '../config/database';
import { saveBase64Image, deleteImage } from '../utils/imageUpload';

export const corporatePropertyController = {
  /**
   * 物件登録
   * POST /api/corporate/properties
   */
  async createProperty(req: Request, res: Response) {
    const client = await pool.connect();
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

      const {
        title,
        prefecture_id,
        address,
        floor_plan_type_id,
        building_type_id,
        rent,
        management_fee,
        deposit,
        key_money,
        area,
        building_age,
        floor_number,
        stations,
        feature_ids,
        is_published,
        description,
        images,
      } = req.body;

      // バリデーション
      if (!title || !prefecture_id || !address || !floor_plan_type_id || !building_type_id ||
          rent == null || management_fee == null || deposit == null || key_money == null ||
          area == null || building_age == null || floor_number == null) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Required fields are missing',
          },
        });
      }

      if (stations && stations.length > 3) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Maximum 3 stations allowed',
          },
        });
      }

      await client.query('BEGIN');

      // 物件作成
      const propertyResult = await client.query(
        `INSERT INTO properties (
          corporate_user_id, title, prefecture_id, address, floor_plan_type_id,
          building_type_id, rent, management_fee, deposit, key_money,
          area, building_age, floor_number, is_published, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          req.user.userId, title, prefecture_id, address, floor_plan_type_id,
          building_type_id, rent, management_fee, deposit, key_money,
          area, building_age, floor_number, is_published ?? false, description || null,
        ]
      );

      const property = propertyResult.rows[0];

      // 駅情報を登録
      if (stations && stations.length > 0) {
        for (const station of stations) {
          await client.query(
            `INSERT INTO property_stations (property_id, station_id, walking_minutes, display_order)
             VALUES ($1, $2, $3, $4)`,
            [property.id, station.station_id, station.walking_minutes, station.order]
          );
        }
      }

      // こだわり条件を登録
      if (feature_ids && feature_ids.length > 0) {
        for (const featureId of feature_ids) {
          await client.query(
            `INSERT INTO property_property_features (property_id, feature_id)
             VALUES ($1, $2)`,
            [property.id, featureId]
          );
        }
      }

      // 画像を登録
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          // Save base64 image to file and get URL
          const imageUrl = saveBase64Image(images[i]);
          await client.query(
            `INSERT INTO property_images (property_id, image_url, display_order)
             VALUES ($1, $2, $3)`,
            [property.id, imageUrl, i + 1]
          );
        }
      }

      await client.query('COMMIT');

      // 作成した物件の詳細を取得
      const createdProperty = await getPropertyDetail(property.id);

      res.status(201).json({
        success: true,
        data: {
          property: createdProperty,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create property',
        },
      });
    } finally {
      client.release();
    }
  },

  /**
   * 自社物件一覧取得
   * GET /api/corporate/properties
   */
  async getMyProperties(req: Request, res: Response) {
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

      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await query(
        `SELECT p.*,
                pref.name as prefecture_name,
                fp.name as floor_plan_name,
                bt.name as building_type_name
         FROM properties p
         LEFT JOIN prefectures pref ON p.prefecture_id = pref.id
         LEFT JOIN floor_plan_types fp ON p.floor_plan_type_id = fp.id
         LEFT JOIN building_types bt ON p.building_type_id = bt.id
         WHERE p.corporate_user_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.userId, limit, offset]
      );

      const countResult = await query(
        'SELECT COUNT(*) FROM properties WHERE corporate_user_id = $1',
        [req.user.userId]
      );

      const total = parseInt(countResult.rows[0].count);

      // Get property IDs
      const propertyIds = result.rows.map((p: any) => p.id);

      // Fetch images for all properties
      let images: any[] = [];
      if (propertyIds.length > 0) {
        const imagesResult = await query(
          `SELECT property_id, id, image_url, display_order
           FROM property_images
           WHERE property_id = ANY($1)
           ORDER BY property_id, display_order`,
          [propertyIds]
        );
        images = imagesResult.rows;
      }

      // Attach images to properties
      const propertiesWithImages = result.rows.map((property: any) => ({
        ...property,
        images: images.filter((img: any) => img.property_id === property.id),
      }));

      res.json({
        success: true,
        data: {
          properties: propertiesWithImages,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Get my properties error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get properties',
        },
      });
    }
  },

  /**
   * 物件詳細取得
   * GET /api/corporate/properties/:id
   */
  async getProperty(req: Request, res: Response) {
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

      // 物件の所有者確認
      const ownerCheck = await query(
        'SELECT corporate_user_id FROM properties WHERE id = $1',
        [id]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      if (ownerCheck.rows[0].corporate_user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only access your own properties',
          },
        });
      }

      const property = await getPropertyDetail(Number(id));

      res.json({
        success: true,
        data: {
          property,
        },
      });
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get property',
        },
      });
    }
  },

  /**
   * 物件更新
   * PUT /api/corporate/properties/:id
   */
  async updateProperty(req: Request, res: Response) {
    const client = await pool.connect();
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

      // 物件の所有者確認
      const ownerCheck = await client.query(
        'SELECT corporate_user_id FROM properties WHERE id = $1',
        [id]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      if (ownerCheck.rows[0].corporate_user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own properties',
          },
        });
      }

      const {
        title,
        prefecture_id,
        address,
        floor_plan_type_id,
        building_type_id,
        rent,
        management_fee,
        deposit,
        key_money,
        area,
        building_age,
        floor_number,
        stations,
        feature_ids,
        is_published,
        description,
        images,
      } = req.body;

      if (stations && stations.length > 3) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Maximum 3 stations allowed',
          },
        });
      }

      await client.query('BEGIN');

      // 物件情報更新
      await client.query(
        `UPDATE properties SET
          title = $1, prefecture_id = $2, address = $3, floor_plan_type_id = $4,
          building_type_id = $5, rent = $6, management_fee = $7, deposit = $8,
          key_money = $9, area = $10, building_age = $11, floor_number = $12,
          is_published = $13, description = $14, updated_at = CURRENT_TIMESTAMP
         WHERE id = $15`,
        [
          title, prefecture_id, address, floor_plan_type_id, building_type_id,
          rent, management_fee, deposit, key_money, area, building_age, floor_number,
          is_published, description || null, id,
        ]
      );

      // 駅情報を更新（既存削除→新規追加）
      if (stations !== undefined) {
        await client.query('DELETE FROM property_stations WHERE property_id = $1', [id]);
        if (stations.length > 0) {
          for (const station of stations) {
            await client.query(
              `INSERT INTO property_stations (property_id, station_id, walking_minutes, display_order)
               VALUES ($1, $2, $3, $4)`,
              [id, station.station_id, station.walking_minutes, station.order]
            );
          }
        }
      }

      // こだわり条件を更新（既存削除→新規追加）
      if (feature_ids !== undefined) {
        await client.query('DELETE FROM property_property_features WHERE property_id = $1', [id]);
        if (feature_ids.length > 0) {
          for (const featureId of feature_ids) {
            await client.query(
              `INSERT INTO property_property_features (property_id, feature_id)
               VALUES ($1, $2)`,
              [id, featureId]
            );
          }
        }
      }

      // 画像を更新（既存削除→新規追加）
      if (images !== undefined) {
        // Get existing images
        const existingImages = await client.query(
          'SELECT image_url FROM property_images WHERE property_id = $1',
          [id]
        );

        // Determine which images to delete (images not in the new list)
        const newImageUrls = new Set(images.filter((img: string) => img.startsWith('/uploads/')));
        const imagesToDelete = existingImages.rows.filter((row: any) => !newImageUrls.has(row.image_url));

        // Delete removed image files
        imagesToDelete.forEach((row: any) => {
          deleteImage(row.image_url);
        });

        // Delete existing image records
        await client.query('DELETE FROM property_images WHERE property_id = $1', [id]);

        // Insert images (existing URLs + new base64 images)
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            // Save base64 image to file and get URL (or return existing URL as-is)
            const imageUrl = saveBase64Image(images[i]);
            await client.query(
              `INSERT INTO property_images (property_id, image_url, display_order)
               VALUES ($1, $2, $3)`,
              [id, imageUrl, i + 1]
            );
          }
        }
      }

      await client.query('COMMIT');

      const updatedProperty = await getPropertyDetail(Number(id));

      res.json({
        success: true,
        data: {
          property: updatedProperty,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update property error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update property',
        },
      });
    } finally {
      client.release();
    }
  },

  /**
   * 物件削除
   * DELETE /api/corporate/properties/:id
   */
  async deleteProperty(req: Request, res: Response) {
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

      // 物件の所有者確認
      const ownerCheck = await query(
        'SELECT corporate_user_id FROM properties WHERE id = $1',
        [id]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      if (ownerCheck.rows[0].corporate_user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only delete your own properties',
          },
        });
      }

      // 物件削除（CASCADE で関連データも削除される）
      await query('DELETE FROM properties WHERE id = $1', [id]);

      res.json({
        success: true,
        data: {
          message: 'Property deleted successfully',
        },
      });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete property',
        },
      });
    }
  },

  /**
   * 画像URL追加
   * POST /api/corporate/properties/:id/images
   */
  async addImages(req: Request, res: Response) {
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
      const { images } = req.body; // [{ url: string, display_order: number }]

      // 物件の所有者確認
      const ownerCheck = await query(
        'SELECT corporate_user_id FROM properties WHERE id = $1',
        [id]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      if (ownerCheck.rows[0].corporate_user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only modify your own properties',
          },
        });
      }

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Images array is required',
          },
        });
      }

      // 画像追加
      const addedImages = [];
      for (const image of images) {
        const result = await query(
          `INSERT INTO property_images (property_id, image_url, display_order)
           VALUES ($1, $2, $3) RETURNING *`,
          [id, image.url, image.display_order]
        );
        addedImages.push(result.rows[0]);
      }

      res.status(201).json({
        success: true,
        data: {
          images: addedImages,
        },
      });
    } catch (error) {
      console.error('Add images error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to add images',
        },
      });
    }
  },

  /**
   * 画像削除
   * DELETE /api/corporate/properties/:id/images/:imageId
   */
  async deleteImage(req: Request, res: Response) {
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

      const { id, imageId } = req.params;

      // 物件の所有者確認
      const ownerCheck = await query(
        'SELECT corporate_user_id FROM properties WHERE id = $1',
        [id]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      if (ownerCheck.rows[0].corporate_user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only modify your own properties',
          },
        });
      }

      // 画像削除
      const result = await query(
        'DELETE FROM property_images WHERE id = $1 AND property_id = $2 RETURNING *',
        [imageId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Image not found',
          },
        });
      }

      res.json({
        success: true,
        data: {
          message: 'Image deleted successfully',
        },
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to delete image',
        },
      });
    }
  },

  /**
   * 画像順序変更
   * PUT /api/corporate/properties/:id/images/order
   */
  async updateImageOrder(req: Request, res: Response) {
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
      const { imageOrders } = req.body; // [{ id: number, display_order: number }]

      // 物件の所有者確認
      const ownerCheck = await query(
        'SELECT corporate_user_id FROM properties WHERE id = $1',
        [id]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      if (ownerCheck.rows[0].corporate_user_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only modify your own properties',
          },
        });
      }

      if (!imageOrders || !Array.isArray(imageOrders)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'imageOrders array is required',
          },
        });
      }

      // 画像順序更新
      for (const order of imageOrders) {
        await query(
          'UPDATE property_images SET display_order = $1 WHERE id = $2 AND property_id = $3',
          [order.display_order, order.id, id]
        );
      }

      res.json({
        success: true,
        data: {
          message: 'Image order updated successfully',
        },
      });
    } catch (error) {
      console.error('Update image order error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update image order',
        },
      });
    }
  },
};

/**
 * 物件詳細取得ヘルパー関数
 */
async function getPropertyDetail(propertyId: number) {
  // 基本情報取得
  const propertyResult = await query(
    `SELECT p.*,
            pref.name as prefecture_name,
            fp.name as floor_plan_name,
            bt.name as building_type_name
     FROM properties p
     LEFT JOIN prefectures pref ON p.prefecture_id = pref.id
     LEFT JOIN floor_plan_types fp ON p.floor_plan_type_id = fp.id
     LEFT JOIN building_types bt ON p.building_type_id = bt.id
     WHERE p.id = $1`,
    [propertyId]
  );

  const property = propertyResult.rows[0];

  // 駅情報取得
  const stationsResult = await query(
    `SELECT ps.*, s.name as station_name, rl.name as railway_line_name
     FROM property_stations ps
     JOIN stations s ON ps.station_id = s.id
     JOIN railway_lines rl ON s.railway_line_id = rl.id
     WHERE ps.property_id = $1
     ORDER BY ps.display_order`,
    [propertyId]
  );

  // 画像取得
  const imagesResult = await query(
    'SELECT * FROM property_images WHERE property_id = $1 ORDER BY display_order',
    [propertyId]
  );

  // こだわり条件取得
  const featuresResult = await query(
    `SELECT pf.*
     FROM property_features pf
     JOIN property_property_features ppf ON pf.id = ppf.feature_id
     WHERE ppf.property_id = $1`,
    [propertyId]
  );

  return {
    ...property,
    stations: stationsResult.rows,
    images: imagesResult.rows,
    features: featuresResult.rows,
  };
}
