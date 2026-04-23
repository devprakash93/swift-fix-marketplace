import Booking from '../models/Booking.js';
import User from '../models/User.js';

// This would normally use stripe package
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  const { bookingId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Mock payment intent creation
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: booking.pricing.totalAmount * 100, // cents
    //   currency: 'usd',
    //   metadata: { bookingId }
    // });

    const mockPaymentIntent = {
      clientSecret: `mock_secret_${Date.now()}`,
      amount: booking.pricing.totalAmount
    };

    res.json(mockPaymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  const { bookingId, transactionId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.pricing.paymentStatus = 'paid';
    booking.pricing.transactionId = transactionId;
    await booking.save();

    // If paid, update status to searching if it was instant
    if (booking.schedule.bookingType === 'instant') {
      booking.status = 'searching';
      await booking.save();
    }

    res.json({ message: 'Payment confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    res.json({ balance: user.walletBalance || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
