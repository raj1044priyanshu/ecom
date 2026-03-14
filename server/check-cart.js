import Cart from './models/Cart.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const carts = await Cart.find({}).populate('items.product', 'name images price stock slug category').limit(2);
  
  for (const cart of carts) {
    console.log('Cart user:', cart.user);
    console.log('Items count:', cart.items.length);
    for (const item of cart.items) {
      console.log('  product:', JSON.stringify(item.product));
      console.log('  quantity:', item.quantity);
      console.log('  price:', item.price);
    }
  }
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
