import Project from '../../models/Project';
import { IProject } from '../types/models';
import { FilterQuery } from 'mongoose';

interface ProjectFilters {
  category?: string;
  featured?: boolean;
  limit?: number;
  skip?: number;
}

class ProjectRepository {
  async findAll(filters: ProjectFilters = {}): Promise<IProject[]> {
    const { category, featured, limit = 50, skip = 0 } = filters;
    
    const query: FilterQuery<IProject> = {};
    if (category && category !== 'all') query.category = category;
    if (featured !== undefined) query.featured = featured;
    
    return await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean<IProject[]>();
  }
  
  async findById(id: string): Promise<IProject | null> {
    return await Project.findById(id).lean<IProject>();
  }

  async findFeatured(limit: number = 3): Promise<IProject[]> {
    return await Project.find({ featured: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean<IProject[]>();
  }
  
  async create(data: Partial<IProject>): Promise<IProject> {
    const project = new Project(data);
    return (await project.save()) as unknown as IProject;
  }
  
  async update(id: string, data: Partial<IProject>): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean<IProject>();
  }
  
  async delete(id: string): Promise<IProject | null> {
    return await Project.findByIdAndDelete(id);
  }
  
  async count(filters: ProjectFilters = {}): Promise<number> {
    const query: FilterQuery<IProject> = {};
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }
    return await Project.countDocuments(query);
  }

  async countFeatured(): Promise<number> {
    return await Project.countDocuments({ featured: true });
  }

  async unfeaturedOldest(): Promise<void> {
    const oldestFeatured = await Project.findOne({ featured: true })
      .sort({ createdAt: 1 })
      .select('_id');
    
    if (oldestFeatured) {
      await Project.findByIdAndUpdate(oldestFeatured._id, { featured: false });
    }
  }
}

export default new ProjectRepository();
