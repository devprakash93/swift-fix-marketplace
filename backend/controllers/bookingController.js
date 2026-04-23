import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Availability from '../models/Availability.js';
import Message from '../models/Message.js';
import { startBookingDispatcher } from '../utils/bookingService.js';
import { Coupon } from '../models/Marketing.js';

export const createBooking = async (req, res) => {
  const { serviceId, description, address, location, schedule, addons, paymentMethod, couponCode } = req.body;
  
  try {
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Calculate pricing
    let totalAmount = service.basePrice;
    const selectedAddons = [];
    if (addons && addons.length > 0) {
      addons.forEach(addonId => {
        const addon = service.addons.find(a => a._id.toString() === addonId);
        if (addon) {
          totalAmount += addon.price;
          selectedAddons.push({ name: addon.name, price: addon.price });
        }
      });
    }

    // Apply Coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date(coupon.expiryDate) > new Date() && coupon.usedCount < coupon.usageLimit) {
        if (totalAmount >= (coupon.minOrderValue || 0)) {
          discount = (totalAmount * coupon.discountPercent) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
          totalAmount -= discount;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const booking = await Booking.create({
      customer: req.user._id,
      service: serviceId,
      category: service.category,
      description,
      address,
      location,
      schedule,
      pricing: {
        basePrice: service.basePrice,
        addons: selectedAddons,
        totalAmount,
        discount,
        commission: totalAmount * 0.15, // 15% platform fee
        paymentMethod
      },
      status: schedule.bookingType === 'instant' ? 'searching' : 'pending'
    });

    if (schedule.bookingType === 'instant') {
      // Smart Dispatch Heuristic:
      // Uses $geoNear to calculate exact distance, then adds a 'dispatchScore'.
      // Score = (Rating * 20) - (Distance_in_meters / 100)
      const nearbyProfessionals = await User.aggregate([
        {
          $geoNear: {
            near: location,
            distanceField: "dist.calculated",
            maxDistance: 10000,
            query: { role: 'plumber', isOnline: true, kycStatus: 'approved' },
            spherical: true
          }
        },
        {
          $addFields: {
            dispatchScore: {
              $subtract: [
                { $multiply: [{ $ifNull: ["$rating", 4.5] }, 20] },
                { $divide: ["$dist.calculated", 100] }
              ]
            }
          }
        },
        { $sort: { dispatchScore: -1 } },
        { $limit: 10 }
      ]);

      // Broadcast to professionals
      nearbyProfessionals.forEach(pro => {
        req.io.to(pro._id.toString()).emit('newBookingRequest', booking);
      });

      // Start the auto-reassign timer
      startBookingDispatcher(booking._id);
    }
    
    // Notify admin dashboard
    req.io.to('admin').emit('adminNewBooking', booking);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query = { customer: req.user._id };
    } else if (req.user.role === 'plumber') {
      query = { professional: req.user._id };
    }
    const bookings = await Booking.find(query)
      .populate('service category')
      .populate('customer professional', 'name email rating')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { status, note } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    if (status === 'assigned') {
      booking.professional = req.user._id;
    }

    // Wallet Payout on Completion
    if (status === 'completed' && booking.pricing) {
      const payoutAmount = booking.pricing.totalAmount - (booking.pricing.commission || 0);
      const professional = await User.findById(booking.professional);
      if (professional) {
        professional.walletBalance = (professional.walletBalance || 0) + payoutAmount;
        await professional.save();
      }
    }

    booking.history.push({ status, note });
    booking.updatedAt = Date.now();
    await booking.save();

    // Re-populate for the response and emission
    await booking.populate('service customer professional');

    // Notify customer
    req.io.to(booking.customer._id.toString()).emit('bookingStatusUpdate', booking);
    // Notify admin
    req.io.to('admin').emit('bookingStatusUpdate', booking);

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ job: req.params.id }).populate('sender', 'name role avatar');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if professional is already assigned
    if (booking.professional || !['pending', 'searching'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel an accepted booking. Please contact support.' });
    }

    booking.status = 'cancelled';
    booking.history.push({ status: 'cancelled', note: 'Cancelled by customer' });
    booking.updatedAt = Date.now();
    await booking.save();

    // Notify professional if it was in 'searching' status (optional, since it's broadcasted)
    // But mainly we just update the status so it disappears from pro leads
    req.io.emit('bookingCancelled', booking._id);

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
