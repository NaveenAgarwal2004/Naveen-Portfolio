const express = require('express');
const router = express.Router();
const SEO = require('../models/SEO');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../src/middleware/validate');
const { seoSchema } = require('../src/validators/seoValidator');

// GET /api/seo - Get all SEO data (public route)
router.get('/', async (req, res) => {
  try {
    const seoData = await SEO.find({ isActive: true });
    
    // Transform to object with page as key
    const seoObject = {};
    seoData.forEach(item => {
      seoObject[item.page] = {
        title: item.title,
        description: item.description,
        keywords: item.keywords,
        ogImage: item.ogImage,
        twitterHandle: item.twitterHandle,
        canonicalUrl: item.canonicalUrl,
        structuredData: item.structuredData
      };
    });
    
    res.json({
      success: true,
      data: seoObject
    });
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO data',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// GET /api/seo/:page - Get SEO data for specific page (public route)
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    if (!['home', 'about', 'projects', 'contact'].includes(page)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page. Must be one of: home, about, projects, contact'
      });
    }
    
    const seoData = await SEO.findOne({ page, isActive: true });
    
    if (!seoData) {
      // Return default SEO data if none found
      const defaultSEO = {
        title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Naveen Agarwal Portfolio`,
        description: `${page.charAt(0).toUpperCase() + page.slice(1)} section of Naveen Agarwal's portfolio`,
        keywords: 'MERN Stack Developer, React Developer, Node.js Developer',
        ogImage: '/api/og-image.jpg',
        twitterHandle: '@naveen_dev',
        canonicalUrl: ''
      };
      
      return res.json({
        success: true,
        data: defaultSEO
      });
    }
    
    res.json({
      success: true,
      data: {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords,
        ogImage: seoData.ogImage,
        twitterHandle: seoData.twitterHandle,
        canonicalUrl: seoData.canonicalUrl,
        structuredData: seoData.structuredData
      }
    });
  } catch (error) {
    console.error('Error fetching SEO data for page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO data',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// POST /api/seo - Create or update SEO data (admin only) with Zod validation
router.post('/', auth, validate(seoSchema), async (req, res) => {
  try {
    const { page, title, description, keywords, twitterHandle, canonicalUrl } = req.body;
    
    // Check if SEO data exists for this page
    let seoData = await SEO.findOne({ page });
    
    if (seoData) {
      // Update existing
      seoData.title = title;
      seoData.description = description;
      seoData.keywords = keywords || '';
      seoData.twitterHandle = twitterHandle || '';
      seoData.canonicalUrl = canonicalUrl || '';
      await seoData.save();
    } else {
      // Create new
      seoData = new SEO({
        page,
        title,
        description,
        keywords: keywords || '',
        twitterHandle: twitterHandle || '',
        canonicalUrl: canonicalUrl || ''
      });
      await seoData.save();
    }
    
    res.json({
      success: true,
      message: `SEO data ${seoData.isNew ? 'created' : 'updated'} successfully`,
      data: seoData
    });
  } catch (error) {
    console.error('Error saving SEO data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save SEO data',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// POST /api/seo/:page/og-image - Upload OG image (admin only)
router.post('/:page/og-image', auth, upload.single('ogImage'), async (req, res) => {
  try {
    const { page } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    // Find or create SEO data for this page
    let seoData = await SEO.findOne({ page });
    if (!seoData) {
      seoData = new SEO({
        page,
        title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Portfolio`,
        description: `${page.charAt(0).toUpperCase() + page.slice(1)} section description`
      });
    }
    
    // Update OG image
    seoData.ogImage = req.file.path; // Assuming you're using cloudinary or similar
    seoData.ogImagePublicId = req.file.public_id;
    await seoData.save();
    
    res.json({
      success: true,
      message: 'OG image uploaded successfully',
      data: {
        ogImage: seoData.ogImage
      }
    });
  } catch (error) {
    console.error('Error uploading OG image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload OG image',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});



module.exports = router;