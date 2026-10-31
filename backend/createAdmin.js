
require('dotenv').config();

const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    const name = (await ask('Admin name: ')).trim();
    const email = (await ask('Admin email: ')).trim().toLowerCase();
    const password = await ask('Admin password (minimum 8 characters): ');

    if (!name || !email || password.length < 8) {
      throw new Error(
        'Name and email are required; password must have at least 8 characters.'
      );
    }

    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || "smart_wall_visualizer_db" });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        'This email already has an account. No changes were made.'
      );
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    console.log(`Admin account created successfully for ${admin.email}.`);
  } catch (error) {
    console.error('Admin setup failed:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createAdmin();
