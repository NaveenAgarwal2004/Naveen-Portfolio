const express = require('express');
const Personal = require('../models/Personal');
const Project = require('../models/Project');
const TechStack = require('../models/TechStack');

const router = express.Router();

// ================= GET PERSONAL INFO =================
router.get('/personal', async (req, res) => {
  try {
    const personal = await Personal.findOne();

    if (!personal) {
      const defaultData = {
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences with clean code and creative design',
        bio: 'Passionate Front-End Developer with expertise in modern web technologies.',
        email: 'naveenagarwal7624@gmail.com',
        phone: '+91 9079691064',
        location: 'India',
        profileImageUrl: '/Naveen.jpg',
        resumeUrl: '',
        skills: [
          { name: "React.js", level: 90 },
          { name: "JavaScript", level: 85 },
          { name: "HTML/CSS", level: 95 },
          { name: "Node.js", level: 80 },
          { name: "MongoDB", level: 75 },
          { name: "Python", level: 70 }
        ],
        socialLinks: {
          github: 'https://github.com/naveenagarwal2004',
          linkedin: 'https://linkedin.com/in/naveen-agar',
          twitter: 'https://twitter.com/naveen_dev',
          email: 'mailto:naveenagarwal7624@gmail.com'
        }
      };
      return res.json({ success: true, data: defaultData });
    }

    const result = {
      ...personal.toObject(),
      profileImageUrl: personal.profileImageUrl || '/Naveen.jpg',
      frontendResume: personal.frontendResume || { public_id: '', url: '' },
      backendResume: personal.backendResume || { public_id: '', url: '' },
      generalResume: personal.generalResume || { public_id: '', url: '' }
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching personal data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personal information' });
  }
});

// ================= GET PROJECTS =================
router.get('/projects', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    const projects = await Project.find(query).sort({ featured: -1, order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// ================= GET FEATURED PROJECTS =================
router.get('/projects/featured', async (req, res) => {
  try {
    const projects = await Project.find({ featured: true }).sort({ order: 1, createdAt: -1 }).limit(3);
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured projects' });
  }
});

// ================= GET TECH STACK =================
router.get('/tech-stack', async (req, res) => {
  try {
    const techStack = await TechStack.find().sort({ category: 1, order: 1, name: 1 });
    res.json({ success: true, data: techStack });
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tech stack' });
  }
});

// ================= GET PORTFOLIO STATS =================
router.get('/stats', async (req, res) => {
  try {
    const [totalProjects, aiProjects, webProjects, techCount] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ category: 'AI' }),
      Project.countDocuments({ category: 'Web' }),
      TechStack.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        aiProjects,
        webProjects,
        techCount,
        yearsExperience: 3,
        clients: 25
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ================= VIEW RESUME INLINE =================
router.get('/resume/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid resume type' });
    }

    const personal = await Personal.findOne();
    if (!personal) return res.status(404).json({ success: false, message: 'Personal information not found' });

    const resume = personal[`${type}Resume`];
    if (!resume || !resume.url) {
      return res.status(404).json({ success: false, message: `${type} resume not found` });
    }

    res.redirect(resume.url);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resume' });
  }
});

// ================= DOWNLOAD RESUME =================
router.get('/resume/:type/download', async (req, res) => {
  try {
    const { type } = req.params;
    if (!['frontend', 'backend', 'general'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid resume type' });
    }

    const personal = await Personal.findOne();
    if (!personal) return res.status(404).json({ success: false, message: 'Personal information not found' });

    const resume = personal[`${type}Resume`];
    if (!resume || !resume.url) {
      return res.status(404).json({ success: false, message: `${type} resume not found` });
    }

    const downloadUrl = resume.url.replace('/upload/', '/upload/fl_attachment/');
    res.redirect(downloadUrl);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ success: false, message: 'Failed to download resume' });
  }
});

module.exports = router;
