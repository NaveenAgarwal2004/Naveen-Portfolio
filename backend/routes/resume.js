const express = require('express');
const multer = require('multer');
const Personal = require('../models/Personal');
const auth = require('../middleware/auth');
const { 
  cloudinary, 
  uploadPDFToCloudinary, 
  getPDFDownloadUrl, 
  getPDFViewUrl,
  deleteFromCloudinary 
} = require('../config/cloudinary');

const router = express.Router();

// Configure multer for memory storage (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Enhanced PDF validation
    const isPDF = file.mimetype === 'application/pdf' || 
                  file.originalname.toLowerCase().endsWith('.pdf');
    
    if (isPDF) {
      // Set proper mimetype if not set
      if (!file.mimetype || file.mimetype !== 'application/pdf') {
        file.mimetype = 'application/pdf';
      }
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// FIXED: Upload resume endpoint with proper PDF handling
router.post('/upload/:type', auth, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate resume type
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type. Must be frontend, backend, or general' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Validate file is actually PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        success: false,
        message: 'File must be a PDF document' 
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      // Create personal record if it doesn't exist
      const newPersonal = new Personal({
        name: 'Naveen Agarwal',
        email: 'naveenagarwal7624@gmail.com',
        frontendResume: { public_id: '', url: '' },
        backendResume: { public_id: '', url: '' },
        generalResume: { public_id: '', url: '' }
      });
      await newPersonal.save();
      personal = newPersonal;
    }

    // Delete old resume if exists
    const oldResume = personal[`${type}Resume`];
    if (oldResume && oldResume.public_id) {
      try {
        // Try deleting with both resource types to ensure cleanup
        await deleteFromCloudinary(oldResume.public_id, 'image');
      } catch (error) {
        console.error('Error deleting old resume (trying raw):', error);
        try {
          await deleteFromCloudinary(oldResume.public_id, 'raw');
        } catch (rawError) {
          console.error('Error deleting old resume (raw):', rawError);
        }
      }
    }

    // Generate filename
    const timestamp = Date.now();
    const cleanName = req.file.originalname
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `naveen_${type}_resume_${timestamp}`;

    // Upload to Cloudinary with proper PDF handling
    console.log(`Uploading ${type} resume: ${filename}`);
    
    const result = await uploadPDFToCloudinary(
      req.file.buffer,
      filename,
      'portfolio/resumes'
    );

    console.log('Cloudinary upload result:', {
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      size: result.bytes
    });

    // Update database with both view and download URLs
    personal[`${type}Resume`] = {
      public_id: result.public_id,
      url: result.url,
      viewUrl: result.viewUrl || result.url,
      downloadUrl: result.downloadUrl || getPDFDownloadUrl(result.url),
      originalName: req.file.originalname,
      size: result.bytes,
      uploadedAt: new Date()
    };
    
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume uploaded successfully`,
      data: {
        type: type,
        url: result.url,
        viewUrl: result.viewUrl,
        downloadUrl: result.downloadUrl,
        public_id: result.public_id,
        format: 'pdf',
        size: result.bytes,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload resume',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Alternative upload method using direct Cloudinary API
router.post('/upload-direct/:type', auth, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        message: 'Personal info not found' 
      });
    }

    // Delete old resume if exists
    const oldResume = personal[`${type}Resume`];
    if (oldResume && oldResume.public_id) {
      try {
        await cloudinary.uploader.destroy(oldResume.public_id, { 
          resource_type: 'image',
          invalidate: true 
        });
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    // Upload with explicit PDF settings
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image', // Changed from 'raw' to 'image'
          folder: 'portfolio/resumes',
          public_id: `naveen_${type}_resume_${Date.now()}`,
          format: 'pdf',
          type: 'upload',
          access_mode: 'public',
          flags: 'attachment', // This is crucial for proper PDF downloads
          context: {
            caption: req.file.originalname,
            alt: `${type} Resume`
          }
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // Save with proper URLs
    personal[`${type}Resume`] = {
      public_id: result.public_id,
      url: result.secure_url,
      viewUrl: result.secure_url,
      downloadUrl: getPDFDownloadUrl(result.secure_url),
      format: result.format || 'pdf',
      originalName: req.file.originalname,
      size: result.bytes
    };
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume uploaded successfully`,
      data: {
        type: type,
        url: result.secure_url,
        viewUrl: result.secure_url,
        downloadUrl: getPDFDownloadUrl(result.secure_url),
        public_id: result.public_id,
        format: 'pdf'
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload resume',
      error: error.message
    });
  }
});

// Delete resume endpoint
router.delete('/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type' 
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        message: 'Personal info not found' 
      });
    }

    const resume = personal[`${type}Resume`];
    if (!resume || !resume.public_id) {
      return res.status(404).json({ 
        success: false,
        message: `${type} resume not found` 
      });
    }

    // Try deleting with both resource types
    try {
      await deleteFromCloudinary(resume.public_id, 'image');
    } catch (error) {
      console.error('Error deleting as image, trying raw:', error);
      try {
        await deleteFromCloudinary(resume.public_id, 'raw');
      } catch (rawError) {
        console.error('Could not delete from Cloudinary:', rawError);
      }
    }

    // Clear from database
    personal[`${type}Resume`] = { 
      public_id: '', 
      url: '',
      viewUrl: '',
      downloadUrl: '',
      originalName: '',
      size: 0
    };
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume deleted successfully`
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete resume' 
    });
  }
});

// Get resume URLs with proper formatting
router.get('/urls', async (req, res) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        message: 'Personal info not found' 
      });
    }

    // Format resume data with proper URLs
    const formatResumeData = (resume) => {
      if (!resume || !resume.url) {
        return { 
          public_id: '', 
          url: '',
          viewUrl: '',
          downloadUrl: '',
          available: false
        };
      }

      return {
        public_id: resume.public_id || '',
        url: resume.url,
        viewUrl: resume.viewUrl || getPDFViewUrl(resume.url),
        downloadUrl: resume.downloadUrl || getPDFDownloadUrl(resume.url),
        originalName: resume.originalName || '',
        size: resume.size || 0,
        uploadedAt: resume.uploadedAt || null,
        available: true
      };
    };

    res.json({
      success: true,
      data: {
        frontendResume: formatResumeData(personal.frontendResume),
        backendResume: formatResumeData(personal.backendResume),
        generalResume: formatResumeData(personal.generalResume)
      }
    });
  } catch (error) {
    console.error('Error fetching resume URLs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch resume URLs' 
    });
  }
});

// Download resume endpoint (forces download)
router.get('/download/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type' 
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        message: 'Personal info not found' 
      });
    }

    const resume = personal[`${type}Resume`];
    if (!resume || !resume.url) {
      return res.status(404).json({ 
        success: false,
        message: `${type} resume not found` 
      });
    }

    // Generate download URL with proper headers
    const downloadUrl = resume.downloadUrl || getPDFDownloadUrl(resume.url);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Naveen_Agarwal_${type}_Resume.pdf"`);
    
    // Redirect to Cloudinary download URL
    res.redirect(downloadUrl);
  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to download resume' 
    });
  }
});

// View resume endpoint (inline viewing)
router.get('/view/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type' 
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({ 
        success: false,
        message: 'Personal info not found' 
      });
    }

    const resume = personal[`${type}Resume`];
    if (!resume || !resume.url) {
      return res.status(404).json({ 
        success: false,
        message: `${type} resume not found` 
      });
    }

    // Generate view URL (without attachment flag)
    const viewUrl = resume.viewUrl || getPDFViewUrl(resume.url);
    
    // Redirect to Cloudinary view URL
    res.redirect(viewUrl);
  } catch (error) {
    console.error('Resume view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view resume'
    });
  }
});

module.exports = router;