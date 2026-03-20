const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'helper').default('user'),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  age: Joi.number().min(18).max(120).optional(),
  city: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  helperId: Joi.string().required(),
  serviceType: Joi.string().required(),
  description: Joi.string().optional(),
  proposedPrice: Joi.number().min(0).optional(),
  instructions: Joi.string().optional(),
});

const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  feedback: Joi.string().optional(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

module.exports = { signupSchema, loginSchema, taskSchema, ratingSchema, validate };
