import { Router } from 'express';
import { propertyController } from '../controllers/propertyController';

const router = Router();

router.get('/properties', propertyController.searchProperties);
router.get('/properties/:id', propertyController.getPropertyById);

export default router;
