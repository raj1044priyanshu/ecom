import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  // Update countInStock to stock
  const result1 = await mongoose.connection.collection('products').updateMany(
    { countInStock: { $exists: true } },
    { $rename: { 'countInStock': 'stock' } }
  );
  console.log(`Renamed countInStock to stock for ${result1.modifiedCount} products.`);
  
  // Convert discountPercent to a flat discountPrice logic (price - (price * discountPercent / 100))
  // Since we can't easily do math in a simple updateMany without aggregate pipeline, we'll iterate.
  const products = await mongoose.connection.collection('products').find({ discountPercent: { $exists: true } }).toArray();
  let percentCount = 0;
  for (const p of products) {
    if (p.discountPercent > 0 && p.price) {
      const discountAmount = Math.round(p.price * (p.discountPercent / 100));
      await mongoose.connection.collection('products').updateOne(
        { _id: p._id },
        { 
          $set: { discountPrice: discountAmount },
          $unset: { discountPercent: 1 }
        }
      );
      percentCount++;
    } else {
      await mongoose.connection.collection('products').updateOne(
        { _id: p._id },
        { $unset: { discountPercent: 1 } }
      );
    }
  }
  console.log(`Converted discountPercent to discountPrice for ${percentCount} products.`);
  
  // Ensure all products have stock and discountPrice fields
  const result3 = await mongoose.connection.collection('products').updateMany(
    { stock: { $exists: false } },
    { $set: { stock: 10 } } // Default fallback
  );
  console.log(`Set default stock for ${result3.modifiedCount} products.`);

  process.exit(0);
}

migrate().catch(console.error);
