import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'admin@flowfix.io' });
    console.log('User found:', user ? user.email : 'No user found');
    if (user) {
      console.log('Password hash:', user.password);
      const isMatch = await user.comparePassword('admin123');
      console.log('Password match:', isMatch);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkUser();
