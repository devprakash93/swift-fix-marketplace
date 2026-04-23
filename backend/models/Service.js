import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  inclusions: [{ type: String }],
  addons: [{
    name: { type: String },
    price: { type: Number }
  }],
  imageUrl: { type: String },
  duration: { type: Number, default: 60 }, // Estimated duration in minutes
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Service', serviceSchema);
