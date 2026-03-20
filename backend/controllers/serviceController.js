const Service = require('../models/Service');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Get all services (optionally filtered by age/category)
// @route   GET /api/services?age=&category=
// @access  Public
const getServices = async (req, res) => {
  try {
    const { age, category } = req.query;
    const query = { isActive: true };

    if (age) {
      const userAge = parseInt(age);
      query.minAge = { $lte: userAge };
      query.maxAge = { $gte: userAge };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const services = await Service.find(query).sort({ category: 1, title: 1 });
    return sendSuccess(res, 200, `${services.length} services found`, { services });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return sendError(res, 404, 'Service not found');
    return sendSuccess(res, 200, 'Service fetched', { service });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create a service (admin only)
// @route   POST /api/services
// @access  Private (admin)
const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    return sendSuccess(res, 201, 'Service created', { service });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getServices, getServiceById, createService };
