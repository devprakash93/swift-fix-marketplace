import express from 'express';
import { getStats, getAllUsers, getAllPlumbers, approveKyc, settlePayout, broadcastGlobal, createPlumber, getBannedUsers } from '../controllers/adminController.js';
import { createCategory, createService } from '../controllers/serviceController.js';
import { createCoupon, getCoupons, toggleCouponStatus } from '../controllers/marketingController.js';
import { protect, authorize } from '../middleware/auth.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';

const router = express.Router();

// All admin routes must be protected and restricted to admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/plumbers', getAllPlumbers);
router.put('/kyc/:id', approveKyc);
router.put('/payouts/:id', settlePayout);
router.post('/broadcast', broadcastGlobal);
router.post('/plumbers', createPlumber);
router.get('/banned', getBannedUsers);

// Catalog
router.post('/categories', createCategory);
router.delete('/categories/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
router.post('/services', createService);
router.delete('/services/:id', async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Marketing
router.post('/coupons', createCoupon);
router.get('/coupons', getCoupons);
router.put('/coupons/:id/toggle', toggleCouponStatus);

export default router;
