import { Router } from 'express';
import { toggleSaveItem, getSavedItems } from '../controllers/savedItemController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/toggle', toggleSaveItem);
router.get('/', getSavedItems);

export default router;
