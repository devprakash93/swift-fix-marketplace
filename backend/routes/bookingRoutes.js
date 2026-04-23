import express from 'express';
import { createBooking, getBookingHistory, updateBookingStatus, getMessages, cancelBooking } from '../controllers/bookingController.js';
import { submitReview } from '../controllers/reviewController.js';
import { getInvoice } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { getActiveCoupons } from '../controllers/marketingController.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createBooking);
router.get('/:id/invoice', protect, getInvoice);
router.get('/history', protect, getBookingHistory);
router.get('/coupons', protect, getActiveCoupons);
router.put('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, authorize('customer'), cancelBooking);
router.post('/:bookingId/review', protect, authorize('customer'), submitReview);
router.get('/:id/messages', protect, getMessages);

export default router;
