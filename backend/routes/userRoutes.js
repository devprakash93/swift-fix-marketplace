import express from 'express';
import { toggleOnline, updateLocation, updateProfile, updatePassword, getOnlineProfessionals } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/online-pros', getOnlineProfessionals);
router.put('/online', protect, toggleOnline);
router.put('/location', protect, updateLocation);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;
