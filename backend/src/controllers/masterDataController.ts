import { Request, Response } from 'express';
import { masterDataModel } from '../models/masterData';

export const masterDataController = {
  // 都道府県一覧
  async getPrefectures(req: Request, res: Response) {
    try {
      const prefectures = await masterDataModel.getPrefectures();
      res.json({
        success: true,
        data: prefectures,
      });
    } catch (error) {
      console.error('Error fetching prefectures:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch prefectures',
        },
      });
    }
  },

  // 沿線一覧
  async getRailwayLines(req: Request, res: Response) {
    try {
      const prefectureId = req.query.prefecture_id
        ? parseInt(req.query.prefecture_id as string)
        : undefined;

      const railwayLines = await masterDataModel.getRailwayLines(prefectureId);
      res.json({
        success: true,
        data: railwayLines,
      });
    } catch (error) {
      console.error('Error fetching railway lines:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch railway lines',
        },
      });
    }
  },

  // 駅一覧
  async getStations(req: Request, res: Response) {
    try {
      const railwayLineId = req.query.railway_line_id
        ? parseInt(req.query.railway_line_id as string)
        : undefined;

      const stations = await masterDataModel.getStations(railwayLineId);
      res.json({
        success: true,
        data: stations,
      });
    } catch (error) {
      console.error('Error fetching stations:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch stations',
        },
      });
    }
  },

  // 間取りタイプ一覧
  async getFloorPlanTypes(req: Request, res: Response) {
    try {
      const floorPlanTypes = await masterDataModel.getFloorPlanTypes();
      res.json({
        success: true,
        data: floorPlanTypes,
      });
    } catch (error) {
      console.error('Error fetching floor plan types:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch floor plan types',
        },
      });
    }
  },

  // 建物種類一覧
  async getBuildingTypes(req: Request, res: Response) {
    try {
      const buildingTypes = await masterDataModel.getBuildingTypes();
      res.json({
        success: true,
        data: buildingTypes,
      });
    } catch (error) {
      console.error('Error fetching building types:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch building types',
        },
      });
    }
  },

  // こだわり条件一覧
  async getPropertyFeatures(req: Request, res: Response) {
    try {
      const features = await masterDataModel.getPropertyFeatures();
      res.json({
        success: true,
        data: features,
      });
    } catch (error) {
      console.error('Error fetching property features:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch property features',
        },
      });
    }
  },
};
