require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - remove in production)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create demo users
    const users = [
      {
        email: 'demo@salonmind.com',
        password: 'demo123',
        phoneNumber: '+919876543210',
        role: 'admin',
        firstName: 'Demo',
        lastName: 'Admin',
      },
      {
        email: 'staff@salonmind.com',
        password: 'staff123',
        phoneNumber: '+919876543211',
        role: 'staff',
        firstName: 'Staff',
        lastName: 'Member',
      },
      {
        email: 'client@salonmind.com',
        password: 'client123',
        phoneNumber: '+919876543212',
        role: 'client',
        firstName: 'John',
        lastName: 'Doe',
      },
    ];

    const createdUsers = await User.create(users);
    console.log('✅ Created users:', createdUsers.length);
    
    console.log('\n📧 Test Credentials:');
    console.log('Admin: demo@salonmind.com / demo123');
    console.log('Staff: staff@salonmind.com / staff123');
    console.log('Client: client@salonmind.com / client123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
