const Project = require('../../models/Project');

class ProjectRepository {
  async findAll(filters = {}) {
    const { category, featured, limit = 50, skip = 0 } = filters;
    
    const query = {};
    if (category && category !== 'all' && category !== 'All') query.category = category;
    if (featured !== undefined) query.featured = featured;
    
    return await Project.find(query)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }
  
  async findById(id) {
    return await Project.findById(id).lean();
  }
  
  async create(data) {
    const project = new Project(data);
    return await project.save();
  }
  
  async update(id, data) {
    return await Project.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
  }
  
  async delete(id) {
    return await Project.findByIdAndDelete(id);
  }
  
  async count(filters = {}) {
    const query = {};
    if (filters.category && filters.category !== 'all' && filters.category !== 'All') {
      query.category = filters.category;
    }
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }
    return await Project.countDocuments(query);
  }

  async countFeatured() {
    return await Project.countDocuments({ featured: true });
  }

  async findFeatured(limit = 3) {
    return await Project.find({ featured: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async unfeaturedOldest() {
    return await Project.findOneAndUpdate(
      { featured: true },
      { featured: false },
      { sort: { updatedAt: 1 } }
    );
  }
}

module.exports = new ProjectRepository();
