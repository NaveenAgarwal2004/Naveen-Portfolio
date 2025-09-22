const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
    default: ''
  },
  credentialId: {
    type: String,
    trim: true,
    default: ''
  },
  credentialUrl: {
    type: String,
    trim: true,
    default: ''
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  skills: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    trim: true,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    trim: true,
    default: ''
  },
  logoPublicId: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Pending', 'Expired', 'Invalid'],
    default: 'Verified'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  duration: {
    type: String,
    trim: true,
    default: ''
  },
  score: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
certificateSchema.index({ isActive: 1, isPublic: 1, priority: -1, createdAt: -1 });
certificateSchema.index({ issuer: 1 });
certificateSchema.index({ tags: 1 });
certificateSchema.index({ skills: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
