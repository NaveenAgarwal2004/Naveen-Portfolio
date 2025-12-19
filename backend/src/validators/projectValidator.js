const { z } = require('zod');

/**
 * Zod schema for creating a new project
 */
const createProjectSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  
  detailedDescription: z.string()
    .max(2000, 'Detailed description must be less than 2000 characters')
    .trim()
    .optional()
    .default(''),
  
  category: z.enum(['AI', 'Web'], {
    errorMap: () => ({ message: 'Category must be either "AI" or "Web"' })
  }),
  
  featured: z.boolean()
    .default(false)
    .optional(),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be non-negative')
    .optional()
    .default(0),
  
  techStack: z.array(z.string().trim())
    .min(1, 'At least one technology is required')
    .max(15, 'Maximum 15 technologies allowed'),
  
  githubUrl: z.string()
    .trim()
    .url('Invalid GitHub URL')
    .refine(
      (url) => url.includes('github.com') || url === '',
      'Must be a valid GitHub URL'
    ),
  
  liveUrl: z.string()
    .trim()
    .url('Invalid live URL')
    .or(z.literal('')),
  
  // Case Study fields
  problem: z.string()
    .max(1000, 'Problem description must be less than 1000 characters')
    .trim()
    .optional()
    .default(''),
  
  solution: z.string()
    .max(1000, 'Solution description must be less than 1000 characters')
    .trim()
    .optional()
    .default(''),
  
  outcome: z.string()
    .max(1000, 'Outcome description must be less than 1000 characters')
    .trim()
    .optional()
    .default(''),
  
  // Demo credentials
  demoCredentials: z.object({
    username: z.string().trim().optional().default(''),
    password: z.string().trim().optional().default('')
  }).optional().default({ username: '', password: '' }),
  
  // Image fields (handled by Cloudinary upload)
  image: z.string()
    .trim()
    .url('Invalid image URL')
    .or(z.literal('')),
  
  imagePublicId: z.string()
    .trim()
    .optional()
    .default('')
});

/**
 * Zod schema for updating a project (all fields optional)
 */
const updateProjectSchema = createProjectSchema.partial();

/**
 * Zod schema for project query parameters
 */
const projectQuerySchema = z.object({
  category: z.enum(['AI', 'Web', 'all']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional().default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('20')
});

/**
 * Zod schema for MongoDB ObjectId validation
 */
const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format')
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  mongoIdSchema
};
