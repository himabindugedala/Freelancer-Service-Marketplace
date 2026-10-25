import { Router } from 'express';
import {
  createDirectOrder,
  getOrderById,
  getMyOrders,
  submitDelivery,
  requestRevision,
  approveOrder,
  cancelOrder,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { deliverOrderSchema, revisionRequestSchema } from '../validators/index.js';

const router = Router();

router.post('/direct', requireAuth, createDirectOrder);
router.get('/my/orders', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);
router.post('/:id/deliver', requireAuth, validateBody(deliverOrderSchema), submitDelivery);
router.post('/:id/revision', requireAuth, validateBody(revisionRequestSchema), requestRevision);
router.post('/:id/approve', requireAuth, approveOrder);
router.post('/:id/cancel', requireAuth, cancelOrder);

export default router;
