import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkDbs() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const adminDb = conn.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log(dbs.databases.map(d => d.name));
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkDbs();
