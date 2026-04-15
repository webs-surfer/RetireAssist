/**
 * Seed Script: Creates test helper users near MULTIPLE cities
 * Run: node scripts/seedHelpers.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/retireassist';

const TEST_HELPERS = [
    // ── Greater Noida / Delhi NCR area ─────────────────────────
    {
        name: 'Amit Verma',
        email: 'amit.helper@test.com',
        bio: 'Experienced pension advisor specializing in EPFO and NPS. 12 years helping retirees across Delhi NCR with government paperwork.',
        services: ['Pension Management', 'EPFO/ESI Support', 'Government Schemes'],
        rating: 4.9, totalReviews: 245,
        city: 'Greater Noida',
        lat: 28.4744, lng: 77.5040, // ~1.5 km from Knowledge Park
    },
    {
        name: 'Sunita Devi',
        email: 'sunita.helper@test.com',
        bio: 'Tax filing expert for senior citizens. I make income tax and TDS returns easy for retirees. Door-to-door service available.',
        services: ['Income Tax Filing', 'Financial Planning', 'Banking Assistance'],
        rating: 4.7, totalReviews: 178,
        city: 'Greater Noida',
        lat: 28.4695, lng: 77.5150, // ~2.8 km
    },
    {
        name: 'Ravi Sharma',
        email: 'ravi.helper@test.com',
        bio: 'Insurance claims specialist — health insurance, life insurance, and Ayushman Bharat. Fast and reliable service for seniors.',
        services: ['Insurance Services', 'Health Services', 'Government Schemes'],
        rating: 4.5, totalReviews: 112,
        city: 'Noida',
        lat: 28.5355, lng: 77.3910, // ~12 km (Noida Sector 62)
    },
    {
        name: 'Pooja Gupta',
        email: 'pooja.helper@test.com',
        bio: 'Property registration and legal documentation expert. Handles sale deeds, mutation, and land records for retired individuals.',
        services: ['Property Registration', 'Legal Aid', 'Government Schemes'],
        rating: 4.8, totalReviews: 198,
        city: 'Greater Noida',
        lat: 28.4610, lng: 77.5020, // ~3.2 km
    },
    {
        name: 'Manoj Kumar',
        email: 'manoj.helper@test.com',
        bio: 'All-round financial planner for retirees. Covers pensions, fixed deposits, mutual funds, and banking assistance. Very patient and experienced.',
        services: ['Financial Planning', 'Banking Assistance', 'Pension Management', 'Income Tax Filing'],
        rating: 5.0, totalReviews: 321,
        city: 'Greater Noida',
        lat: 28.4750, lng: 77.5030, // ~0.8 km — CLOSEST
    },
    {
        name: 'Neha Singh',
        email: 'neha.helper@test.com',
        bio: 'Government schemes navigator — Ayushman Bharat, PM-SVANidhi, pension portability, and all central/state welfare programs for seniors.',
        services: ['Government Schemes', 'Pension Management', 'Health Services'],
        rating: 4.6, totalReviews: 134,
        city: 'Greater Noida',
        lat: 28.4820, lng: 77.5180, // ~4.5 km
    },
    {
        name: 'Vikas Tiwari',
        email: 'vikas.helper@test.com',
        bio: 'Banking assistance specialist. Helps seniors with digital banking, account management, FD renewals, and NEFT/RTGS transfers.',
        services: ['Banking Assistance', 'Financial Planning', 'EPFO/ESI Support'],
        rating: 4.3, totalReviews: 67,
        city: 'Greater Noida',
        lat: 28.4560, lng: 77.4890, // ~5.8 km
    },
    {
        name: 'Anjali Yadav',
        email: 'anjali.helper@test.com',
        bio: 'Aadhaar and document update expert. Specializes in Aadhaar correction, PAN linking, and pension document processing.',
        services: ['Government Schemes', 'Legal Aid', 'Income Tax Filing'],
        rating: 3.9, totalReviews: 42,
        city: 'Noida',
        lat: 28.5700, lng: 77.3500, // ~18 km (Noida City Center)
    },

    // ── Bangalore area (for user in Bangalore) ─────────────────
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.helper@test.com',
        bio: 'Experienced income tax consultant with 15 years of expertise. Specializing in senior citizen tax benefits and pension-related filings.',
        services: ['Income Tax Filing', 'Financial Planning', 'Pension Management'],
        rating: 4.8, totalReviews: 127,
        city: 'Bangalore',
        lat: 12.9352, lng: 77.6245,
    },
    {
        name: 'Priya Sharma',
        email: 'priya.helper@test.com',
        bio: 'Government schemes specialist helping retirees navigate pension, insurance, and welfare programs.',
        services: ['Government Schemes', 'Insurance Services', 'Pension Management'],
        rating: 4.9, totalReviews: 203,
        city: 'Bangalore',
        lat: 12.9784, lng: 77.6408,
    },
    {
        name: 'Arun Patel',
        email: 'arun.helper@test.com',
        bio: 'Banking and financial advisor. Helps seniors with account management, fixed deposits, and digital banking transitions.',
        services: ['Banking Assistance', 'Financial Planning', 'EPFO/ESI Support'],
        rating: 4.5, totalReviews: 89,
        city: 'Bangalore',
        lat: 12.9308, lng: 77.5838,
    },
    {
        name: 'Meena Reddy',
        email: 'meena.helper@test.com',
        bio: 'Legal aid expert focusing on property disputes, will drafting, and senior citizen rights.',
        services: ['Legal Aid', 'Property Registration', 'Government Schemes'],
        rating: 4.7, totalReviews: 156,
        city: 'Bangalore',
        lat: 12.9116, lng: 77.6474,
    },
    {
        name: 'Anita Gupta',
        email: 'anita.helper@test.com',
        bio: 'All-round financial planner for retirees. Covers tax, insurance, investments, and pension. Very highly rated.',
        services: ['Income Tax Filing', 'Financial Planning', 'Insurance Services', 'Pension Management'],
        rating: 5.0, totalReviews: 312,
        city: 'Bangalore',
        lat: 12.9756, lng: 77.6050,
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const User = require('../models/User');
        const hashedPassword = await bcrypt.hash('Test@1234', 10);

        let created = 0, updated = 0;

        for (const h of TEST_HELPERS) {
            const userData = {
                name: h.name,
                email: h.email,
                password: hashedPassword,
                role: 'helper',
                bio: h.bio,
                services: h.services,
                rating: h.rating,
                totalReviews: h.totalReviews,
                city: h.city,
                isVerified: true,
                onboardingStatus: 'approved',
                location: {
                    type: 'Point',
                    coordinates: [h.lng, h.lat] // GeoJSON: [longitude, latitude]
                },
            };

            const existing = await User.findOne({ email: h.email });
            if (existing) {
                await User.updateOne({ email: h.email }, { $set: userData });
                updated++;
                console.log(`  🔄 Updated: ${h.name} (${h.city}) — ⭐${h.rating}`);
            } else {
                await User.create(userData);
                created++;
                console.log(`  ✅ Created: ${h.name} (${h.city}) — ⭐${h.rating}, ${h.services.length} services`);
            }
        }

        // Ensure 2dsphere index
        await User.collection.createIndex({ location: '2dsphere' }).catch(() => {});
        console.log(`\n🎉 Done! Created: ${created}, Updated: ${updated}`);
        console.log(`📍 Helpers seeded in: Greater Noida, Noida, and Bangalore`);
        console.log(`🔑 Login: any email above with password "Test@1234"`);

    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
