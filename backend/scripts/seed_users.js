import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const users = [
  {
    name: 'FlowFix Admin',
    email: 'admin@flowfix.io',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Emma Watson',
    email: 'emma@mail.com',
    password: 'customer123',
    role: 'customer'
  },
  {
    name: 'Mike Reynolds',
    email: 'mike@flowfix.io',
    password: 'plumber123',
    role: 'plumber',
    isOnline: true,
    kycStatus: 'approved',
    location: {
      type: 'Point',
      coordinates: [-0.1276, 51.5074] // London
    }
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const u of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);

      // Upsert user: find by email, update password/role, or create new
      await User.findOneAndUpdate(
        { email: u.email },
        { 
          ...u, 
          password: hashedPassword 
        },
        { upsert: true, new: true }
      );
      console.log(`User ${u.email} seeded/reset.`);
    }

    console.log('Demo users are ready!');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedUsers();
