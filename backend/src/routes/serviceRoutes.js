import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
} from '../controllers/serviceController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { createServiceSchema } from '../validators/index.js';

const router = Router();

router.get('/', getServices);
router.get('/my/services', requireAuth, requireRole('freelancer', 'admin'), getMyServices);
router.get('/:id', getServiceById);
router.post('/', requireAuth, requireRole('freelancer', 'admin'), validateBody(createServiceSchema), createService);
router.put('/:id', requireAuth, updateService);
router.delete('/:id', requireAuth, deleteService);

export default router;
