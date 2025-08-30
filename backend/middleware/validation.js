const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

// Contact form validation rules
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Project validation rules
const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['AI', 'Web'])
    .withMessage('Category must be either AI or Web'),
  body('image')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Image must be a valid URL'),
  body('imagePublicId')
    .optional()
    .trim()
    .custom((value) => !value || value.trim().length > 0)
    .withMessage('Image public ID must be a string'),
  body('githubUrl')
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('liveUrl')
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one item'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
];

// Personal info validation rules
const personalValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('tagline')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Tagline must be between 10 and 300 characters'),
  body('bio')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Bio must be between 50 and 2000 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const cleanedValue = value.replace(/\s+/g, '');
      return /^[\+]?[1-9][\d]{0,15}$/.test(cleanedValue) || 
             /^[\+]?[1-9][\d\s\-\(\)]{0,15}$/.test(value);
    })
    .withMessage('Please provide a valid phone number'),
  body('profileImageUrl')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Profile image must be a valid URL'),
  body('resumeUrl')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Resume must be a valid URL'),
  body('resumePublicId')
    .optional()
    .trim()
    .custom((value) => !value || value.trim().length > 0)
    .withMessage('Resume public ID must be a string'),
  body('profileImagePublicId')
    .optional()
    .trim()
    .custom((value) => !value || value.trim().length > 0)
    .withMessage('Profile image public ID must be a string'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill name must be between 1 and 100 characters'),
  body('skills.*.level')
    .isInt({ min: 0, max: 100 })
    .withMessage('Skill level must be between 0 and 100'),
  body('socialLinks.github')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('GitHub URL must be a valid URL'),
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('LinkedIn URL must be a valid URL'),
  body('socialLinks.twitter')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Twitter URL must be a valid URL'),
  body('socialLinks.email')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const emailValue = value.replace(/^mailto:/, '');
      return require('validator').isEmail(emailValue);
    })
    .withMessage('Contact email must be a valid email')
];

// Tech stack validation rules
const techStackValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('icon')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Icon must be between 1 and 100 characters'),
  body('color')
    .isHexColor()
    .withMessage('Color must be a valid hex color'),
  body('category')
    .isIn(['Frontend', 'Backend', 'Database', 'Tools', 'Cloud', 'Mobile'])
    .withMessage('Category must be one of: Frontend, Backend, Database, Tools, Cloud, Mobile'),
  body('logoUrl')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Logo URL must be a valid URL'),
  body('logoPublicId')
    .optional()
    .trim()
    .custom((value) => !value || value.trim().length > 0)
    .withMessage('Logo public ID must be a string'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
];

// NEW: Certificate validation rules
const certificateValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Certificate title must be between 2 and 200 characters'),
  body('issuer')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Issuer name must be between 2 and 100 characters'),
  body('issueDate')
    .isISO8601()
    .withMessage('Issue date must be a valid date')
    .custom((value) => {
      const issueDate = new Date(value);
      const now = new Date();
      if (issueDate > now) {
        throw new Error('Issue date cannot be in the future');
      }
      return true;
    }),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
    .custom((value, { req }) => {
      if (!value) return true;
      const expiryDate = new Date(value);
      const issueDate = new Date(req.body.issueDate);
      if (expiryDate <= issueDate) {
        throw new Error('Expiry date must be after issue date');
      }
      return true;
    }),
  body('credentialId')
    .optional()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('Credential ID must be less than 100 characters'),
  body('credentialUrl')
    .optional()
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Credential URL must be a valid URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 0, max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (!Array.isArray(tags)) return true;
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.trim().length === 0 || tag.length > 50) {
          throw new Error('Each tag must be a non-empty string with less than 50 characters');
        }
      }
      return true;
    }),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Priority must be an integer between 0 and 10'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Difficulty must be one of: Beginner, Intermediate, Advanced, Expert'),
  body('duration')
    .optional()
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('Duration must be less than 50 characters'),
  body('score')
    .optional()
    .trim()
    .isLength({ min: 0, max: 20 })
    .withMessage('Score must be less than 20 characters'),
  body('verificationStatus')
    .optional()
    .isIn(['Verified', 'Pending', 'Expired', 'Invalid'])
    .withMessage('Verification status must be one of: Verified, Pending, Expired, Invalid')
];

// NEW: Bulk operations validation
const bulkOperationValidation = [
  body('action')
    .isIn(['delete', 'updateStatus', 'updateVisibility'])
    .withMessage('Action must be one of: delete, updateStatus, updateVisibility'),
  body('certificateIds')
    .isArray({ min: 1 })
    .withMessage('Certificate IDs must be a non-empty array')
    .custom((ids) => {
      for (const id of ids) {
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
          throw new Error('All certificate IDs must be valid ObjectIds');
        }
      }
      return true;
    }),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
    .custom((data, { req }) => {
      const { action } = req.body;
      if (action === 'updateStatus' && typeof data.isActive !== 'boolean') {
        throw new Error('isActive must be a boolean for status updates');
      }
      if (action === 'updateVisibility' && typeof data.isPublic !== 'boolean') {
        throw new Error('isPublic must be a boolean for visibility updates');
      }
      return true;
    })
];

module.exports = {
  handleValidationErrors,
  loginValidation,
  contactValidation,
  projectValidation,
  personalValidation,
  techStackValidation,
  certificateValidation, // NEW
  bulkOperationValidation // NEW
};