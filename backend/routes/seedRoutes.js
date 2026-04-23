import express from 'express';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';

const router = express.Router();

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
    name: 'Mike Reynolds',
    email: 'mike@flowfix.io',
    password: 'plumber123',
    role: 'plumber',
    isOnline: true,
    kycStatus: 'approved',
    rating: 4.9,
    numRatings: 120,
    walletBalance: 2500,
    location: { type: 'Point', coordinates: [-0.1276, 51.5074] },
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
    category: catMap['Electrician'],
    name: 'Fault Finding & Repair',
    description: 'Diagnose and fix electrical faults, tripping breakers, or dead outlets.',
    basePrice: 95,
    inclusions: ['Circuit testing', 'Fault diagnosis', 'Minor repairs'],
    addons: [{ name: 'New Circuit Breaker', price: 45 }],
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600',
    duration: 60
  }
];

router.get('/run', async (req, res) => {
  try {
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      return res.json({ message: 'Already seeded!' });
    }

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) await User.create(u);
    }

    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });

    await Service.insertMany(getServicesData(catMap));

    res.json({ message: 'Live database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
