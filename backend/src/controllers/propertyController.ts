import { Request, Response } from 'express';
import { propertyModel } from '../models/property';
import { PropertySearchParams } from '../types/property';

export const propertyController = {
  /**
   * 物件検索
   */
  async searchProperties(req: Request, res: Response) {
    try {
      // クエリパラメータをパース
      const params: PropertySearchParams = {
        prefecture_ids: req.query.prefecture_ids
          ? (req.query.prefecture_ids as string).split(',').map(Number)
          : undefined,
        railway_line_ids: req.query.railway_line_ids
          ? (req.query.railway_line_ids as string).split(',').map(Number)
          : undefined,
        station_ids: req.query.station_ids
          ? (req.query.station_ids as string).split(',').map(Number)
          : undefined,
        walking_minutes_max: req.query.walking_minutes_max
          ? parseInt(req.query.walking_minutes_max as string)
          : undefined,
        rent_min: req.query.rent_min
          ? parseInt(req.query.rent_min as string)
          : undefined,
        rent_max: req.query.rent_max
          ? parseInt(req.query.rent_max as string)
          : undefined,
        floor_plan_type_ids: req.query.floor_plan_type_ids
          ? (req.query.floor_plan_type_ids as string).split(',').map(Number)
          : undefined,
        building_type_ids: req.query.building_type_ids
          ? (req.query.building_type_ids as string).split(',').map(Number)
          : undefined,
        area_min: req.query.area_min
          ? parseFloat(req.query.area_min as string)
          : undefined,
        area_max: req.query.area_max
          ? parseFloat(req.query.area_max as string)
          : undefined,
        building_age_max: req.query.building_age_max
          ? parseInt(req.query.building_age_max as string)
          : undefined,
        feature_ids: req.query.feature_ids
          ? (req.query.feature_ids as string).split(',').map(Number)
          : undefined,
        keyword: req.query.keyword as string | undefined,
        sort_by: req.query.sort_by as PropertySearchParams['sort_by'],
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // バリデーション
      if (params.page && params.page < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Page must be >= 1',
          },
        });
      }

      if (params.limit && (params.limit < 1 || params.limit > 100)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Limit must be between 1 and 100',
          },
        });
      }

      const result = await propertyModel.searchProperties(params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to search properties',
        },
      });
    }
  },

  /**
   * 物件詳細取得
   */
  async getPropertyById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid property ID',
          },
        });
      }

      const property = await propertyModel.getPropertyById(id);

      if (!property) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      res.json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch property',
        },
      });
    }
  },
};
