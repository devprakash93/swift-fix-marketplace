import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
  try {
    const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
    const collections = await conn.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    if (collections.find(c => c.name === 'categories')) {
      const cats = await conn.collection('categories').countDocuments();
      console.log('Categories count:', cats);
    }
    
    if (collections.find(c => c.name === 'users')) {
      const users = await conn.collection('users').find({}).toArray();
      console.log('Users:', users.map(u => u.email));
    }
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkDb();
