import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Category.deleteMany({});
    await Service.deleteMany({});

    // 1. Create Categories
    const categories = await Category.insertMany([
      { name: 'Plumbing', icon: 'Droplets', description: 'Leaks, pipes, tanks & more' },
      { name: 'Electrician', icon: 'PlugZap', description: 'Wiring, switches & appliances' },
      { name: 'Cleaning', icon: 'Bath', description: 'Deep home & office cleaning' },
      { name: 'Beauty', icon: 'Scissors', description: 'Salon & massage at home' },
    ]);

    console.log('Categories seeded');

    // 2. Create Services
    const plumbing = categories.find(c => c.name === 'Plumbing');
    const cleaning = categories.find(c => c.name === 'Cleaning');

    await Service.insertMany([
      {
        category: plumbing._id,
        name: 'Full Bathroom Leakage Repair',
        description: 'Fixes all visible and hidden leaks in the bathroom. Includes pressure testing.',
        basePrice: 50,
        inclusions: ['Pipe inspection', 'Grout repair', 'Teflon replacement'],
        addons: [
          { name: 'New Faucet Installation', price: 25 },
          { name: 'Flush Tank Repair', price: 15 }
        ]
      },
      {
        category: plumbing._id,
        name: 'Water Tank Cleaning',
        description: 'Professional cleaning of overhead and underground water tanks.',
        basePrice: 80,
        inclusions: ['Sludge removal', 'High pressure washing', 'UV disinfection']
      },
      {
        category: cleaning._id,
        name: 'Full Home Deep Cleaning',
        description: 'Everything from kitchen to balcony. Sanitization included.',
        basePrice: 120,
        inclusions: ['Floor scrubbing', 'Window cleaning', 'Kitchen degreasing'],
        addons: [
          { name: 'Sofa Shampooing', price: 40 },
          { name: 'Fridge Deep Clean', price: 20 }
        ]
      }
    ]);

    console.log('Services seeded');

    // 3. Update User roles if needed (ensure mike is a pro)
    await User.updateOne({ email: 'mike@flowfix.io' }, { role: 'plumber', kycStatus: 'approved', isOnline: true });

    console.log('Seed completed successfully');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
