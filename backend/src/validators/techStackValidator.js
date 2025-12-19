const { z } = require('zod');

/**
 * Zod schema for creating a new tech stack item
 */
const createTechStackSchema = z.object({
  name: z.string()
    .min(2, 'Technology name must be at least 2 characters')
    .max(50, 'Technology name must be less than 50 characters')
    .trim(),
  
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be less than 50 characters')
    .trim(),
  
  icon: z.string()
    .url('Invalid icon URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
    errorMap: () => ({ message: 'Proficiency must be one of: Beginner, Intermediate, Advanced, Expert' })
  }).default('Intermediate'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
    .default(''),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be non-negative')
    .optional()
    .default(0)
});

/**
 * Zod schema for updating a tech stack item (all fields optional)
 */
const updateTechStackSchema = createTechStackSchema.partial();

/**
 * Zod schema for tech stack query parameters
 */
const techStackQuerySchema = z.object({
  category: z.string().optional(),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional()
});

module.exports = {
  createTechStackSchema,
  updateTechStackSchema,
  techStackQuerySchema
};
