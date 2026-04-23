import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { io } from '../server.js';

export const startBookingDispatcher = (bookingId) => {
  // Wait 60 seconds, if still searching, try to re-broadcast or alert
  setTimeout(async () => {
    try {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.status === 'searching') {
        console.log(`Auto-reassigning booking ${bookingId}...`);
        
        // Expand search radius to 20km for re-broadcast
        const expandedPros = await User.find({
          role: 'plumber',
          isOnline: true,
          kycStatus: 'approved',
          location: {
            $near: {
              $geometry: booking.location,
              $maxDistance: 20000 
            }
          }
        });

        if (expandedPros.length > 0) {
          expandedPros.forEach(pro => {
            io.to(pro._id.toString()).emit('newBookingRequest', booking);
          });
        } else {
          // No one found even after radius expansion
          booking.status = 'pending'; // Move to pending for manual admin intervention
          await booking.save();
          io.to(booking.customer.toString()).emit('bookingStatusUpdate', { 
            _id: bookingId, 
            status: 'pending',
            note: 'No professionals available nearby. We are still trying.' 
          });
        }
      }
    } catch (err) {
      console.error('Dispatcher error:', err);
    }
  }, 60000); // 60 seconds timeout
};
