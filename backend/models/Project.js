const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  // Case Study Fields
  problem: {
    type: String,
    trim: true,
    default: ''
  },
  solution: {
    type: String,
    trim: true,
    default: ''
  },
  outcome: {
    type: String,
    trim: true,
    default: ''
  },
  // Enhanced Project Details
  detailedDescription: {
    type: String,
    trim: true,
    default: ''
  },
  demoCredentials: {
    username: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    }
  },
  category: {
    type: String,
    enum: ['AI', 'Web'],
    required: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  techStack: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    required: true,
    trim: true
  },
  liveUrl: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
projectSchema.index({ category: 1, featured: -1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);