import { Router } from 'express';
import { getMatchesForProject, previewMatchesForDraft } from '../controllers/matchingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/project/:projectId', requireAuth, getMatchesForProject);
router.post('/preview', requireAuth, previewMatchesForDraft);

export default router;
