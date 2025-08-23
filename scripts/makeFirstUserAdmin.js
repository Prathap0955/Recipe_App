const mongoose = require('mongoose');
require('dotenv').config();

// User Schema (simplified for the script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  avatar: String,
  bio: String,
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function makeFirstUserAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the first user
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    
    if (!firstUser) {
      console.log('No users found in the database');
      return;
    }

    // Update the user to admin
    firstUser.role = 'admin';
    await firstUser.save();

    console.log(`User ${firstUser.name} (${firstUser.email}) is now an admin`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeFirstUserAdmin();
