const express = require('express');
const Personal = require('../models/Personal');
const auth = require('../middleware/auth');
const { 
  uploadCertificateImage, 
  uploadCertificateLogo, 
  deleteFromCloudinary,
  generateImageVariants 
} = require('../config/cloudinary');
const { 
  certificateValidation, 
  bulkOperationValidation, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// ============= PUBLIC ROUTES =============

// Get all public certificates with enhanced filtering
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      tags, 
      active = 'true', 
      expired,
      search,
      limit = 50,
      offset = 0,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = req.query;

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    let certificates = personal.certificates.filter(cert => 
      cert.isPublic && (active !== 'false' ? cert.isActive : true)
    );

    // Apply filters
    if (expired === 'true') {
      certificates = certificates.filter(cert => 
        cert.expiryDate && new Date(cert.expiryDate) < new Date()
      );
    } else if (expired === 'false') {
      certificates = certificates.filter(cert => 
        !cert.expiryDate || new Date(cert.expiryDate) >= new Date()
      );
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      certificates = certificates.filter(cert =>
        cert.tags && cert.tags.some(tag => tagArray.includes(tag))
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      certificates = certificates.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm) ||
        cert.issuer.toLowerCase().includes(searchTerm) ||
        (cert.description && cert.description.toLowerCase().includes(searchTerm)) ||
        (cert.tags && cert.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Apply sorting
    certificates.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'issuer':
          aValue = a.issuer.toLowerCase();
          bValue = b.issuer.toLowerCase();
          break;
        case 'expiryDate':
          aValue = a.expiryDate ? new Date(a.expiryDate) : new Date('2099-12-31');
          bValue = b.expiryDate ? new Date(b.expiryDate) : new Date('2099-12-31');
          break;
        case 'priority':
          aValue = a.priority || 0;
          bValue = b.priority || 0;
          break;
        case 'issueDate':
        default:
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Apply pagination
    const total = certificates.length;
    const paginatedCertificates = certificates.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    // Add computed fields
    const enrichedCertificates = paginatedCertificates.map(cert => ({
      ...cert.toObject(),
      isExpired: cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false,
      isExpiringSoon: cert.expiryDate ? 
        (new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 90 && 
        new Date(cert.expiryDate) >= new Date() : false,
      daysUntilExpiry: cert.expiryDate ? 
        Math.ceil((new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));
    
    res.json({
      success: true,
      data: enrichedCertificates,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
});

// Get certificate statistics (public route)
router.get('/stats', async (req, res) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const certificates = personal.certificates.filter(cert => cert.isPublic && cert.isActive);
    const now = new Date();
    
    const stats = {
      total: certificates.length,
      active: certificates.filter(cert => !cert.expiryDate || new Date(cert.expiryDate) >= now).length,
      expired: certificates.filter(cert => cert.expiryDate && new Date(cert.expiryDate) < now).length,
      expiring: certificates.filter(cert => {
        if (!cert.expiryDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(cert.expiryDate) - now) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }).length,
      byIssuer: {},
      byDifficulty: {},
      recentlyAdded: certificates.filter(cert => {
        const daysSinceIssue = Math.ceil((now - new Date(cert.issueDate)) / (1000 * 60 * 60 * 24));
        return daysSinceIssue <= 30;
      }).length
    };

    // Group by issuer
    certificates.forEach(cert => {
      stats.byIssuer[cert.issuer] = (stats.byIssuer[cert.issuer] || 0) + 1;
    });

    // Group by difficulty
    certificates.forEach(cert => {
      const difficulty = cert.difficulty || 'Intermediate';
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate statistics'
    });
  }
});

// ============= ADMIN ROUTES =============

// Get all certificates (admin only) - includes private certificates
router.get('/admin/all', auth, async (req, res) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    // Return all certificates for admin
    const enrichedCertificates = personal.certificates.map(cert => ({
      ...cert.toObject(),
      isExpired: cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false,
      isExpiringSoon: cert.expiryDate ? 
        (new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 90 && 
        new Date(cert.expiryDate) >= new Date() : false,
      daysUntilExpiry: cert.expiryDate ? 
        Math.ceil((new Date(cert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));

    res.json({
      success: true,
      data: enrichedCertificates
    });
  } catch (error) {
    console.error('Error fetching all certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
});

// Add new certificate (admin only)
router.post('/', auth, certificateValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      issuer,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      description,
      tags,
      priority,
      isPublic,
      difficulty,
      duration,
      score
    } = req.body;

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
      tags: tags ? tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      priority: priority || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
      difficulty: difficulty || 'Intermediate',
      duration: duration ? duration.trim() : '',
      score: score ? score.trim() : '',
      certificateImage: { public_id: '', url: '' },
      logo: { public_id: '', url: '' },
      isActive: true,
      verificationStatus: 'Verified'
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
router.put('/:id', auth, certificateValidation, handleValidationErrors, async (req, res) => {
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
        } else if (key === 'tags' && Array.isArray(updateData[key])) {
          personal.certificates[certificateIndex][key] = updateData[key].map(tag => tag.trim()).filter(tag => tag.length > 0);
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

    // Delete both logo and certificate image from Cloudinary
    const deletePromises = [];
    
    if (certificate.logo && certificate.logo.public_id) {
      deletePromises.push(deleteFromCloudinary(certificate.logo.public_id));
    }
    
    if (certificate.certificateImage && certificate.certificateImage.public_id) {
      deletePromises.push(deleteFromCloudinary(certificate.certificateImage.public_id));
    }

    // Execute deletions in parallel
    if (deletePromises.length > 0) {
      try {
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error deleting files from Cloudinary:', error);
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

// Upload certificate image (admin only)
router.post('/:id/image', auth, uploadCertificateImage.single('certificateImage'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No certificate image file uploaded'
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

    // Delete old certificate image if exists
    if (certificate.certificateImage && certificate.certificateImage.public_id) {
      try {
        await deleteFromCloudinary(certificate.certificateImage.public_id);
      } catch (error) {
        console.error('Error deleting old certificate image:', error);
      }
    }

    // Update certificate with new image
    personal.certificates[certificateIndex].certificateImage = {
      public_id: req.file.public_id,
      url: req.file.path
    };
    await personal.save();

    // Generate image variants for better performance
    const imageVariants = generateImageVariants(req.file.public_id);

    res.json({
      success: true,
      message: 'Certificate image uploaded successfully',
      data: {
        url: req.file.path,
        public_id: req.file.public_id,
        variants: imageVariants
      }
    });
  } catch (error) {
    console.error('Certificate image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate image'
    });
  }
});

// Upload certificate logo (admin only)
router.post('/:id/logo', auth, uploadCertificateLogo.single('logo'), async (req, res) => {
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
        await deleteFromCloudinary(certificate.logo.public_id);
      } catch (error) {
        console.error('Error deleting old certificate logo:', error);
      }
    }

    // Update certificate with new logo
    personal.certificates[certificateIndex].logo = {
      public_id: req.file.public_id,
      url: req.file.path
    };
    await personal.save();

    res.json({
      success: true,
      message: 'Certificate logo uploaded successfully',
      data: {
        url: req.file.path,
        public_id: req.file.public_id
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

// Bulk operations (admin only)
router.post('/bulk', auth, bulkOperationValidation, handleValidationErrors, async (req, res) => {
  try {
    const { action, certificateIds, data: updateData } = req.body;

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    let affectedCount = 0;

    switch (action) {
      case 'delete':
        // Delete selected certificates
        const certificatesToDelete = personal.certificates.filter(cert => 
          certificateIds.includes(cert._id.toString())
        );
        
        // Delete associated files from Cloudinary
        for (const cert of certificatesToDelete) {
          const deletePromises = [];
          if (cert.logo?.public_id) {
            deletePromises.push(deleteFromCloudinary(cert.logo.public_id));
          }
          if (cert.certificateImage?.public_id) {
            deletePromises.push(deleteFromCloudinary(cert.certificateImage.public_id));
          }
          
          if (deletePromises.length > 0) {
            try {
              await Promise.all(deletePromises);
            } catch (error) {
              console.error('Error deleting files for certificate:', cert._id, error);
            }
          }
        }
        
        personal.certificates = personal.certificates.filter(cert => 
          !certificateIds.includes(cert._id.toString())
        );
        affectedCount = certificatesToDelete.length;
        break;

      case 'updateStatus':
        // Update active status
        personal.certificates.forEach(cert => {
          if (certificateIds.includes(cert._id.toString())) {
            cert.isActive = updateData.isActive;
            affectedCount++;
          }
        });
        break;

      case 'updateVisibility':
        // Update public visibility
        personal.certificates.forEach(cert => {
          if (certificateIds.includes(cert._id.toString())) {
            cert.isPublic = updateData.isPublic;
            affectedCount++;
          }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action. Supported actions: delete, updateStatus, updateVisibility'
        });
    }

    await personal.save();

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: { affectedCount }
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
});

// Export certificates (admin only)
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const certificates = personal.certificates.map(cert => ({
      id: cert._id,
      title: cert.title,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      credentialId: cert.credentialId,
      credentialUrl: cert.credentialUrl,
      description: cert.description,
      tags: cert.tags,
      difficulty: cert.difficulty,
      duration: cert.duration,
      score: cert.score,
      priority: cert.priority,
      isPublic: cert.isPublic,
      isActive: cert.isActive,
      verificationStatus: cert.verificationStatus,
      hasImage: !!(cert.certificateImage && cert.certificateImage.url),
      hasLogo: !!(cert.logo && cert.logo.url)
    }));

    if (format === 'csv') {
      // Generate CSV format
      const csvHeaders = [
        'ID', 'Title', 'Issuer', 'Issue Date', 'Expiry Date', 'Credential ID', 
        'Credential URL', 'Description', 'Tags', 'Difficulty', 'Duration', 
        'Score', 'Priority', 'Public', 'Active', 'Verification Status', 'Has Image', 'Has Logo'
      ];
      
      const csvRows = certificates.map(cert => [
        cert.id,
        cert.title,
        cert.issuer,
        cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
        cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
        cert.credentialId || '',
        cert.credentialUrl || '',
        (cert.description || '').replace(/"/g, '""'), // Escape quotes in CSV
        (cert.tags || []).join('; '),
        cert.difficulty || '',
        cert.duration || '',
        cert.score || '',
        cert.priority || 0,
        cert.isPublic ? 'Yes' : 'No',
        cert.isActive ? 'Yes' : 'No',
        cert.verificationStatus || 'Verified',
        cert.hasImage ? 'Yes' : 'No',
        cert.hasLogo ? 'Yes' : 'No'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="certificates-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Default JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="certificates-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        success: true,
        data: certificates,
        exportDate: new Date().toISOString(),
        totalCount: certificates.length
      });
    }
  } catch (error) {
    console.error('Error exporting certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export certificates'
    });
  }
});

// Get available tags (admin only)
router.get('/tags', auth, async (req, res) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    // Extract all unique tags
    const allTags = personal.certificates.reduce((tags, cert) => {
      if (cert.tags) {
        tags.push(...cert.tags);
      }
      return tags;
    }, []);

    const uniqueTags = [...new Set(allTags)].sort();

    // Also provide tag statistics
    const tagStats = {};
    personal.certificates.forEach(cert => {
      if (cert.tags) {
        cert.tags.forEach(tag => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      }
    });

    res.json({
      success: true,
      data: {
        tags: uniqueTags,
        stats: tagStats
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
});

// Get single certificate (admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const personal = await Personal.findOne();
    if (!personal) {
      return res.status(404).json({
        success: false,
        message: 'Personal info not found'
      });
    }

    const certificate = personal.certificates.find(cert => cert._id.toString() === id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Add computed fields
    const enrichedCertificate = {
      ...certificate.toObject(),
      isExpired: certificate.expiryDate ? new Date(certificate.expiryDate) < new Date() : false,
      isExpiringSoon: certificate.expiryDate ? 
        (new Date(certificate.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 90 && 
        new Date(certificate.expiryDate) >= new Date() : false,
      daysUntilExpiry: certificate.expiryDate ? 
        Math.ceil((new Date(certificate.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
    };

    res.json({
      success: true,
      data: enrichedCertificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate'
    });
  }
});

module.exports = router;