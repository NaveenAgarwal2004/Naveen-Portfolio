const express = require('express');
const Personal = require('../models/Personal');

const router = express.Router();

router.get('/test-personal', async (req, res) => {
  try {
    const personalData = await Personal.find();
    res.json({ success: true, data: personalData });
  } catch (error) {
    console.error('Error fetching personal data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal data' });
  }
});

module.exports = router;
