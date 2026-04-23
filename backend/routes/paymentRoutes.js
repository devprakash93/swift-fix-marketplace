import express from 'express';
import { createPaymentIntent, confirmPayment, getWalletBalance } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/wallet', protect, getWalletBalance);

export default router;
