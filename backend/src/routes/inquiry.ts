import { Router } from 'express';
import { inquiryController } from '../controllers/inquiryController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// 個人ユーザー向け
const individualOnly = [requireAuth, requireRole(['individual'])];

router.post('/inquiries', individualOnly, inquiryController.createInquiry);
router.get('/inquiries', individualOnly, inquiryController.getMyInquiries);
router.get('/inquiries/:id', individualOnly, inquiryController.getInquiry);

// 企業ユーザー向け
const corporateOnly = [requireAuth, requireRole(['corporate'])];

router.get('/corporate/inquiries', corporateOnly, inquiryController.getCorporateInquiries);
router.get('/corporate/inquiries/:id', corporateOnly, inquiryController.getCorporateInquiry);
router.put('/corporate/inquiries/:id/status', corporateOnly, inquiryController.updateInquiryStatus);

export default router;
