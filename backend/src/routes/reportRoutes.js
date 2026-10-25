import { Router } from 'express';
import { createReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', createReport);

export default router;
