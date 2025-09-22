const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ['home', 'about', 'projects', 'contact']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  keywords: {
    type: String,
    trim: true,
    default: ''
  },
  ogImage: {
    type: String,
    trim: true,
    default: ''
  },
  ogImagePublicId: {
    type: String,
    default: ''
  },
  twitterHandle: {
    type: String,
    trim: true,
    default: ''
  },
  canonicalUrl: {
    type: String,
    trim: true,
    default: ''
  },
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
seoSchema.index({ page: 1, isActive: 1 });

module.exports = mongoose.model('SEO', seoSchema);