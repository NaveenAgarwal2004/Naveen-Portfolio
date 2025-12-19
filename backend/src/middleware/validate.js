const { ZodError } = require('zod');

/**
 * Middleware factory for Zod schema validation
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse and validate request body
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for better readability
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: formattedErrors
        });
      }
      
      // Pass other errors to error handler
      next(error);
    }
  };
};

/**
 * Middleware factory for query parameter validation
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          message: 'Query validation error',
          errors: formattedErrors
        });
      }
      
      next(error);
    }
  };
};

/**
 * Middleware factory for URL parameter validation
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          message: 'Parameter validation error',
          errors: formattedErrors
        });
      }
      
      next(error);
    }
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams
};
