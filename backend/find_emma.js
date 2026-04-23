import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function findEmma() {
  const baseUri = process.env.MONGODB_URI.replace(/\/$/, ''); // remove trailing slash
  const dbs = ['admin', 'test', 'flowfix', 'swiftfix', 'swift-fix'];
  
  for (let dbName of dbs) {
    try {
      const uri = `${baseUri}/${dbName}`;
      const conn = await mongoose.createConnection(uri).asPromise();
      const coll = conn.collection('users');
      const user = await coll.findOne({ email: 'emma@mail.com' });
      if (user) {
        console.log(`FOUND EMMA IN: ${dbName}`);
      }
      await conn.close();
    } catch (e) {
      // ignore
    }
  }
  process.exit();
}
findEmma();
