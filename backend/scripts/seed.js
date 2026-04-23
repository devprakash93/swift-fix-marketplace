import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users to avoid duplicates
    await User.deleteMany({});
    console.log('Cleared existing users.');

    const salt = await bcrypt.genSalt(10);

    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@flowfix.io',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin',
        kycStatus: 'approved'
      },
      {
        name: 'Emma Stone',
        email: 'emma@mail.com',
        password: await bcrypt.hash('customer123', salt),
        role: 'customer',
        location: {
          type: 'Point',
          coordinates: [-0.1276, 51.5074] // London
        }
      },
      {
        name: 'Mike Reynolds',
        email: 'mike@flowfix.io',
        password: await bcrypt.hash('plumber123', salt),
        role: 'plumber',
        isOnline: true,
        kycStatus: 'approved',
        location: {
          type: 'Point',
          coordinates: [-0.1280, 51.5080] // Near Emma
        }
      }
    ];

    await User.insertMany(demoUsers);
    console.log('Demo accounts created successfully!');
    
    console.log('\n--- DEMO CREDENTIALS ---');
    console.log('Admin:    admin@flowfix.io / admin123');
    console.log('Customer: emma@mail.com / customer123');
    console.log('Plumber:  mike@flowfix.io / plumber123');
    console.log('------------------------\n');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
