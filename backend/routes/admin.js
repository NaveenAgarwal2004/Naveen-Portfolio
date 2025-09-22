const express = require('express');
const Personal = require('../models/Personal');
const Project = require('../models/Project');
const TechStack = require('../models/TechStack');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { uploadResume, uploadProfileImage, uploadProjectImage, uploadTechLogo, deleteFromCloudinary } = require('../config/cloudinary');
const { 
  projectValidation, 
  personalValidation, 
  techStackValidation, 
  handleValidationErrors 
} = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// ============= PROJECTS MANAGEMENT =============

// GET /api/admin/projects - Get all projects for admin
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ featured: -1, order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// POST /api/admin/projects - Create new project
router.post('/projects', projectValidation, handleValidationErrors, async (req, res) => {
  try {
    const projectData = req.body;
    
    if (projectData.featured) {
      const featuredCount = await Project.countDocuments({ featured: true });
      if (featuredCount >= 3) {
        await Project.updateOne(
          { featured: true },
          { featured: false },
          { sort: { updatedAt: 1 } }
        );
      }
    }

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
});

// PUT /api/admin/projects/:id - Update project
router.put('/projects/:id', projectValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    // Log the incoming request for debugging
    console.log('=== Project Update Request ===');
    console.log('Project ID:', id);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Body Type Check:');
    console.log('- title type:', typeof req.body.title);
    console.log('- techStack type:', typeof req.body.techStack, 'isArray:', Array.isArray(req.body.techStack));
    console.log('- featured type:', typeof req.body.featured);
    console.log('- order type:', typeof req.body.order);

    // Additional techStack debugging
    if (req.body.techStack) {
      console.log('TechStack Details:');
      console.log('- Length:', req.body.techStack.length);
      console.log('- Items:', req.body.techStack.map((item, index) => `[${index}]: "${item}" (type: ${typeof item}, length: ${item.length})`));
      console.log('- Empty items check:', req.body.techStack.filter(item => !item || item.trim().length === 0));
    }

    const updateData = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// DELETE /api/admin/projects/:id - Delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.imagePublicId) {
      try {
        await deleteFromCloudinary(project.imagePublicId, 'image');
      } catch (deleteError) {
        console.error('Error deleting project image:', deleteError);
      }
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

// POST /api/admin/upload/project-image - Upload project image
router.post('/upload/project-image', uploadProjectImage.single('projectImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No project image provided'
      });
    }

    res.json({
      success: true,
      message: 'Project image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.public_id
      }
    });
  } catch (error) {
    console.error('Project image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload project image'
    });
  }
});

// ============= PERSONAL INFO MANAGEMENT =============

// GET /api/admin/personal - Get personal info for editing
router.get('/personal', async (req, res) => {
  try {
    let personal = await Personal.findOne();
    
    if (!personal) {
      personal = new Personal({
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences with clean code and creative design',
        bio: 'Passionate Front-End Developer with expertise in modern web technologies.',
        email: 'naveen.agarwal.dev@gmail.com',
        phone: '+91 98765 43210',
        location: 'India',
        socialLinks: {
          github: 'https://github.com/naveen-agarwal',
          linkedin: 'https://linkedin.com/in/naveen-agarwal-dev',
          twitter: 'https://twitter.com/naveen_dev',
          email: 'mailto:naveen.agarwal.dev@gmail.com'
        }
      });
      await personal.save();
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

// PUT /api/admin/personal - Update personal info
router.put('/personal', personalValidation, handleValidationErrors, async (req, res) => {
  try {
    const updateData = req.body;

    let personal = await Personal.findOne();
    
    if (!personal) {
      personal = new Personal(updateData);
    } else {
      // For nested arrays like skills, we need to explicitly set them to ensure Mongoose detects changes
      if (updateData.skills) {
        personal.skills = updateData.skills;
        delete updateData.skills; // Remove skills from updateData to avoid duplication
      }
      
      // Update all other fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'skills') { // Don't overwrite skills as we already handled it
          personal[key] = updateData[key];
        }
      });
    }

    await personal.save();

    res.json({
      success: true,
      message: 'Personal information updated successfully',
      data: personal
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal information'
    });
  }
});

// ============= FILE UPLOADS =============

// POST /api/admin/upload/resume - Upload resume (deprecated - keeping for backward compatibility)
router.post('/upload/resume', uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided'
      });
    }

    let personal = await Personal.findOne();
    
    if (personal && personal.resumePublicId) {
      try {
        await deleteFromCloudinary(personal.resumePublicId, 'raw');
      } catch (deleteError) {
        console.error('Error deleting old resume:', deleteError);
      }
    }

    if (!personal) {
      personal = new Personal({
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences',
        bio: 'Passionate Front-End Developer',
        email: 'naveen.agarwal.dev@gmail.com'
      });
    }

    personal.resumeUrl = req.file.path;
    personal.resumePublicId = req.file.public_id;
    await personal.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.public_id,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
});

// POST /api/admin/upload/frontend-resume - Upload frontend resume
router.post('/upload/frontend-resume', uploadResume.single('frontendResume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No frontend resume file provided'
      });
    }

    let personal = await Personal.findOne();
    
    if (personal && personal.frontendResumePublicId) {
      try {
        await deleteFromCloudinary(personal.frontendResumePublicId, 'raw');
      } catch (deleteError) {
        console.error('Error deleting old frontend resume:', deleteError);
      }
    }

    if (!personal) {
      personal = new Personal({
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences',
        bio: 'Passionate Front-End Developer',
        email: 'naveen.agarwal.dev@gmail.com'
      });
    }

    personal.frontendResumeUrl = req.file.path;
    personal.frontendResumePublicId = req.file.public_id;
    await personal.save();

    res.json({
      success: true,
      message: 'Frontend resume uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.public_id,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Frontend resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload frontend resume'
    });
  }
});

// POST /api/admin/upload/backend-resume - Upload backend resume
router.post('/upload/backend-resume', uploadResume.single('backendResume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No backend resume file provided'
      });
    }

    let personal = await Personal.findOne();
    
    if (personal && personal.backendResumePublicId) {
      try {
        await deleteFromCloudinary(personal.backendResumePublicId, 'raw');
      } catch (deleteError) {
        console.error('Error deleting old backend resume:', deleteError);
      }
    }

    if (!personal) {
      personal = new Personal({
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences',
        bio: 'Passionate Front-End Developer',
        email: 'naveen.agarwal.dev@gmail.com'
      });
    }

    personal.backendResumeUrl = req.file.path;
    personal.backendResumePublicId = req.file.public_id;
    await personal.save();

    res.json({
      success: true,
      message: 'Backend resume uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.public_id,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Backend resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload backend resume'
    });
  }
});

// POST /api/admin/upload/profile-image - Upload profile image
router.post('/upload/profile-image', uploadProfileImage.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image provided'
      });
    }

    let personal = await Personal.findOne();
    
    if (personal && personal.profileImagePublicId) {
      try {
        await deleteFromCloudinary(personal.profileImagePublicId, 'image');
      } catch (deleteError) {
        console.error('Error deleting old profile image:', deleteError);
      }
    }

    if (!personal) {
      personal = new Personal({
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences',
        bio: 'Passionate Front-End Developer',
        email: 'naveen.agarwal.dev@gmail.com'
      });
    }

    personal.profileImageUrl = req.file.path;
    personal.profileImagePublicId = req.file.public_id;
    await personal.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.public_id
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
});

// POST /api/admin/upload/tech-logo - Upload tech stack logo
router.post('/upload/tech-logo', uploadTechLogo.single('techLogo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No tech logo provided'
      });
    }

    res.json({
      success: true,
      message: 'Tech logo uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.public_id
      }
    });
  } catch (error) {
    console.error('Tech logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload tech logo'
    });
  }
});

// POST /api/admin/upload/resume/:type - Upload resume (frontend/backend/general)
router.post('/upload/resume/:type', uploadResume.single('file'), async (req, res) => {
  try {
    const type = req.params.type;
    
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

    let personal = await Personal.findOne();
    
    if (!personal) {
      personal = new Personal({
        name: 'Naveen Agarwal',
        title: 'Front-End Web Developer',
        tagline: 'Building modern, responsive web experiences',
        bio: 'Passionate Front-End Developer',
        email: 'naveen.agarwal.dev@gmail.com'
      });
    }

    // Delete old resume if exists
    const oldResume = personal[`${type}Resume`];
    if (oldResume && oldResume.public_id) {
      try {
        await deleteFromCloudinary(oldResume.public_id, 'raw');
      } catch (deleteError) {
        console.error('Error deleting old resume:', deleteError);
      }
    }

    // Update with new resume

    
    personal[`${type}Resume`] = {
      public_id: req.file.public_id,
      url: req.file.secure_url
    };
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume uploaded successfully`,
      data: {
        url: req.file.secure_url,
        publicId: req.file.public_id
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
});

// DELETE /api/admin/resume/:type - Delete specific resume
router.delete('/resume/:type', async (req, res) => {
  try {
    const type = req.params.type;
    
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

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(resume.public_id, 'raw');
    } catch (deleteError) {
      console.error('Error deleting resume from Cloudinary:', deleteError);
    }

    // Remove from database
    personal[`${type}Resume`] = { public_id: '', url: '' };
    await personal.save();

    res.json({
      success: true,
      message: `${type} resume deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
});

// ============= TECH STACK MANAGEMENT =============

// GET /api/admin/tech-stack - Get all tech stack items
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

// POST /api/admin/tech-stack - Create new tech stack item
router.post('/tech-stack', techStackValidation, handleValidationErrors, async (req, res) => {
  try {
    const techItem = new TechStack(req.body);
    await techItem.save();

    res.status(201).json({
      success: true,
      message: 'Tech stack item created successfully',
      data: techItem
    });
  } catch (error) {
    console.error('Error creating tech stack item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tech stack item'
    });
  }
});

// PUT /api/admin/tech-stack/:id - Update tech stack item
router.put('/tech-stack/:id', techStackValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const techItem = await TechStack.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!techItem) {
      return res.status(404).json({
        success: false,
        message: 'Tech stack item not found'
      });
    }

    res.json({
      success: true,
      message: 'Tech stack item updated successfully',
      data: techItem
    });
  } catch (error) {
    console.error('Error updating tech stack item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tech stack item'
    });
  }
});

// DELETE /api/admin/tech-stack/:id - Delete tech stack item
router.delete('/tech-stack/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const techItem = await TechStack.findByIdAndDelete(id);

    if (!techItem) {
      return res.status(404).json({
        success: false,
        message: 'Tech stack item not found'
      });
    }

    if (techItem.logoPublicId) {
      try {
        await deleteFromCloudinary(techItem.logoPublicId, 'image');
      } catch (deleteError) {
        console.error('Error deleting tech logo:', deleteError);
      }
    }

    res.json({
      success: true,
      message: 'Tech stack item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tech stack item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tech stack item'
    });
  }
});

// ============= CONTACT MESSAGE MANAGEMENT =============

// GET /api/admin/contact/messages - Get all contact messages
router.get('/contact/messages', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

// PUT /api/admin/contact/messages/:id/status - Update contact message status
router.put('/contact/messages/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: new, read, replied, archived'
      });
    }

    const contact = await Contact.findByIdAndUpdate(id, { status }, { new: true });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status'
    });
  }
});

// ============= DASHBOARD STATS =============

// GET /api/admin/dashboard - Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProjects,
      featuredProjects,
      aiProjects,
      webProjects,
      techStackCount,
      totalMessages,
      newMessages,
      recentProjects,
      recentMessages
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),
      Project.countDocuments({ category: 'AI' }),
      Project.countDocuments({ category: 'Web' }),
      TechStack.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Project.find().sort({ createdAt: -1 }).limit(5),
      Contact.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          featuredProjects,
          aiProjects,
          webProjects,
          techStackCount,
          totalMessages,
          newMessages
        },
        recentProjects,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;
