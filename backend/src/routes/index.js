import { Router } from 'express';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import freelancerRoutes from './freelancerRoutes.js';
import projectRoutes from './projectRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import chatRoutes from './chatRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import savedItemRoutes from './savedItemRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminRoutes from './adminRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/freelancers', freelancerRoutes);
router.use('/projects', projectRoutes);
router.use('/proposals', proposalRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/matching', matchingRoutes);
router.use('/saved-items', savedItemRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Freelance Service Marketplace API',
  });
});

export default router;
