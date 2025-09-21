const express = require('express');
const axios = require('axios');
const router = express.Router();

// PDF proxy endpoint to handle PDF serving
router.get('/pdf/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type' 
      });
    }

    const Personal = require('../models/Personal');
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

    // Try to fetch the PDF from Cloudinary
    try {
      const cloudinaryResponse = await axios({
        method: 'GET',
        url: resume.url,
        responseType: 'stream',
        timeout: 10000
      });
      
      // Set proper headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Naveen_Agarwal_${type}_Resume.pdf"`);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Pipe the PDF stream to response
      cloudinaryResponse.data.pipe(res);
      
    } catch (cloudinaryError) {
      console.error('Error fetching from Cloudinary:', cloudinaryError.message);
      
      // Fallback: try alternative URL formats
      const alternativeUrls = [
        resume.url.replace('/image/upload/', '/raw/upload/'),
        resume.url.replace('/raw/upload/', '/image/upload/'),
        resume.url.replace('/upload/', '/upload/fl_attachment/'),
      ];
      
      let success = false;
      for (const altUrl of alternativeUrls) {
        try {
          const altResponse = await axios({
            method: 'GET',
            url: altUrl,
            responseType: 'stream',
            timeout: 5000
          });
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="Naveen_Agarwal_${type}_Resume.pdf"`);
          altResponse.data.pipe(res);
          success = true;
          break;
        } catch (altError) {
          continue;
        }
      }
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Resume file not accessible'
        });
      }
    }
    
  } catch (error) {
    console.error('PDF proxy error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to serve PDF' 
    });
  }
});

module.exports = router;