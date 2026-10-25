import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  getAdminServices,
  getAdminReports,
  updateReportStatus,
  triggerSeed,
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/services', getAdminServices);
router.get('/reports', getAdminReports);
router.patch('/reports/:id', updateReportStatus);
router.post('/seed', triggerSeed);

export default router;

