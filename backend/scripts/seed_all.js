import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';

dotenv.config();

const users = [
  {
    name: 'Admin FlowFix',
    email: 'admin@flowfix.io',
    password: 'admin123',
    role: 'admin',
    walletBalance: 10000,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    name: 'Emma Watson',
    email: 'emma@mail.com',
    password: 'customer123',
    role: 'customer',
    walletBalance: 500,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
  },
  {
    name: 'Mike Reynolds',
    email: 'mike@flowfix.io',
    password: 'plumber123',
    role: 'plumber',
    isOnline: true,
    kycStatus: 'approved',
    rating: 4.9,
    numRatings: 120,
    walletBalance: 2500,
    location: {
      type: 'Point',
      coordinates: [-0.1276, 51.5074]
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
  }
];

const categories = [
  { name: 'Plumbing', icon: 'Droplets', description: 'Leaks, pipes & more', isActive: true },
  { name: 'Electrician', icon: 'PlugZap', description: 'Wiring & fixtures', isActive: true },
  { name: 'Cleaning', icon: 'Bath', description: 'Deep home cleaning', isActive: true },
  { name: 'Beauty', icon: 'Scissors', description: 'Salon at home', isActive: true }
];

const getServicesData = (catMap) => [
  {
    category: catMap['Plumbing'],
    name: 'Fix Burst Pipe',
    description: 'Emergency repair for burst or heavily leaking pipes to prevent water damage.',
    basePrice: 120,
    inclusions: ['Leak detection', 'Pipe replacement (up to 1m)', 'Water testing'],
    addons: [{ name: 'Premium Copper Pipe', price: 40 }, { name: 'Debris Cleanup', price: 25 }],
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57cbceb42?auto=format&fit=crop&q=80&w=600',
    duration: 90
  },
  {
    category: catMap['Plumbing'],
    name: 'Drain Unblocking',
    description: 'High-pressure water jetting to clear stubborn drain blockages.',
    basePrice: 80,
    inclusions: ['Camera inspection', 'High-pressure jetting', 'Odour removal'],
    addons: [{ name: 'Chemical Treatment', price: 15 }],
    imageUrl: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&q=80&w=600',
    duration: 60
  },
  {
    category: catMap['Electrician'],
    name: 'Fault Finding & Repair',
    description: 'Diagnose and fix electrical faults, tripping breakers, or dead outlets.',
    basePrice: 95,
    inclusions: ['Circuit testing', 'Fault diagnosis', 'Minor repairs'],
    addons: [{ name: 'New Circuit Breaker', price: 45 }],
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600',
    duration: 60
  },
  {
    category: catMap['Cleaning'],
    name: 'Deep Home Cleaning',
    description: 'Comprehensive top-to-bottom cleaning of your entire home.',
    basePrice: 150,
    inclusions: ['Dusting & vacuuming', 'Bathroom sanitization', 'Kitchen deep clean'],
    addons: [{ name: 'Oven Cleaning', price: 30 }, { name: 'Window Cleaning (Inside)', price: 40 }],
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    duration: 240
  },
  {
    category: catMap['Beauty'],
    name: 'Premium Haircut & Styling',
    description: 'Professional salon experience in the comfort of your home.',
    basePrice: 65,
    inclusions: ['Consultation', 'Haircut', 'Blow dry & styling'],
    addons: [{ name: 'Deep Conditioning Treatment', price: 20 }],
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
    duration: 60
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Service.deleteMany({});

    console.log('Seeding users...');
    for (const u of users) {
      await User.create(u);
    }

    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });

    console.log('Seeding services...');
    await Service.insertMany(getServicesData(catMap));

    console.log('Demo database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
