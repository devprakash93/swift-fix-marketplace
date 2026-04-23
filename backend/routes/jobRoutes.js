import express from 'express';
import { createJob, acceptJob, updateStatus, getJobHistory, cancelJob } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';
import Message from '../models/Message.js';

const router = express.Router();

router.post('/', protect, authorize('customer'), createJob);
router.get('/history', protect, getJobHistory);
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ job: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/:id/accept', protect, authorize('plumber'), acceptJob);
router.put('/:id/status', protect, authorize('plumber', 'admin'), updateStatus);
router.delete('/:id', protect, authorize('customer'), cancelJob);

export default router;
