const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'helper').default('user'),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().allow('', null),
  age: Joi.number().min(18).max(120).optional().allow(null),
  city: Joi.string().optional().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  helperId: Joi.string().required(),
  serviceType: Joi.string().required(),
  description: Joi.string().optional().allow('', null),
  proposedPrice: Joi.number().min(0).optional().allow(null),
  instructions: Joi.string().optional().allow('', null),
}).options({ stripUnknown: true });

const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  feedback: Joi.string().optional().allow('', null),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const errors = error.details.map(d => d.message);
    console.warn('Validation failed:', errors, 'Body:', req.body);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = value; // Use validated/cleaned values
  next();
};

module.exports = { signupSchema, loginSchema, taskSchema, ratingSchema, validate };
