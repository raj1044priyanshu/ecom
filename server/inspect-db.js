import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await mongoose.connection.collection('products').find({}).limit(2).toArray();
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
inspect();
