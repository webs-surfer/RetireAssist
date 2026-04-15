/**
 * Seed admin user script
 * Run: node scripts/seedAdmin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/retireassist';

const userSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String, role: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: 'admin@retireassist.com' });
        if (existing) {
            console.log('ℹ️  Admin already exists: admin@retireassist.com / admin123');
            return;
        }

        const hash = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Platform Admin', email: 'admin@retireassist.com',
            password: hash, role: 'admin'
        });
        console.log('✅ Admin user created!');
        console.log('   Email: admin@retireassist.com');
        console.log('   Password: admin123');

        // Also create a demo regular user
        const existingUser = await User.findOne({ email: 'ramesh@example.com' });
        if (!existingUser) {
            const userHash = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Ramesh Kumar', email: 'ramesh@example.com',
                password: userHash, role: 'user'
            });
            console.log('\n✅ Demo user created!');
            console.log('   Email: ramesh@example.com');
            console.log('   Password: password123');
        }

        // Create demo helper
        const existingHelper = await User.findOne({ email: 'helper@example.com' });
        if (!existingHelper) {
            const helperHash = await bcrypt.hash('helper123', 10);
            await User.create({
                name: 'Priya Helper', email: 'helper@example.com',
                password: helperHash, role: 'helper'
            });
            console.log('\n✅ Demo helper created!');
            console.log('   Email: helper@example.com');
            console.log('   Password: helper123');
        }

    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDone!');
    }
}

seed();
