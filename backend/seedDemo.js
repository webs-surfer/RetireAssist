/**
 * Seed script: Creates many demo helpers and users near Greater Noida Knowledge Park III
 * Run: node seedDemo.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const HelperProfile = require('./models/HelperProfile');
const Document = require('./models/Document');

// ── Greater Noida Knowledge Park III center coordinates ──
// Lat: 28.4744, Lng: 77.4900
const KP3_CENTER = { lat: 28.4744, lng: 77.4900 };

// Helper to generate random coords near KP3
const nearbyCoords = (spreadKm = 3) => {
  const spread = spreadKm / 111; // ~1 degree = 111km
  return [
    KP3_CENTER.lng + (Math.random() - 0.5) * spread * 2,
    KP3_CENTER.lat + (Math.random() - 0.5) * spread * 2,
  ];
};

// ── Demo Users (elderly citizens) ──
const demoUsers = [
  {
    name: 'Ramesh Kumar Sharma',
    email: 'ramesh.sharma@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 68,
    phone: '9876543101',
    gender: 'Male',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1), city: 'Greater Noida', address: 'Knowledge Park III, Greater Noida' },
  },
  {
    name: 'Sunita Devi Gupta',
    email: 'sunita.gupta@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 63,
    phone: '9876543102',
    gender: 'Female',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1), city: 'Greater Noida', address: 'Pari Chowk, Greater Noida' },
  },
  {
    name: 'Mohan Lal Verma',
    email: 'mohan.verma@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 75,
    phone: '9876543103',
    gender: 'Male',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(2), city: 'Greater Noida', address: 'Sector Alpha, Greater Noida' },
  },
  {
    name: 'Kamla Rani Singh',
    email: 'kamla.singh@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 70,
    phone: '9876543104',
    gender: 'Female',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1.5), city: 'Greater Noida', address: 'Knowledge Park II, Greater Noida' },
  },
  {
    name: 'Jagdish Prasad Yadav',
    email: 'jagdish.yadav@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 66,
    phone: '9876543105',
    gender: 'Male',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(2), city: 'Greater Noida', address: 'Surajpur, Greater Noida' },
  },
  {
    name: 'Shakuntala Mishra',
    email: 'shakuntala.mishra@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 72,
    phone: '9876543106',
    gender: 'Female',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1), city: 'Greater Noida', address: 'Sigma Sector, Greater Noida' },
  },
  {
    name: 'Bhagwan Das Chauhan',
    email: 'bhagwan.chauhan@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 78,
    phone: '9876543107',
    gender: 'Male',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(2.5), city: 'Greater Noida', address: 'Techzone 4, Greater Noida' },
  },
  {
    name: 'Savitri Kumari Pandey',
    email: 'savitri.pandey@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 64,
    phone: '9876543108',
    gender: 'Female',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1.5), city: 'Greater Noida', address: 'Omega Sector, Greater Noida' },
  },
  {
    name: 'Hari Om Tiwari',
    email: 'hariom.tiwari@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 80,
    phone: '9876543109',
    gender: 'Male',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1), city: 'Greater Noida', address: 'Knowledge Park I, Greater Noida' },
  },
  {
    name: 'Pushpa Devi Rawat',
    email: 'pushpa.rawat@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 67,
    phone: '9876543110',
    gender: 'Female',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(2), city: 'Greater Noida', address: 'Gamma-I, Greater Noida' },
  },
  {
    name: 'Rajendra Prasad Dubey',
    email: 'rajendra.dubey@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 71,
    phone: '9876543111',
    gender: 'Male',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(1.5), city: 'Greater Noida', address: 'Delta Sector, Greater Noida' },
  },
  {
    name: 'Geeta Bai Joshi',
    email: 'geeta.joshi@demo.com',
    password: 'demo123456',
    role: 'user',
    age: 65,
    phone: '9876543112',
    gender: 'Female',
    preferredLanguage: 'Hindi',
    location: { type: 'Point', coordinates: nearbyCoords(2), city: 'Greater Noida', address: 'Sector Phi, Greater Noida' },
  },
];

// ── Demo Helpers ──
const demoHelpers = [
  {
    user: {
      name: 'Suresh Kumar Yadav',
      email: 'suresh.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 32,
      phone: '9988776601',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.5), city: 'Greater Noida', address: 'Knowledge Park III, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Pension', 'Aadhaar', 'PAN', 'Government'],
      experience: 6,
      priceRange: { min: 200, max: 500 },
      languages: ['Hindi', 'English'],
      bio: 'Retired government officer with 6 years of experience helping senior citizens with pension, Aadhaar, and PAN card services in Greater Noida.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 87,
      totalRatings: 23,
      rating: 4.8,
      aadhaarNumber: '9876-5432-1001',
    },
  },
  {
    user: {
      name: 'Priya Sharma',
      email: 'priya.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 28,
      phone: '9988776602',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1), city: 'Greater Noida', address: 'Pari Chowk, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Health', 'Insurance', 'Government'],
      experience: 4,
      priceRange: { min: 250, max: 600 },
      languages: ['Hindi', 'English', 'Punjabi'],
      bio: 'Healthcare professional specializing in Ayushman Bharat enrollment and insurance claims for senior citizens.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 56,
      totalRatings: 18,
      rating: 4.9,
      aadhaarNumber: '9876-5432-1002',
    },
  },
  {
    user: {
      name: 'Amit Chauhan',
      email: 'amit.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 35,
      phone: '9988776603',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.8), city: 'Greater Noida', address: 'Knowledge Park III, Block C' },
    },
    profile: {
      servicesOffered: ['Financial', 'Banking', 'Pension', 'EPF'],
      experience: 8,
      priceRange: { min: 300, max: 700 },
      languages: ['Hindi', 'English'],
      bio: 'Former bank officer with 8 years of experience. Expert in EPF withdrawal, senior savings schemes, and pension applications.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 134,
      totalRatings: 42,
      rating: 4.7,
      aadhaarNumber: '9876-5432-1003',
    },
  },
  {
    user: {
      name: 'Neha Agarwal',
      email: 'neha.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 30,
      phone: '9988776604',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1.2), city: 'Greater Noida', address: 'Sector Omega-I, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Aadhaar', 'PAN', 'Government'],
      experience: 3,
      priceRange: { min: 150, max: 400 },
      languages: ['Hindi', 'English', 'Bengali'],
      bio: 'Document specialist helping elders with Aadhaar updates, PAN card services, and government form-filling.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 42,
      totalRatings: 15,
      rating: 4.6,
      aadhaarNumber: '9876-5432-1004',
    },
  },
  {
    user: {
      name: 'Ravi Shankar Tripathi',
      email: 'ravi.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 40,
      phone: '9988776605',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.6), city: 'Greater Noida', address: 'Knowledge Park III, Near GNIOT' },
    },
    profile: {
      servicesOffered: ['Pension', 'Government', 'Health', 'Insurance'],
      experience: 12,
      priceRange: { min: 350, max: 800 },
      languages: ['Hindi', 'English', 'Bhojpuri'],
      bio: 'Veteran helper with 12+ years of experience. Specializes in complex pension cases and government scheme enrollment.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 210,
      totalRatings: 65,
      rating: 4.9,
      aadhaarNumber: '9876-5432-1005',
    },
  },
  {
    user: {
      name: 'Deepa Kumari',
      email: 'deepa.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 26,
      phone: '9988776606',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1.5), city: 'Greater Noida', address: 'Techzone-4, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Health', 'Aadhaar', 'Government'],
      experience: 2,
      priceRange: { min: 150, max: 350 },
      languages: ['Hindi', 'English'],
      bio: 'Young and energetic helper. I assist elderly citizens with health card enrollment, Aadhaar services, and digital literacy.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 28,
      totalRatings: 10,
      rating: 4.5,
      aadhaarNumber: '9876-5432-1006',
    },
  },
  {
    user: {
      name: 'Vikram Singh Rajput',
      email: 'vikram.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 38,
      phone: '9988776607',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.3), city: 'Greater Noida', address: 'Knowledge Park III, Sector A' },
    },
    profile: {
      servicesOffered: ['Pension', 'Financial', 'Banking', 'EPF'],
      experience: 10,
      priceRange: { min: 300, max: 650 },
      languages: ['Hindi', 'English', 'Urdu'],
      bio: 'Banking expert with 10 years of experience. I help senior citizens with EPF claims, pension processing, and banking services.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 165,
      totalRatings: 50,
      rating: 4.8,
      aadhaarNumber: '9876-5432-1007',
    },
  },
  {
    user: {
      name: 'Anita Rawat',
      email: 'anita.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 33,
      phone: '9988776608',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1), city: 'Greater Noida', address: 'Alpha-I Sector, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Insurance', 'Health', 'Pension'],
      experience: 5,
      priceRange: { min: 200, max: 500 },
      languages: ['Hindi', 'English', 'Garhwali'],
      bio: 'Insurance and health scheme specialist. Experienced in Ayushman Bharat, PM-JAY, and senior citizen health card enrollment.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 73,
      totalRatings: 22,
      rating: 4.7,
      aadhaarNumber: '9876-5432-1008',
    },
  },
  {
    user: {
      name: 'Manoj Kumar Pandey',
      email: 'manoj.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 45,
      phone: '9988776609',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.7), city: 'Greater Noida', address: 'Knowledge Park III, Block B' },
    },
    profile: {
      servicesOffered: ['Government', 'Aadhaar', 'PAN', 'Pension', 'Financial'],
      experience: 15,
      priceRange: { min: 400, max: 900 },
      languages: ['Hindi', 'English', 'Sanskrit'],
      bio: 'Most experienced helper in the area with 15+ years. Expert in all government schemes, complex document processing, and elderly care.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 320,
      totalRatings: 95,
      rating: 5.0,
      aadhaarNumber: '9876-5432-1009',
    },
  },
  {
    user: {
      name: 'Pooja Srivastava',
      email: 'pooja.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 29,
      phone: '9988776610',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1.3), city: 'Greater Noida', address: 'Sigma Sector, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Health', 'Government', 'Aadhaar'],
      experience: 3,
      priceRange: { min: 180, max: 400 },
      languages: ['Hindi', 'English'],
      bio: 'Compassionate helper focused on elderly healthcare. I help with hospital registrations, Ayushman Bharat cards, and medical assistance.',
      kycStatus: 'approved',
      isAvailable: false, // One helper busy for realistic demo
      totalJobs: 35,
      totalRatings: 12,
      rating: 4.4,
      aadhaarNumber: '9876-5432-1010',
    },
  },
  {
    user: {
      name: 'Sanjay Gupta',
      email: 'sanjay.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 36,
      phone: '9988776611',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.4), city: 'Greater Noida', address: 'Knowledge Park III, Main Road' },
    },
    profile: {
      servicesOffered: ['PAN', 'Financial', 'Banking', 'Government'],
      experience: 7,
      priceRange: { min: 250, max: 550 },
      languages: ['Hindi', 'English', 'Marwari'],
      bio: 'Financial services expert. I help senior citizens with PAN card services, tax-related queries, and banking assistance.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 98,
      totalRatings: 30,
      rating: 4.6,
      aadhaarNumber: '9876-5432-1011',
    },
  },
  {
    user: {
      name: 'Kavita Devi Jha',
      email: 'kavita.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 31,
      phone: '9988776612',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1.8), city: 'Greater Noida', address: 'Gamma-II Sector, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Aadhaar', 'Insurance', 'Health', 'Government'],
      experience: 4,
      priceRange: { min: 200, max: 450 },
      languages: ['Hindi', 'English', 'Maithili'],
      bio: 'Dedicated helper for elderly document services. I make insurance claims, health registrations, and Aadhaar updates easy for senior citizens.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 51,
      totalRatings: 16,
      rating: 4.7,
      aadhaarNumber: '9876-5432-1012',
    },
  },
  {
    user: {
      name: 'Rohit Sharma',
      email: 'rohit.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 27,
      phone: '9988776613',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.9), city: 'Greater Noida', address: 'Knowledge Park III, Block D' },
    },
    profile: {
      servicesOffered: ['Government', 'Pension', 'Aadhaar', 'PAN'],
      experience: 3,
      priceRange: { min: 150, max: 400 },
      languages: ['Hindi', 'English'],
      bio: 'Tech-savvy helper who bridges the digital gap for senior citizens. I help with online applications, digital document submission, and e-governance portals.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 39,
      totalRatings: 13,
      rating: 4.5,
      aadhaarNumber: '9876-5432-1013',
    },
  },
  {
    user: {
      name: 'Meera Jaiswal',
      email: 'meera.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 34,
      phone: '9988776614',
      gender: 'Female',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(1.1), city: 'Greater Noida', address: 'Phi Sector, Greater Noida' },
    },
    profile: {
      servicesOffered: ['Pension', 'Health', 'Insurance', 'Financial'],
      experience: 6,
      priceRange: { min: 250, max: 550 },
      languages: ['Hindi', 'English', 'Awadhi'],
      bio: 'Pension and healthcare expert with 6 years experience. Trusted by hundreds of senior citizens in Greater Noida.',
      kycStatus: 'approved',
      isAvailable: false, // Another busy one
      totalJobs: 82,
      totalRatings: 28,
      rating: 4.8,
      aadhaarNumber: '9876-5432-1014',
    },
  },
  {
    user: {
      name: 'Arun Pratap Singh',
      email: 'arun.helper@demo.com',
      password: 'demo123456',
      role: 'helper',
      age: 42,
      phone: '9988776615',
      gender: 'Male',
      preferredLanguage: 'Hindi',
      location: { type: 'Point', coordinates: nearbyCoords(0.5), city: 'Greater Noida', address: 'Knowledge Park III, Near GIP Mall' },
    },
    profile: {
      servicesOffered: ['EPF', 'Financial', 'Banking', 'Pension', 'Government'],
      experience: 14,
      priceRange: { min: 350, max: 800 },
      languages: ['Hindi', 'English', 'Urdu', 'Bhojpuri'],
      bio: 'Senior helper with 14 years of field experience. I specialize in complex EPF withdrawals, pension disputes, and government scheme registrations for senior citizens.',
      kycStatus: 'approved',
      isAvailable: true,
      totalJobs: 245,
      totalRatings: 78,
      rating: 4.9,
      aadhaarNumber: '9876-5432-1015',
    },
  },
];

// ── Demo Documents for users ──
const makeDemoDocuments = (userIds) => {
  const docTypes = [
    { title: 'Aadhaar Card - Front', type: 'image/jpeg', status: 'approved' },
    { title: 'Aadhaar Card - Back', type: 'image/jpeg', status: 'approved' },
    { title: 'PAN Card', type: 'image/jpeg', status: 'pending' },
    { title: 'Pension Application Form', type: 'application/pdf', status: 'approved' },
    { title: 'Bank Passbook', type: 'application/pdf', status: 'pending' },
    { title: 'Age Proof Certificate', type: 'application/pdf', status: 'approved' },
    { title: 'BPL Certificate', type: 'application/pdf', status: 'rejected' },
    { title: 'Voter ID Card', type: 'image/jpeg', status: 'approved' },
    { title: 'Income Certificate', type: 'application/pdf', status: 'pending' },
    { title: 'Health Insurance Card', type: 'image/jpeg', status: 'approved' },
  ];

  const docs = [];
  userIds.forEach((uid, idx) => {
    // Each user gets 2-4 random documents
    const numDocs = 2 + Math.floor(Math.random() * 3);
    const shuffled = docTypes.sort(() => Math.random() - 0.5);
    for (let i = 0; i < numDocs; i++) {
      const dt = shuffled[i % docTypes.length];
      docs.push({
        uploadedBy: uid,
        fileName: dt.title,
        fileUrl: `/uploads/demo_${Date.now()}_${idx}_${i}.jpg`,
        fileType: dt.type,
        fileSize: 50000 + Math.floor(Math.random() * 200000),
        status: dt.status,
        isLocked: false,
      });
    }
  });
  return docs;
};

// ── Main Seed Function ──
const seedDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Clean up existing demo data ──
    const demoEmails = [
      ...demoUsers.map(u => u.email),
      ...demoHelpers.map(h => h.user.email),
    ];
    const existingDemoUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
    const existingIds = existingDemoUsers.map(u => u._id);

    if (existingIds.length > 0) {
      await HelperProfile.deleteMany({ userId: { $in: existingIds } });
      await Document.deleteMany({ uploadedBy: { $in: existingIds } });
      await User.deleteMany({ _id: { $in: existingIds } });
      console.log(`🗑️  Cleaned up ${existingIds.length} existing demo accounts`);
    }

    // ── Create demo users ──
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = await User.create({
        ...userData,
        authProvider: 'email',
        profileCompleted: true,
        kycStatus: 'approved',
      });
      createdUsers.push(user);
      console.log(`  👤 Created user: ${user.name} (${user.email})`);
    }

    // ── Create demo helpers ──
    const createdHelpers = [];
    for (const helperData of demoHelpers) {
      const user = await User.create({
        ...helperData.user,
        authProvider: 'email',
        profileCompleted: true,
        kycStatus: 'approved',
      });

      const profile = await HelperProfile.create({
        userId: user._id,
        ...helperData.profile,
        location: {
          type: 'Point',
          coordinates: helperData.user.location.coordinates,
          city: helperData.user.location.city,
          address: helperData.user.location.address,
        },
      });

      createdHelpers.push({ user, profile });
      console.log(`  🛠️  Created helper: ${user.name} (${user.email}) — ${helperData.profile.servicesOffered.join(', ')}`);
    }

    // ── Create demo documents ──
    const userIdsForDocs = createdUsers.slice(0, 6).map(u => u._id);
    const docs = makeDemoDocuments(userIdsForDocs);
    await Document.insertMany(docs);
    console.log(`\n  📄 Created ${docs.length} demo documents for ${userIdsForDocs.length} users`);

    // ── Summary ──
    console.log('\n\n🎉 Demo data seeded successfully!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                  📍 Location: Greater Noida Knowledge Park III');
    console.log('═══════════════════════════════════════════════════════════════');
    
    console.log('\n── 👤 Demo Users (Elderly Citizens) ──');
    console.log('┌───────────────────────────────┬─────────────────────────────────┬──────────────┐');
    console.log('│ NAME                          │ EMAIL                           │ PASSWORD     │');
    console.log('├───────────────────────────────┼─────────────────────────────────┼──────────────┤');
    for (const u of demoUsers) {
      const name = u.name.padEnd(30);
      const email = u.email.padEnd(32);
      console.log(`│ ${name}│ ${email}│ demo123456   │`);
    }
    console.log('└───────────────────────────────┴─────────────────────────────────┴──────────────┘');

    console.log('\n── 🛠️  Demo Helpers ──');
    console.log('┌───────────────────────────────┬─────────────────────────────────┬──────────────┬──────────┬───────┐');
    console.log('│ NAME                          │ EMAIL                           │ PASSWORD     │ SERVICES │ RATING│');
    console.log('├───────────────────────────────┼─────────────────────────────────┼──────────────┼──────────┼───────┤');
    for (const h of demoHelpers) {
      const name = h.user.name.padEnd(30);
      const email = h.user.email.padEnd(32);
      const services = h.profile.servicesOffered.length.toString().padEnd(9);
      const rating = h.profile.rating.toFixed(1).padEnd(6);
      console.log(`│ ${name}│ ${email}│ demo123456   │ ${services}│ ${rating}│`);
    }
    console.log('└───────────────────────────────┴─────────────────────────────────┴──────────────┴──────────┴───────┘');

    console.log('\n── 📊 Summary ──');
    console.log(`  👤 Users:     ${createdUsers.length}`);
    console.log(`  🛠️  Helpers:   ${createdHelpers.length} (${createdHelpers.filter(h => h.profile.isAvailable).length} available)`);
    console.log(`  📄 Documents: ${docs.length}`);
    console.log(`  📍 Area:      Greater Noida Knowledge Park III (~3km radius)`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDemo();
