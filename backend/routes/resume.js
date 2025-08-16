const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Personal = require('../models/Personal');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload resume endpoint
router.post('/upload/:type', auth, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ error: 'Invalid resume type' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ error: 'Personal info not found' });
    }

    // Delete old resume if exists
    const oldResume = personal[`${type}Resume`];
    if (oldResume && oldResume.public_id) {
      try {
        await cloudinary.uploader.destroy(oldResume.public_id, { resource_type: 'raw' });
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    // Upload new resume to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'portfolio/resumes',
          public_id: `naveen-${type}-resume-${Date.now()}`,
          allowed_formats: ['pdf']
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update database
    personal[`${type}Resume`] = {
      public_id: result.public_id,
      url: result.secure_url
    };
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume uploaded successfully`,
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Delete resume endpoint
router.delete('/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ error: 'Invalid resume type' });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ error: 'Personal info not found' });
    }

    const resume = personal[`${type}Resume`];
    if (!resume || !resume.public_id) {
      return res.status(404).json({ error: `${type} resume not found` });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(resume.public_id, { resource_type: 'raw' });

    // Remove from database
    personal[`${type}Resume`] = { public_id: '', url: '' };
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume deleted successfully`
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Get resume URLs
router.get('/urls', async (req, res) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ error: 'Personal info not found' });
    }

    res.json({
      success: true,
      data: {
        frontendResume: personal.frontendResume || { public_id: '', url: '' },
        backendResume: personal.backendResume || { public_id: '', url: '' },
        generalResume: personal.generalResume || { public_id: '', url: '' }
      }
    });
  } catch (error) {
    console.error('Error fetching resume URLs:', error);
    res.status(500).json({ error: 'Failed to fetch resume URLs' });
  }
});

module.exports = router;
