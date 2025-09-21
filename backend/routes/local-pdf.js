const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Serve PDF files directly from backend folder (fallback solution)
router.get('/pdf/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid resume type' 
      });
    }

    // Map resume types to actual files
    const resumeFiles = {
      frontend: 'Naveen Agarwal - Frontend.pdf',
      backend: 'NaveenAgarwal_Backend.pdf',
      general: 'NaveenAgarwal__Resume.pdf'
    };

    const filename = resumeFiles[type];
    const filePath = path.join(__dirname, '..', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `${type} resume file not found`
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="Naveen_Agarwal_${type}_Resume.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Accept-Ranges', 'bytes');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Local PDF serve error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to serve PDF file' 
    });
  }
});

module.exports = router;