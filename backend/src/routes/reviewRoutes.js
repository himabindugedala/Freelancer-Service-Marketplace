import { Router } from 'express';
import { createReview, getFreelancerReviews } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createReviewSchema } from '../validators/index.js';

const router = Router();

router.post('/order/:orderId', requireAuth, validateBody(createReviewSchema), createReview);
router.get('/freelancer/:freelancerId', getFreelancerReviews);

export default router;
