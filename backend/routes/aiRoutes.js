import express from 'express';
import { estimatePrice, detectIssue } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/estimate', protect, estimatePrice);
router.post('/detect', protect, detectIssue);

export default router;
