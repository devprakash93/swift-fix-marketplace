import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plumber: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['General', 'Leaking', 'Installation', 'Drainage', 'Bathroom', 'Kitchen'], 
    default: 'General' 
  },
  basePrice: { type: Number, default: 50 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String },
  status: { 
    type: String, 
    enum: ['searching', 'assigned', 'enroute', 'arrived', 'in_progress', 'completed', 'cancelled'], 
    default: 'searching' 
  },
  imageUrl: { type: String },
  price: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

jobSchema.index({ location: '2dsphere' });

export default mongoose.model('Job', jobSchema);
