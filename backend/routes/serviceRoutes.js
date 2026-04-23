import express from 'express';
import { getCategories, getServicesByCategory, getServiceDetails, createCategory, createService } from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/categories/:categoryId/services', getServicesByCategory);
router.get('/:id', getServiceDetails);

// Admin only
router.post('/categories', protect, authorize('admin'), createCategory);
router.post('/', protect, authorize('admin'), createService);

export default router;
