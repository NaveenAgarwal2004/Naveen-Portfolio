const { z } = require('zod');

/**
 * Zod schema for certificate image object
 */
const certificateImageSchema = z.object({
  public_id: z.string().trim().optional().default(''),
  url: z.string().url('Invalid certificate image URL').or(z.literal('')).optional().default('')
});

/**
 * Zod schema for creating a new certificate
 */
const createCertificateSchema = z.object({
  title: z.string()
    .min(3, 'Certificate title must be at least 3 characters')
    .max(200, 'Certificate title must be less than 200 characters')
    .trim(),
  
  issuer: z.string()
    .min(2, 'Issuer name must be at least 2 characters')
    .max(100, 'Issuer name must be less than 100 characters')
    .trim(),
  
  issueDate: z.string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Invalid issue date'),
  
  expiryDate: z.string()
    .or(z.date())
    .transform((val) => val ? new Date(val) : undefined)
    .refine((date) => !date || !isNaN(date.getTime()), 'Invalid expiry date')
    .optional(),
  
  credentialId: z.string()
    .max(100, 'Credential ID must be less than 100 characters')
    .trim()
    .optional()
    .default(''),
  
  credentialUrl: z.string()
    .url('Invalid credential URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional()
    .default(''),
  
  certificateImage: certificateImageSchema.optional().default({ public_id: '', url: '' }),
  
  logo: certificateImageSchema.optional().default({ public_id: '', url: '' }),
  
  tags: z.array(z.string().trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  
  priority: z.number()
    .int('Priority must be an integer')
    .min(0, 'Priority must be non-negative')
    .optional()
    .default(0),
  
  isPublic: z.boolean()
    .optional()
    .default(true),
  
  isActive: z.boolean()
    .optional()
    .default(true),
  
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
    errorMap: () => ({ message: 'Difficulty must be one of: Beginner, Intermediate, Advanced, Expert' })
  }).optional().default('Intermediate'),
  
  duration: z.string()
    .max(50, 'Duration must be less than 50 characters')
    .trim()
    .optional()
    .default(''),
  
  score: z.string()
    .max(50, 'Score must be less than 50 characters')
    .trim()
    .optional()
    .default(''),
  
  verificationStatus: z.enum(['Verified', 'Pending', 'Expired', 'Invalid'], {
    errorMap: () => ({ message: 'Verification status must be one of: Verified, Pending, Expired, Invalid' })
  }).optional().default('Verified')
});

/**
 * Zod schema for updating a certificate (all fields optional)
 */
const updateCertificateSchema = createCertificateSchema.partial();

/**
 * Zod schema for certificate query parameters
 */
const certificateQuerySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  isPublic: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional().default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional().default('20')
});

module.exports = {
  createCertificateSchema,
  updateCertificateSchema,
  certificateQuerySchema
};
