const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 200, 'Profile fetched', { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/update
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, age, location, city, gender, preferredLanguage } = req.body;

    // Build location object if city is provided but location is not
    let locationData = location;
    if (!location && city) {
      locationData = { city, address: city };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, age, gender, preferredLanguage, location: locationData, profileCompleted: true },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Profile updated', { user: updatedUser });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getProfile, updateProfile };
