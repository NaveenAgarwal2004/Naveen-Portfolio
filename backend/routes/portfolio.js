const express = require('express');
const Personal = require('../models/Personal');
const Project = require('../models/Project');
const TechStack = require('../models/TechStack');

const router = express.Router();

// GET /api/portfolio/personal - Get personal information
router.get('/personal', async (req, res) => {
  try {
    let personal = await Personal.findOne();
    
    // If no personal data exists, return default data
    if (!personal) {
      personal = {
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences with clean code and creative design',
        bio: 'Passionate Front-End Developer with expertise in modern web technologies.',
        email: 'naveen.agarwal.dev@gmail.com',
        phone: '+91 98765 43210',
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
          github: 'https://github.com/naveen-agarwal',
          linkedin: 'https://linkedin.com/in/naveen-agarwal-dev',
          twitter: 'https://twitter.com/naveen_dev',
          email: 'mailto:naveen.agarwal.dev@gmail.com'
        }
      };
    }

    res.json({
      success: true,
      data: personal
    });
  } catch (error) {
    console.error('Error fetching personal data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal information'
    });
  }
});

// GET /api/portfolio/projects - Get all projects
router.get('/projects', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    const projects = await Project.find(query)
      .sort({ featured: -1, order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// GET /api/portfolio/projects/featured - Get featured projects
router.get('/projects/featured', async (req, res) => {
  try {
    const projects = await Project.find({ featured: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects'
    });
  }
});

// GET /api/portfolio/tech-stack - Get tech stack
router.get('/tech-stack', async (req, res) => {
  try {
    const techStack = await TechStack.find()
      .sort({ category: 1, order: 1, name: 1 });

    res.json({
      success: true,
      data: techStack
    });
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tech stack'
    });
  }
});

// GET /api/portfolio/stats - Get portfolio statistics
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;