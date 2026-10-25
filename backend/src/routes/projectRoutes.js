import { Router } from 'express';
import {
  getOpenProjects,
  getProjectById,
  createProject,
  getClientProjects,
  updateProject,
  closeProject,
} from '../controllers/projectController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { createProjectSchema } from '../validators/index.js';

const router = Router();

router.get('/', getOpenProjects);
router.get('/my/projects', requireAuth, requireRole('client', 'admin'), getClientProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', requireAuth, requireRole('client', 'admin'), validateBody(createProjectSchema), createProject);
router.put('/:id', requireAuth, updateProject);
router.patch('/:id/close', requireAuth, closeProject);

export default router;
