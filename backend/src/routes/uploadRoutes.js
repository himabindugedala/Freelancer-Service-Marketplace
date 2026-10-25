import { Router } from 'express';
import { uploadSingleFile, uploadMultipleFiles } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.post('/single', upload.single('file'), uploadSingleFile);
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);

export default router;
