import Booking from '../models/Booking.js';

export const getInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service customer professional', 'name email address');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const invoice = {
      invoiceNumber: `INV-${booking._id.toString().slice(-6).toUpperCase()}`,
      date: booking.createdAt,
      customer: {
        name: booking.customer.name,
        email: booking.customer.email,
        address: booking.address
      },
      professional: {
        name: booking.professional?.name || 'FlowFix Partner',
        email: booking.professional?.email || 'support@flowfix.io'
      },
      items: [
        { description: booking.service.name, amount: booking.pricing.basePrice },
        ...booking.pricing.addons.map(a => ({ description: a.name, amount: a.price }))
      ],
      subtotal: booking.pricing.totalAmount,
      tax: booking.pricing.totalAmount * 0.05, // 5% tax simulation
      total: booking.pricing.totalAmount * 1.05
    };

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
