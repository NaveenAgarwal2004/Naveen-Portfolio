const { z } = require('zod');

/**
 * Zod schema for SEO metadata
 */
const seoSchema = z.object({
  page: z.enum(['home', 'about', 'projects', 'contact'], {
    errorMap: () => ({ message: 'Page must be one of: home, about, projects, contact' })
  }),
  
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(60, 'Title must be less than 60 characters (SEO best practice)')
    .trim(),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(160, 'Description must be less than 160 characters (SEO best practice)')
    .trim(),
  
  keywords: z.string()
    .max(200, 'Keywords must be less than 200 characters')
    .trim()
    .optional()
    .default(''),
  
  twitterHandle: z.string()
    .regex(/^@?[a-zA-Z0-9_]{1,15}$/, 'Twitter handle must be valid (1-15 characters)')
    .trim()
    .optional()
    .default(''),
  
  canonicalUrl: z.string()
    .url('Canonical URL must be a valid URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  
  ogImage: z.string()
    .url('OG image must be a valid URL')
    .or(z.literal(''))
    .optional()
    .default('')
});

/**
 * Zod schema for updating SEO (partial update)
 */
const updateSeoSchema = seoSchema.partial().required({ page: true });

module.exports = {
  seoSchema,
  updateSeoSchema
};
