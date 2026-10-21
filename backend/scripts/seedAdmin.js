require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../src/models/Admin');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/housie';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}...`);
    await mongoose.connect(uri);
    console.log('MongoDB Connected successfully.');

    const username = 'varshini';
    const plainPassword = 'varshini@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const admin = await Admin.findOneAndUpdate(
      { username },
      {
        username,
        password: hashedPassword,
        role: 'superadmin'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[OK] Admin user "${admin.username}" successfully seeded into database!`);
    console.log(`Role: ${admin.role}`);

    // Verify bcrypt compare
    const isMatch = await bcrypt.compare(plainPassword, admin.password);
    if (isMatch) {
      console.log('[OK] Password verification test passed: Credentials are ready for login.');
    } else {
      console.error('[ERROR] Password verification failed.');
    }

    await mongoose.disconnect();
    console.log('Database disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin credentials:', err);
    process.exit(1);
  }
}

seedAdmin();
