import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  professional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slots: [{
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    times: [{
      time: { type: String, required: true }, // Format: HH:mm
      isBooked: { type: Boolean, default: false },
      booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Availability', availabilitySchema);
