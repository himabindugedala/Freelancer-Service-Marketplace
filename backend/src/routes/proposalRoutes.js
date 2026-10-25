import { Router } from 'express';
import {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  acceptProposal,
  withdrawProposal,
} from '../controllers/proposalController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../middleware/validate.js';
import { createProposalSchema } from '../validators/index.js';

const router = Router();

router.get('/my/proposals', requireAuth, requireRole('freelancer', 'admin'), getMyProposals);
router.get('/project/:projectId', requireAuth, getProjectProposals);
router.post(
  '/project/:projectId',
  requireAuth,
  requireRole('freelancer', 'admin'),
  validateBody(createProposalSchema),
  submitProposal
);
router.post('/:proposalId/accept', requireAuth, requireRole('client', 'admin'), acceptProposal);
router.post('/:proposalId/withdraw', requireAuth, withdrawProposal);

export default router;
