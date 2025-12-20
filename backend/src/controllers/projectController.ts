import { Request, Response } from 'express';
import projectService from '../services/projectService';
import { ApiResponse, CreateProjectDTO, UpdateProjectDTO } from '../types/dtos';

class ProjectController {
  async getAllProjects(req: Request, res: Response): Promise<Response> {
    try {
      const { category, featured, page = '1', limit = '20' } = req.query;
      
      const filters = {
        category: category as string,
        featured: featured === 'true' ? true : undefined,
        limit: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      };
      
      const result = await projectService.getAllProjects(filters);
      
      const response: ApiResponse = {
        success: true,
        data: result.projects,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string)),
          hasNextPage: (parseInt(page as string) * parseInt(limit as string)) < result.total,
          hasPrevPage: parseInt(page as string) > 1
        }
      };
      
      return res.json(response);
    } catch (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({
        success: false,
        message: (error as Error).message
      });
    }
  }
  
  async getProjectById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      
      return res.json({
        success: true,
        data: project
      });
    } catch (error) {
      const statusCode = (error as Error).message === 'Project not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: (error as Error).message
      });
    }
  }

  async getFeaturedProjects(_req: Request, res: Response): Promise<Response> {
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
  
  async createProject(req: Request, res: Response): Promise<Response> {
    try {
      const projectData: CreateProjectDTO = req.body;
      const project = await projectService.createProject(projectData);
      
      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }
  
  async updateProject(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData: UpdateProjectDTO = req.body;
      const project = await projectService.updateProject(id, updateData);
      
      return res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);
      return res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  }
  
  async deleteProject(req: Request, res: Response): Promise<Response> {
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
        message: (error as Error).message
      });
    }
  }
}

export default new ProjectController();
