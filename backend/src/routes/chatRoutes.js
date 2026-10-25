import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  markAsRead,
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.put('/conversations/:conversationId/read', markAsRead);

export default router;
