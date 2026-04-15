const mongoose = require('mongoose');
const User = require('./models/User');
const Document = require('./models/Document');
const Reminder = require('./models/Reminder');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/retireassist';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Document.deleteMany({});
        await Reminder.deleteMany({});

        // Create users
        const users = await User.create([
            {
                name: 'Ramesh Kumar',
                email: 'ramesh@example.com',
                password: 'password123',
                age: 65,
                pensionId: 'PEN-2024-001234',
                aadhaarNumber: '1234 5678 9012',
                phone: '9876543210',
                bankDetails: { accountNumber: '12345678901', ifsc: 'SBIN0001234', bankName: 'State Bank of India' },
                role: 'user',
                pensionStatus: 'active',
                monthlyPension: 25000
            },
            {
                name: 'Sunita Devi',
                email: 'sunita@example.com',
                password: 'password123',
                age: 62,
                pensionId: 'PEN-2024-005678',
                aadhaarNumber: '9876 5432 1098',
                phone: '9876543211',
                bankDetails: { accountNumber: '98765432109', ifsc: 'PUNB0001234', bankName: 'Punjab National Bank' },
                role: 'user',
                pensionStatus: 'active',
                monthlyPension: 22000
            },
            {
                name: 'Admin User',
                email: 'admin@retireassist.com',
                password: 'admin123',
                age: 45,
                phone: '9876543200',
                role: 'admin',
                pensionStatus: 'active',
                monthlyPension: 0
            }
        ]);

        console.log(`✅ Created ${users.length} users`);

        // Create documents for Ramesh
        const docs = await Document.create([
            {
                userId: users[0]._id,
                documentType: 'aadhaar',
                fileName: 'aadhaar_card.pdf',
                filePath: '/uploads/aadhaar_card.pdf',
                extractedData: { name: 'Ramesh Kumar', documentNumber: '1234 5678 9012', dateOfBirth: '15/03/1960', address: '45, Gandhi Nagar, New Delhi' },
                status: 'verified'
            },
            {
                userId: users[0]._id,
                documentType: 'pan',
                fileName: 'pan_card.pdf',
                filePath: '/uploads/pan_card.pdf',
                extractedData: { name: 'Ramesh Kumar', documentNumber: 'ABCDE1234F', dateOfBirth: '15/03/1960' },
                status: 'verified'
            },
            {
                userId: users[0]._id,
                documentType: 'pension_id',
                fileName: 'pension_order.pdf',
                filePath: '/uploads/pension_order.pdf',
                extractedData: { name: 'Ramesh Kumar', documentNumber: 'PEN-2024-001234' },
                status: 'verified'
            }
        ]);

        console.log(`✅ Created ${docs.length} documents`);

        // Create reminders
        const reminders = await Reminder.create([
            {
                userId: users[0]._id,
                title: 'Submit Life Certificate',
                description: 'Annual life certificate submission via Jeevan Pramaan',
                dueDate: new Date('2026-11-30'),
                type: 'life_certificate',
                priority: 'high',
                status: 'pending'
            },
            {
                userId: users[0]._id,
                title: 'Pension Verification',
                description: 'Quarterly pension verification at bank',
                dueDate: new Date('2026-04-15'),
                type: 'pension_verification',
                priority: 'medium',
                status: 'pending'
            },
            {
                userId: users[0]._id,
                title: 'Health Insurance Renewal',
                description: 'Renew CGHS card and update medical records',
                dueDate: new Date('2026-06-30'),
                type: 'insurance_renewal',
                priority: 'medium',
                status: 'pending'
            },
            {
                userId: users[1]._id,
                title: 'Submit Life Certificate',
                description: 'Annual life certificate submission',
                dueDate: new Date('2026-11-30'),
                type: 'life_certificate',
                priority: 'high',
                status: 'pending'
            }
        ]);

        console.log(`✅ Created ${reminders.length} reminders`);
        console.log('\n🎉 Database seeded successfully!');
        console.log('\nDemo Accounts:');
        console.log('  User: ramesh@example.com / password123');
        console.log('  User: sunita@example.com / password123');
        console.log('  Admin: admin@retireassist.com / admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seedData();
