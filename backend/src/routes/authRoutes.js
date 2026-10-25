import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/index.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, validateBody(updateProfileSchema), updateProfile);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
