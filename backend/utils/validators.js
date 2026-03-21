const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({ 'string.min': 'Name must be at least 2 characters', 'any.required': 'Name is required' }),
  email: Joi.string().email().required()
    .messages({ 'string.email': 'Please enter a valid email address', 'any.required': 'Email is required' }),
  password: Joi.string().min(6).required()
    .messages({ 'string.min': 'Password must be at least 6 characters', 'any.required': 'Password is required' }),
  role: Joi.string().valid('user', 'helper').default('user'),
  phone: Joi.string().optional().allow('', null),
  age: Joi.number().optional().allow(null, ''),
  city: Joi.string().optional().allow('', null),
}).options({ stripUnknown: true });

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
