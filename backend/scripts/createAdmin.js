// scripts/createAdmin.js
/**
 * Safe Admin Provisioning Script for MaaCare
 * 
 * Usage:
 *   1. Interactive Mode:
 *      node scripts/createAdmin.js
 * 
 *   2. CLI Flags:
 *      node scripts/createAdmin.js --name "Admin Name" --email "admin@example.com" --password "SecurePass123" --phone "9876543210"
 * 
 *   3. Environment Variables:
 *      ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node scripts/createAdmin.js
 */

const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1] && !args[i + 1].startsWith('--')) {
      const key = args[i].substring(2);
      params[key] = args[i + 1];
      i++;
    }
  }
  return params;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run() {
  console.log('==============================================');
  console.log('       MaaCare Admin Provisioning Utility      ');
  console.log('==============================================\n');

  const cliArgs = parseArgs();

  let name = cliArgs.name || process.env.ADMIN_NAME;
  let email = cliArgs.email || process.env.ADMIN_EMAIL;
  let password = cliArgs.password || process.env.ADMIN_PASSWORD;
  let phone = cliArgs.phone || process.env.ADMIN_PHONE || '';

  // If running in interactive mode (required fields missing)
  const isInteractive = !name || !email || !password;
  if (!name) {
    name = await prompt('Enter Admin Full Name: ');
  }
  if (!email) {
    email = await prompt('Enter Admin Email: ');
  }
  if (!password) {
    password = await prompt('Enter Admin Initial Password (min 6 chars): ');
  }
  if (isInteractive && !phone) {
    phone = await prompt('Enter Admin Phone (optional, press Enter to skip): ');
  }

  name = name ? name.trim() : '';
  email = email ? email.trim().toLowerCase() : '';
  password = password ? password.trim() : '';
  phone = phone ? phone.trim() : '';

  // Validation
  if (!name) {
    console.error('Error: Admin name is required.');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error('Error: A valid email address is required.');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maacare';

  try {
    console.log('\nConnecting to database...');
    await mongoose.connect(mongoURI);
    console.log(`Connected to database: "${mongoose.connection.name}"`);

    // Check if account already exists
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`Notice: An administrator account with email "${email}" already exists (ID: ${existing._id}).`);
        console.log('No changes were made.');
        await mongoose.disconnect();
        process.exit(0);
      } else {
        console.error(`Error: A user with email "${email}" already exists with role "${existing.role}".`);
        await mongoose.disconnect();
        process.exit(1);
      }
    }

    // Create Admin User (password is hashed automatically by UserSchema.pre('save'))
    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
      isActive: true,
    });

    console.log('\nSUCCESS: Admin account created securely!');
    console.log(`  User ID : ${admin._id}`);
    console.log(`  Name    : ${admin.name}`);
    console.log(`  Email   : ${admin.email}`);
    console.log(`  Role    : ${admin.role}`);
    console.log(`  Active  : ${admin.isActive}`);
    console.log('\nYou can now log in via the MaaCare login interface with this account.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to provision admin account:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

run();
