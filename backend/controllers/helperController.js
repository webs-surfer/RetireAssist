const HelperProfile = require('../models/HelperProfile');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Submit KYC
// @route   POST /api/helper/kyc
// @access  Private (helper)
const submitKYC = async (req, res) => {
  try {
    const { aadhaarNumber, servicesOffered, experience, languages, priceMin, priceMax } = req.body;

    const aadhaarImage = req.files?.aadhaar?.[0]?.filename;
    const faceImage = req.files?.face?.[0]?.filename;

    let profile = await HelperProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new HelperProfile({ userId: req.user._id });
    }

    profile.aadhaarNumber = aadhaarNumber;
    profile.aadhaarImage = aadhaarImage || profile.aadhaarImage;
    profile.faceImage = faceImage || profile.faceImage;
    profile.servicesOffered = JSON.parse(servicesOffered || '[]');
    profile.experience = experience || 0;
    profile.languages = JSON.parse(languages || '["Hindi"]');
    profile.priceRange = { min: priceMin || 200, max: priceMax || 500 };
    profile.kycStatus = 'pending';

    await profile.save();

    return sendSuccess(res, 200, 'KYC submitted. Awaiting admin verification.', { profile });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get nearby helpers
// @route   GET /api/helpers/nearby?lat=&lng=&radius=&service=
// @access  Private
const getNearbyHelpers = async (req, res) => {
  try {
    const { lat, lng, radius = 10000, service } = req.query;

    if (!lat || !lng) {
      return sendError(res, 400, 'Latitude and longitude are required');
    }

    const query = {
      kycStatus: 'approved',
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    };

    if (service) {
      query.servicesOffered = { $in: [service] };
    }

    const helperProfiles = await HelperProfile.find(query).populate('userId', 'name phone');

    const helpers = helperProfiles.map(h => ({
      id: h.userId._id,
      profileId: h._id,
      name: h.userId.name,
      phone: h.userId.phone,
      rating: h.rating,
      totalRatings: h.totalRatings,
      totalJobs: h.totalJobs,
      services: h.servicesOffered,
      price: h.priceRange,
      experience: h.experience,
      languages: h.languages,
      isAvailable: h.isAvailable,
      location: h.location,
    }));

    return sendSuccess(res, 200, `${helpers.length} helpers found nearby`, { helpers });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get helper's incoming task requests
// @route   GET /api/helper/requests
// @access  Private (helper)
const getHelperRequests = async (req, res) => {
  try {
    const requests = await Task.find({
      helperId: req.user._id,
      status: 'pending',
    }).populate('userId', 'name phone age location');

    return sendSuccess(res, 200, 'Requests fetched', { requests });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update helper availability
// @route   PUT /api/helper/update-availability
// @access  Private (helper)
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable, location } = req.body;

    const profile = await HelperProfile.findOneAndUpdate(
      { userId: req.user._id },
      { isAvailable, ...(location && { location }) },
      { new: true }
    );

    if (!profile) return sendError(res, 404, 'Helper profile not found');

    return sendSuccess(res, 200, 'Availability updated', { isAvailable: profile.isAvailable });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get helper's own profile
// @route   GET /api/helper/profile
// @access  Private (helper)
const getHelperProfile = async (req, res) => {
  try {
    const profile = await HelperProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    if (!profile) return sendError(res, 404, 'Profile not found');
    return sendSuccess(res, 200, 'Profile fetched', { profile });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { submitKYC, getNearbyHelpers, getHelperRequests, updateAvailability, getHelperProfile };
