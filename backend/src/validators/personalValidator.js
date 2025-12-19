const { z } = require('zod');

/**
 * Zod schema for skill object
 */
const skillSchema = z.object({
  name: z.string()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name must be less than 50 characters')
    .trim(),
  
  level: z.number()
    .int('Skill level must be an integer')
    .min(0, 'Skill level must be at least 0')
    .max(100, 'Skill level must be at most 100')
});

/**
 * Zod schema for social links object
 */
const socialLinksSchema = z.object({
  github: z.string().url('Invalid GitHub URL').or(z.literal('')).optional().default(''),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional().default(''),
  twitter: z.string().url('Invalid Twitter URL').or(z.literal('')).optional().default(''),
  email: z.string().email('Invalid email').or(z.literal('')).optional().default('')
});

/**
 * Zod schema for brand colors object
 */
const brandColorsSchema = z.object({
  primary: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color')
    .default('#3b82f6'),
  secondary: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Secondary color must be a valid hex color')
    .default('#8b5cf6'),
  accent: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Accent color must be a valid hex color')
    .default('#06b6d4')
});

/**
 * Zod schema for availability object
 */
const availabilitySchema = z.object({
  status: z.enum(['Available', 'Busy', 'Not Available'], {
    errorMap: () => ({ message: 'Status must be one of: Available, Busy, Not Available' })
  }).default('Available'),
  message: z.string()
    .max(200, 'Availability message must be less than 200 characters')
    .trim()
    .default('Available for work')
});

/**
 * Zod schema for resume object
 */
const resumeSchema = z.object({
  public_id: z.string().trim().optional().default(''),
  url: z.string().url('Invalid resume URL').or(z.literal('')).optional().default('')
});

/**
 * Zod schema for creating/updating personal information
 */
const personalSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  tagline: z.string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(200, 'Tagline must be less than 200 characters')
    .trim(),
  
  bio: z.string()
    .min(20, 'Bio must be at least 20 characters')
    .max(1000, 'Bio must be less than 1000 characters')
    .trim(),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .trim()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
    .optional(),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .trim()
    .optional(),
  
  profileImageUrl: z.string()
    .url('Invalid profile image URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  
  profileImagePublicId: z.string()
    .trim()
    .optional()
    .default(''),
  
  // Resume fields
  frontendResume: resumeSchema.optional().default({ public_id: '', url: '' }),
  backendResume: resumeSchema.optional().default({ public_id: '', url: '' }),
  generalResume: resumeSchema.optional().default({ public_id: '', url: '' }),
  
  // Skills array
  skills: z.array(skillSchema)
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed'),
  
  // Social links
  socialLinks: socialLinksSchema.optional().default({
    github: '',
    linkedin: '',
    twitter: '',
    email: ''
  }),
  
  // Brand colors
  brandColors: brandColorsSchema.optional().default({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4'
  }),
  
  // Tech stack highlights
  techStackHighlights: z.array(z.string().trim())
    .max(10, 'Maximum 10 tech stack highlights allowed')
    .optional()
    .default([]),
  
  // Availability
  availability: availabilitySchema.optional().default({
    status: 'Available',
    message: 'Available for work'
  })
});

/**
 * Zod schema for partial update (all fields optional)
 */
const updatePersonalSchema = personalSchema.partial();

module.exports = {
  personalSchema,
  updatePersonalSchema,
  skillSchema,
  socialLinksSchema,
  brandColorsSchema,
  availabilitySchema
};
