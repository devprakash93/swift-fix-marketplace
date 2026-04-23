import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  professional: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  
  description: { type: String },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },

  schedule: {
    bookingType: { type: String, enum: ['instant', 'scheduled'], default: 'instant' },
    dateTime: { type: Date, default: Date.now }
  },

  pricing: {
    basePrice: { type: Number, required: true },
    addons: [{
      name: String,
      price: Number
    }],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    commission: { type: Number, default: 0 }, // Platform fee
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'stripe', 'wallet'], default: 'stripe' },
    transactionId: { type: String }
  },

  status: {
    type: String,
    enum: ['pending', 'searching', 'assigned', 'enroute', 'arrived', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },

  history: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],

  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    criteria: {
      quality: Number,
      punctuality: Number,
      behavior: Number
    }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.index({ location: '2dsphere' });

export default mongoose.model('Booking', bookingSchema);
