import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const submitReview = async (req, res) => {
  const { rating, comment, criteria } = req.body;
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ message: 'Only completed jobs can be reviewed' });

    booking.review = { rating, comment, criteria };
    await booking.save();

    // Update Professional average rating
    const pro = await User.findById(booking.professional);
    if (pro) {
      // Simple moving average simulation
      const currentRating = pro.rating || 0;
      const totalJobs = await Booking.countDocuments({ professional: pro._id, 'review.rating': { $exists: true } });
      pro.rating = ((currentRating * (totalJobs - 1)) + rating) / totalJobs;
      await pro.save();
    }

    res.json({ message: 'Review submitted successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
