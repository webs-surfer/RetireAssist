const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/retireassist', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    let admin = await User.findOne({ email: 'admin@retireassist.com' });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: 'admin@retireassist.com',
        password: 'admin1234',
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('Admin created');
    } else {
        admin.password = 'admin1234';
        admin.role = 'admin';
        await admin.save();
        console.log('Admin updated');
    }
    process.exit(0);
  });
