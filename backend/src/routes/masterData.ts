import { Router } from 'express';
import { masterDataController } from '../controllers/masterDataController';

const router = Router();

router.get('/prefectures', masterDataController.getPrefectures);
router.get('/railway-lines', masterDataController.getRailwayLines);
router.get('/stations', masterDataController.getStations);
router.get('/floor-plans', masterDataController.getFloorPlanTypes);
router.get('/building-types', masterDataController.getBuildingTypes);
router.get('/features', masterDataController.getPropertyFeatures);

export default router;
