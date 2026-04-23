import User from '../models/User.js';
import Booking from '../models/Booking.js';

export const getStats = async (req, res) => {
  try {
    const customersCount = await User.countDocuments({ role: 'customer' });
    const plumbersCount = await User.countDocuments({ role: 'plumber' });
    const bookingsCount = await Booking.countDocuments();
    
    // Calculate total revenue (platform commission)
    const bookings = await Booking.find({ status: 'completed' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing.commission || 0), 0);

    res.json({
      customers: customersCount,
      plumbers: plumbersCount,
      bookings: bookingsCount,
      revenue: totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPlumbers = async (req, res) => {
  try {
    const plumbers = await User.find({ role: 'plumber' }).select('-password');
    res.json(plumbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveKyc = async (req, res) => {
  const { status, suspendDays } = req.body; 
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.kycStatus = status;
    
    if (status === 'suspended') {
      if (suspendDays === 'permanent') {
        user.suspendedUntil = null;
      } else if (typeof suspendDays === 'number') {
        user.suspendedUntil = new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000);
      }
    } else {
      user.suspendedUntil = null; // Clear if not suspended
    }

    await user.save();
    res.json({ message: `Plumber KYC ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const settlePayout = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'plumber') return res.status(404).json({ message: 'Plumber not found' });
    
    // In a real app, integrate with Stripe Payouts API here
    const amountSettled = user.walletBalance;
    user.walletBalance = 0;
    await user.save();
    
    res.json({ message: `Settled $${amountSettled} to ${user.name}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const broadcastGlobal = async (req, res) => {
  const { message, type } = req.body;
  try {
    req.io.to('global').emit('globalAnnouncement', { message, type: type || 'info', timestamp: Date.now() });
    res.json({ success: true, message: 'Broadcast sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlumber = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const plumber = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'plumber',
      kycStatus: 'approved',
    });

    res.status(201).json(plumber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBannedUsers = async (req, res) => {
  try {
    const banned = await User.find({
      $or: [
        { kycStatus: 'suspended' },
        { suspendedUntil: { $ne: null } }
      ]
    }).select('-password');
    res.json(banned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
