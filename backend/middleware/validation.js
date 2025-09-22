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

// FIXED: Project validation rules with proper optional fields and array handling
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
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('imagePublicId')
    .optional({ checkFalsy: true })
    .trim(),
  body('githubUrl')
    .trim()
    .notEmpty()
    .withMessage('GitHub URL is required')
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('liveUrl')
    .trim()
    .notEmpty()
    .withMessage('Live URL is required')
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('Tech stack must be an array with at least one item')
    .custom((techStack) => {
      // Ensure all tech stack items are valid strings
      if (!Array.isArray(techStack)) {
        throw new Error('Tech stack must be an array');
      }
      for (let i = 0; i < techStack.length; i++) {
        const item = techStack[i];
        if (typeof item !== 'string') {
          throw new Error(`Tech stack item at index ${i} must be a string, got ${typeof item}`);
        }
        if (item.trim().length === 0) {
          throw new Error(`Tech stack item at index ${i} cannot be empty`);
        }
        if (item.trim().length > 50) {
          throw new Error(`Tech stack item at index ${i} must be less than 50 characters`);
        }
      }
      return true;
    })
    .customSanitizer((techStack) => {
      // Sanitize the array by trimming whitespace and filtering out empty items
      if (!Array.isArray(techStack)) return techStack;
      return techStack
        .map(item => typeof item === 'string' ? item.trim() : item)
        .filter(item => item && item.length > 0);
    }),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt(),
  // ADDED: Case study fields validation (optional)
  body('problem')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Problem description must be less than 2000 characters'),
  body('solution')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Solution description must be less than 2000 characters'),
  body('outcome')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Outcome description must be less than 2000 characters'),
  body('detailedDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Detailed description must be less than 3000 characters'),
  // ADDED: Demo credentials (optional)
  body('demoCredentials.username')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Demo username must be less than 100 characters'),
  body('demoCredentials.password')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Demo password must be less than 100 characters')
];

// SEO validation rules
const seoValidation = [
  body('page')
    .isIn(['home', 'about', 'projects', 'contact'])
    .withMessage('Page must be one of: home, about, projects, contact'),
  body('title')
    .trim()
    .isLength({ min: 10, max: 60 })
    .withMessage('Title must be between 10 and 60 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 160 })
    .withMessage('Description must be between 50 and 160 characters'),
  body('keywords')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Keywords must be less than 200 characters'),
  body('twitterHandle')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^@?[a-zA-Z0-9_]{1,15}$/)
    .withMessage('Twitter handle must be valid (1-15 characters, letters, numbers, underscore)'),
  body('canonicalUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Canonical URL must be a valid URL')
];

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
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      const cleanedValue = value.replace(/\s+/g, '');
      return /^[\+]?[1-9][\d]{0,15}$/.test(cleanedValue) || 
             /^[\+]?[1-9][\d\s\-\(\)]{0,15}$/.test(value);
    })
    .withMessage('Please provide a valid phone number'),
  body('profileImageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Profile image must be a valid URL'),
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
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('GitHub URL must be a valid URL'),
  body('socialLinks.linkedin')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('LinkedIn URL must be a valid URL'),
  body('socialLinks.twitter')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Twitter URL must be a valid URL'),
  body('socialLinks.email')
    .optional({ checkFalsy: true })
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
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Logo URL must be a valid URL'),
  body('logoPublicId')
    .optional({ checkFalsy: true })
    .trim(),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
    .toInt()
];

// Certificate validation rules
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
    .optional({ checkFalsy: true })
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
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('Credential ID must be less than 100 characters'),
  body('credentialUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => !value || require('validator').isURL(value))
    .withMessage('Credential URL must be a valid URL'),
  body('description')
    .optional({ checkFalsy: true })
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
    .withMessage('Priority must be an integer between 0 and 10')
    .toInt(),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('difficulty')
    .optional({ checkFalsy: true })
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Difficulty must be one of: Beginner, Intermediate, Advanced, Expert'),
  body('duration')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('Duration must be less than 50 characters'),
  body('score')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 0, max: 20 })
    .withMessage('Score must be less than 20 characters'),
  body('verificationStatus')
    .optional({ checkFalsy: true })
    .isIn(['Verified', 'Pending', 'Expired', 'Invalid'])
    .withMessage('Verification status must be one of: Verified, Pending, Expired, Invalid')
];

// Bulk operations validation
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
  certificateValidation,
  bulkOperationValidation,
  seoValidation // ADDED
};