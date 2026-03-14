import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log("No admin found");
    process.exit(1);
  }
  
  // Create a token directly
  const jwt = await import('jsonwebtoken');
  const token = jwt.default.sign({ id: admin._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  
  // Hit the API using native fetch
  const formData = new FormData();
  formData.append('name', 'Test CLI Product');
  formData.append('price', '100');
  formData.append('description', 'Test Description Here');
  formData.append('category', 'Electronics');
  formData.append('brand', 'CLI Brand');
  formData.append('stock', '10');
  // Blob simulation for empty image just so multer sees multipart
  formData.append('images', new Blob(['test']), 'test.jpg');

  try {
    console.log("Sending POST /api/products...");
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Network Error:", err.message);
  }
  process.exit(0);
}
test();
