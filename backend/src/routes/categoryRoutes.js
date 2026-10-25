import { Router } from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.get('/', getAllCategories);
router.post('/', requireAuth, requireRole('admin'), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
