// Script to create an admin user
// Run this once: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@InteriorDesigner.com' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@InteriorDesigner.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@InteriorDesigner.com');
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
