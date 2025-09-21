const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Production-ready PDF serving with better error handling
router.get('/pdf/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type. Valid types: frontend, backend, general' 
      });
    }

    // First try to get URLs from database (Cloudinary)
    const Personal = require('../models/Personal');
    const personal = await Personal.findOne();

    if (personal && personal[`${type}Resume`] && personal[`${type}Resume`].url) {
      const cloudinaryUrl = personal[`${type}Resume`].url;
      
      // Try to proxy the Cloudinary URL
      try {
        const axios = require('axios');
        const response = await axios({
          method: 'GET',
          url: cloudinaryUrl,
          responseType: 'stream',
          timeout: 10000,
          headers: {
            'User-Agent': 'Portfolio-Backend/1.0'
          }
        });

        // Set headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Naveen_Agarwal_${type}_Resume.pdf"`);
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Stream the PDF
        response.data.pipe(res);
        return;

      } catch (cloudinaryError) {
        console.log(`Cloudinary proxy failed for ${type}: ${cloudinaryError.message}`);
        // Continue to fallback options
      }
    }

    // Fallback to local files (if available)
    const resumeFiles = {
      frontend: 'Naveen Agarwal - Frontend.pdf',
      backend: 'NaveenAgarwal_Backend.pdf',
      general: 'NaveenAgarwal__Resume.pdf'
    };

    const filename = resumeFiles[type];
    const filePath = path.join(__dirname, '..', filename);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);

      // Set headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `inline; filename="Naveen_Agarwal_${type}_Resume.pdf"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      return;
    }

    // If all else fails, return appropriate error
    return res.status(404).json({
      success: false,
      message: `${type} resume not available. Please contact the administrator.`,
      details: 'Resume file not found in database or local storage'
    });

  } catch (error) {
    console.error('Production PDF serve error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while serving PDF',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint for PDF service
router.get('/health', async (req, res) => {
  try {
    const Personal = require('../models/Personal');
    const personal = await Personal.findOne();

    const resumeStatus = {
      frontend: { cloudinary: false, local: false },
      backend: { cloudinary: false, local: false },
      general: { cloudinary: false, local: false }
    };

    // Check Cloudinary availability
    ['frontend', 'backend', 'general'].forEach(type => {
      if (personal && personal[`${type}Resume`] && personal[`${type}Resume`].url) {
        resumeStatus[type].cloudinary = true;
      }
    });

    // Check local files
    const resumeFiles = {
      frontend: 'Naveen Agarwal - Frontend.pdf',
      backend: 'NaveenAgarwal_Backend.pdf',
      general: 'NaveenAgarwal__Resume.pdf'
    };

    Object.keys(resumeFiles).forEach(type => {
      const filePath = path.join(__dirname, '..', resumeFiles[type]);
      if (fs.existsSync(filePath)) {
        resumeStatus[type].local = true;
      }
    });

    res.json({
      success: true,
      message: 'PDF service health check',
      resumeStatus,
      totalAvailable: Object.values(resumeStatus).reduce((count, status) => 
        count + (status.cloudinary || status.local ? 1 : 0), 0
      )
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;