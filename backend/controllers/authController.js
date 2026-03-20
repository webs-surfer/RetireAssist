const User = require('../models/User');
const HelperProfile = require('../models/HelperProfile');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, age, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    const locationData = city ? { city, address: city } : undefined;
    const user = await User.create({
      name, email, password,
      role: role || 'user', phone, age,
      location: locationData,
      authProvider: 'email',
    });

    // If helper, create helper profile
    if (role === 'helper') {
      await HelperProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, 'Account created successfully', {
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, age: user.age,
        city: user.location?.city,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return sendError(res, 500, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Google OAuth users don't have passwords
    if (user.authProvider === 'google' && !user.password) {
      return sendError(res, 400, 'This account uses Google Sign-In. Please login with Google.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account has been deactivated');
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, age: user.age,
        city: user.location?.city, photo: user.photo,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, photo } = req.body;

    if (!email || !googleId) {
      return sendError(res, 400, 'Email and Google ID required');
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Existing user — update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (photo && !user.photo) user.photo = photo;
        await user.save();
      }
    } else {
      // New user — create account
      user = await User.create({
        name, email, googleId,
        authProvider: 'google',
        photo,
        role: 'user',
      });
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, user.profileCompleted ? 'Login successful' : 'Please complete your profile', {
      token,
      isNewUser: !user.profileCompleted,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, age: user.age,
        city: user.location?.city, photo: user.photo,
        authProvider: user.authProvider,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return sendError(res, 500, error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 200, 'User fetched', { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { signup, login, googleAuth, getMe };
