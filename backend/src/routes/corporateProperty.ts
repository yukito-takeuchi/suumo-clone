import { Router } from 'express';
import { corporatePropertyController } from '../controllers/corporatePropertyController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// 全エンドポイントで企業ユーザー認証が必須
const corporateOnly = [requireAuth, requireRole(['corporate'])];

// 物件CRUD
router.post('/corporate/properties', corporateOnly, corporatePropertyController.createProperty);
router.get('/corporate/properties', corporateOnly, corporatePropertyController.getMyProperties);
router.get('/corporate/properties/:id', corporateOnly, corporatePropertyController.getProperty);
router.put('/corporate/properties/:id', corporateOnly, corporatePropertyController.updateProperty);
router.delete('/corporate/properties/:id', corporateOnly, corporatePropertyController.deleteProperty);

// 画像管理
router.post('/corporate/properties/:id/images', corporateOnly, corporatePropertyController.addImages);
router.delete('/corporate/properties/:id/images/:imageId', corporateOnly, corporatePropertyController.deleteImage);
router.put('/corporate/properties/:id/images/order', corporateOnly, corporatePropertyController.updateImageOrder);

export default router;
