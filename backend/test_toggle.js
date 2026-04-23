import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testToggle = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    let user = await User.findOne({ role: 'plumber' });
    if (!user) {
      console.log('No plumber found, testing with admin');
      user = await User.findOne();
    }
    if (!user) {
        console.log('No users at all');
        process.exit(1);
    }
    console.log(`Original status: ${user.isOnline}`);
    user.isOnline = !user.isOnline;
    await user.save();
    console.log(`New status: ${user.isOnline}`);
    process.exit();
  } catch (err) {
    console.error('Error saving user:', err);
    process.exit(1);
  }
};
testToggle();
