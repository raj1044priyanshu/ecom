import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const email = process.argv[2]; // optional email argument

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const filter = email ? { email } : {};
    const user = await User.findOneAndUpdate(filter, { role: 'admin' }, { new: true });

    if (user) {
      console.log(`✅ Successfully promoted "${user.email}" to Admin!`);
    } else {
      console.log(email
        ? `❌ No user found with email: ${email}. Did you register first?`
        : '❌ No users found in the database. Please register first.'
      );
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
