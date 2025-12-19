const projectService = require('../services/projectService');

class ProjectController {
  async getAllProjects(req, res) {
    try {
      const { category, featured, page = 1, limit = 20 } = req.query;
      
      const filters = {
        category,
        featured: featured === 'true' ? true : undefined,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };
      
      const result = await projectService.getAllProjects(filters);
      
      return res.json({
        success: true,
        data: result.projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit)),
          hasNextPage: (parseInt(page) * parseInt(limit)) < result.total,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      
      return res.json({
        success: true,
        data: project
      });
    } catch (error) {
      const statusCode = error.message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFeaturedProjects(req, res) {
    try {
      const projects = await projectService.getFeaturedProjects();
      
      return res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Get featured projects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch featured projects'
      });
    }
  }
  
  async createProject(req, res) {
    try {
      const project = await projectService.createProject(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body);
      
      return res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      await projectService.deleteProject(id);
      
      return res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProjectController();
