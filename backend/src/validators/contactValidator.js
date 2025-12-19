const { z } = require('zod');

/**
 * Zod schema for contact form submission
 */
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .max(255, 'Email must be less than 255 characters'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim()
    .refine(
      (msg) => {
        // Check if message contains at least one word (not just special characters)
        return /[a-zA-Z]{2,}/.test(msg);
      },
      'Message must contain actual words'
    )
});

/**
 * Zod schema for updating contact status (admin)
 */
const updateContactStatusSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'archived'], {
    errorMap: () => ({ message: 'Status must be one of: new, read, replied, archived' })
  })
});

module.exports = {
  contactSchema,
  updateContactStatusSchema
};
