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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for logos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ============= PUBLIC ROUTES =============

// Get all certificates (public route)
router.get('/', async (req, res) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const activeCertificates = personal.certificates.filter(cert => cert.isActive);
    
    res.json({
      success: true,
      data: activeCertificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
});

// ============= ADMIN ROUTES =============

// Add new certificate (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      description
    } = req.body;

    if (!title || !issuer || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, issuer, and issue date are required'
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const newCertificate = {
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialId: credentialId ? credentialId.trim() : '',
      credentialUrl: credentialUrl ? credentialUrl.trim() : '',
      description: description ? description.trim() : '',
      logo: { public_id: '', url: '' },
      isActive: true
    };

    personal.certificates.push(newCertificate);
    await personal.save();

    const addedCertificate = personal.certificates[personal.certificates.length - 1];

    res.status(201).json({
      success: true,
      message: 'Certificate added successfully',
      data: addedCertificate
    });
  } catch (error) {
    console.error('Error adding certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add certificate'
    });
  }
});

// Update certificate (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const certificateIndex = personal.certificates.findIndex(cert => cert._id.toString() === id);
    if (certificateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Update certificate fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && updateData[key] !== undefined) {
        if (key === 'issueDate' || key === 'expiryDate') {
          personal.certificates[certificateIndex][key] = updateData[key] ? new Date(updateData[key]) : null;
        } else {
          personal.certificates[certificateIndex][key] = updateData[key];
        }
      }
    });

    await personal.save();

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: personal.certificates[certificateIndex]
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update certificate'
    });
  }
});

// Delete certificate (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const certificateIndex = personal.certificates.findIndex(cert => cert._id.toString() === id);
    if (certificateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const certificate = personal.certificates[certificateIndex];

    // Delete logo from Cloudinary if exists
    if (certificate.logo && certificate.logo.public_id) {
      try {
        await cloudinary.uploader.destroy(certificate.logo.public_id);
      } catch (error) {
        console.error('Error deleting certificate logo from Cloudinary:', error);
      }
    }

    personal.certificates.splice(certificateIndex, 1);
    await personal.save();

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate'
    });
  }
});

// Upload certificate logo (admin only)
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file uploaded'
      });
    }

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const certificateIndex = personal.certificates.findIndex(cert => cert._id.toString() === id);
    if (certificateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const certificate = personal.certificates[certificateIndex];

    // Delete old logo if exists
    if (certificate.logo && certificate.logo.public_id) {
      try {
        await cloudinary.uploader.destroy(certificate.logo.public_id);
      } catch (error) {
        console.error('Error deleting old certificate logo:', error);
      }
    }

    // Upload new logo to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'portfolio/certificates',
          public_id: `certificate-logo-${id}-${Date.now()}`,
          transformation: [
            { width: 200, height: 200, crop: 'fit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update certificate with new logo
    personal.certificates[certificateIndex].logo = {
      public_id: result.public_id,
      url: result.secure_url
    };
    await personal.save();

    res.json({
      success: true,
      message: 'Certificate logo uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Certificate logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate logo'
    });
  }
});

module.exports = router;