const projectRepository = require('../repositories/projectRepository');
const { invalidateCache } = require('../../middleware/cache');

class ProjectService {
  async getAllProjects(filters) {
    // Business logic: Fetch from repository
    const projects = await projectRepository.findAll(filters);
    const total = await projectRepository.count(filters);
    
    return { projects, total };
  }
  
  async getProjectById(id) {
    if (!id) throw new Error('Project ID is required');
    
    const project = await projectRepository.findById(id);
    if (!project) throw new Error('Project not found');
    
    return project;
  }

  async getFeaturedProjects(limit = 3) {
    return await projectRepository.findFeatured(limit);
  }
  
  async createProject(data) {
    // Business logic: Validate, enrich data
    const enrichedData = {
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
  
  async updateProject(id, data) {
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

    const enrichedData = {
      ...data,
      updatedAt: new Date()
    };
    
    const project = await projectRepository.update(id, enrichedData);
    
    // Invalidate cache
    invalidateCache.portfolio();
    
    return project;
  }
  
  async deleteProject(id) {
    const project = await projectRepository.delete(id);
    if (!project) throw new Error('Project not found');
    
    // Invalidate cache
    invalidateCache.portfolio();
    
    return { deleted: true };
  }

  async getProjectStats() {
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

module.exports = new ProjectService();
