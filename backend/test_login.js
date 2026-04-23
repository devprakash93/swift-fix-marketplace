import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'admin@flowfix.io';
    const pass = 'admin123';
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
    } else {
      const isMatch = await user.comparePassword(pass);
      console.log(`Login test for ${email}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testLogin();
