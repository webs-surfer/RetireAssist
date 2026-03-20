const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const HelperProfile = require('./models/HelperProfile');

const seedAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Create/fix Helper profile ──
    const helperUser = await User.findOne({ email: 'helper@retireassist.com' });
    if (helperUser) {
      // Remove any existing profile and recreate
      await HelperProfile.deleteMany({ userId: helperUser._id });
      await HelperProfile.create({
        userId: helperUser._id,
        servicesOffered: ['Pension', 'Aadhaar', 'PAN', 'Government'],
        experience: 5,
        priceRange: { min: 200, max: 500 },
        languages: ['Hindi', 'English', 'Bhojpuri'],
        bio: 'Experienced helper specializing in pension and government document services for senior citizens.',
        kycStatus: 'approved',
        isAvailable: true,
        totalJobs: 45,
        totalRatings: 12,
        rating: 4.8,
        location: { type: 'Point', coordinates: [85.12, 25.62], city: 'Patna', address: 'Patna, Bihar' },
      });
      console.log('✅ Helper profile created/fixed for helper@retireassist.com');
    }

    // ── Create Admin account ──
    const existingAdmin = await User.findOne({ email: 'admin@retireassist.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin RetireAssist',
        email: 'admin@retireassist.com',
        password: 'admin123456',
        role: 'admin',
        age: 30,
        phone: '9876543212',
        gender: 'Male',
        preferredLanguage: 'English',
        authProvider: 'email',
        profileCompleted: true,
        location: { type: 'Point', coordinates: [77.2, 28.6], city: 'New Delhi', address: 'New Delhi' },
      });
      console.log('✅ Admin account created');
    } else {
      console.log('⏭️  Admin account already exists');
    }

    console.log('\n🎉 All accounts ready!\n');
    console.log('┌──────────────────────────────────────────────────────────┐');
    console.log('│  ACCOUNT          EMAIL                    PASSWORD     │');
    console.log('├──────────────────────────────────────────────────────────┤');
    console.log('│  👤 User          user@retireassist.com    user123456   │');
    console.log('│  🛠️  Helper        helper@retireassist.com  helper123456 │');
    console.log('│  🔑 Admin         admin@retireassist.com   admin123456  │');
    console.log('└──────────────────────────────────────────────────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAccounts();
