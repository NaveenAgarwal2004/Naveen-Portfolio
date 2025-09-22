const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  profileImageUrl: {
    type: String,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    default: ''
  },
  // Enhanced resume fields with better structure
  frontendResume: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  backendResume: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  generalResume: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  // Enhanced certificates field with image support and advanced features
  certificates: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    },
    credentialUrl: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    // Certificate image (actual certificate document/image)
    certificateImage: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' }
    },
    // Issuer logo
    logo: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' }
    },
    // New fields for enhanced functionality
    tags: [{
      type: String,
      trim: true
    }],
    priority: {
      type: Number,
      default: 0,
      min: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Metadata
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    duration: {
      type: String,
      trim: true // e.g., "3 months", "6 weeks"
    },
    score: {
      type: String,
      trim: true // e.g., "95%", "Pass", "Distinction"
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Expired', 'Invalid'],
      default: 'Verified'
    }
  }],
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  // Branding and Enhanced Fields
  heroBackground: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  personalLogo: {
    public_id: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  brandColors: {
    primary: { type: String, default: '#3b82f6' },
    secondary: { type: String, default: '#8b5cf6' },
    accent: { type: String, default: '#06b6d4' }
  },
  techStackHighlights: [{
    type: String,
    trim: true
  }],
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Not Available'],
      default: 'Available'
    },
    message: {
      type: String,
      default: 'Available for work'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
personalSchema.index({ 'certificates.issueDate': -1 });
personalSchema.index({ 'certificates.expiryDate': 1 });
personalSchema.index({ 'certificates.tags': 1 });
personalSchema.index({ 'certificates.isPublic': 1 });
personalSchema.index({ 'certificates.isActive': 1 });

module.exports = mongoose.model('Personal', personalSchema);