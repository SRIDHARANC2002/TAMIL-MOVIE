const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔄 Testing MongoDB Connection...');
    console.log('📍 URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');

    // List all users
    const users = await User.find({}, { password: 0 }); // Exclude password field
    console.log('\n📊 Users in Database:', users.length);
    console.log('👥 User Details:');
    users.forEach(user => {
      console.log(`
      ID: ${user._id}
      Name: ${user.fullName}
      Email: ${user.email}
      Created: ${user.createdAt}
      `);
    });

    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Database Test Error:', error);
  }
}

checkUsers();
