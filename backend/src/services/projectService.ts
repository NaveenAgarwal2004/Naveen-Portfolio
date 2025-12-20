import projectRepository from '../repositories/projectRepository';
import { invalidateCache } from '../../middleware/cache';
import { IProject } from '../types/models';
import { CreateProjectDTO, UpdateProjectDTO, ProjectFiltersDTO } from '../types/dtos';

interface GetProjectsResult {
  projects: IProject[];
  total: number;
}

class ProjectService {
  async getAllProjects(filters: ProjectFiltersDTO): Promise<GetProjectsResult> {
    // Fetch from database
    const projects = await projectRepository.findAll(filters);
    const total = await projectRepository.count(filters);
    
    return { projects, total };
  }
  
  async getProjectById(id: string): Promise<IProject> {
    if (!id) throw new Error('Project ID is required');
    
    const project = await projectRepository.findById(id);
    if (!project) throw new Error('Project not found');
    
    return project;
  }

  async getFeaturedProjects(limit: number = 3): Promise<IProject[]> {
    return await projectRepository.findFeatured(limit);
  }
  
  async createProject(data: CreateProjectDTO): Promise<IProject> {
    // Business logic: Validate, enrich data
    const enrichedData: Partial<IProject> = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Business logic: Handle featured projects limit
    if (enrichedData.featured) {
      const featuredCount = await projectRepository.countFeatured();
      if (featuredCount >= 3) {
        // Unfeature the oldest featured project
        await projectRepository.unfeaturedOldest();
      }
    }
    
    const project = await projectRepository.create(enrichedData);
    
    // Invalidate cache
    invalidateCache.portfolio();
    
    return project;
  }
  
  async updateProject(id: string, data: UpdateProjectDTO): Promise<IProject> {
    // Business logic: Handle featured projects limit
    if (data.featured) {
      const project = await projectRepository.findById(id);
      // Only check limit if this project is not already featured
      if (project && !project.featured) {
        const featuredCount = await projectRepository.countFeatured();
        if (featuredCount >= 3) {
          await projectRepository.unfeaturedOldest();
        }
      }
    }

    const enrichedData: Partial<IProject> = {
      ...data,
      updatedAt: new Date()
    };
    
    const project = await projectRepository.update(id, enrichedData);
    if (!project) throw new Error('Project not found');
    
    // Invalidate cache
    invalidateCache.portfolio();
    
    return project;
  }
  
  async deleteProject(id: string): Promise<void> {
    const project = await projectRepository.delete(id);
    if (!project) throw new Error('Project not found');
    
    // Invalidate cache
    invalidateCache.portfolio();
  }

  async getProjectStats(): Promise<{
    totalProjects: number;
    aiProjects: number;
    webProjects: number;
  }> {
    const [totalProjects, aiProjects, webProjects] = await Promise.all([
      projectRepository.count(),
      projectRepository.count({ category: 'AI' }),
      projectRepository.count({ category: 'Web' })
    ]);

    return {
      totalProjects,
      aiProjects,
      webProjects
    };
  }
}

export default new ProjectService();
