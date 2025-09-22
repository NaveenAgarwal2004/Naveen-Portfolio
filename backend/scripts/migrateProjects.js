const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/portfolio';

async function migrateProjects() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get all existing projects
    const projects = await Project.find({});
    console.log(`📊 Found ${projects.length} projects to migrate`);

    let updated = 0;
    for (const project of projects) {
      let needsUpdate = false;

      // Add missing fields with default values
      if (project.problem === undefined) {
        project.problem = '';
        needsUpdate = true;
      }
      if (project.solution === undefined) {
        project.solution = '';
        needsUpdate = true;
      }
      if (project.outcome === undefined) {
        project.outcome = '';
        needsUpdate = true;
      }
      if (project.detailedDescription === undefined) {
        project.detailedDescription = project.description || '';
        needsUpdate = true;
      }
      if (project.demoCredentials === undefined) {
        project.demoCredentials = {
          username: '',
          password: ''
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await project.save();
        updated++;
        console.log(`✅ Updated project: ${project.title}`);
      }
    }

    console.log(`🎉 Migration completed! Updated ${updated} projects`);
    
    // Display sample of migrated data
    if (projects.length > 0) {
      const sampleProject = await Project.findOne({});
      console.log('\n📋 Sample migrated project structure:');
      console.log({
        title: sampleProject.title,
        hasEnhancedFields: {
          problem: typeof sampleProject.problem === 'string',
          solution: typeof sampleProject.solution === 'string',
          outcome: typeof sampleProject.outcome === 'string',
          detailedDescription: typeof sampleProject.detailedDescription === 'string',
          demoCredentials: typeof sampleProject.demoCredentials === 'object'
        }
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateProjects();
}

module.exports = migrateProjects;