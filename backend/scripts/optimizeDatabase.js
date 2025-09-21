const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Database optimization script
 * Adds indexes and optimizes existing collections for better performance
 */

const optimizeDatabase = async () => {
  try {
    console.log('🚀 Starting database optimization...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Define optimizations for each collection
    const optimizations = [
      {
        collection: 'projects',
        indexes: [
          { featured: 1 },
          { category: 1 },
          { technologies: 1 },
          { isPublic: 1, featured: -1 }, // compound index for public + featured queries
          { createdAt: -1 }, // for sorting by date
          { 'seo.slug': 1 } // for SEO slug lookups
        ]
      },
      {
        collection: 'certificates',
        indexes: [
          { issuer: 1 },
          { category: 1 },
          { status: 1 },
          { issuedDate: -1 },
          { expiryDate: 1 },
          { featured: 1, issuedDate: -1 }, // compound for featured + date
          { tags: 1 } // for tag-based filtering
        ]
      },
      {
        collection: 'techstacks',
        indexes: [
          { category: 1 },
          { proficiency: -1 },
          { featured: 1 },
          { category: 1, proficiency: -1 } // compound for category + skill queries
        ]
      },
      {
        collection: 'personals',
        indexes: [
          { email: 1 },
          { 'socialMedia.platform': 1 }
        ]
      },
      {
        collection: 'contacts',
        indexes: [
          { email: 1 },
          { createdAt: -1 },
          { status: 1 },
          { replied: 1, createdAt: -1 } // for admin filtering
        ]
      }
    ];
    
    // Apply indexes to each collection
    for (const opt of optimizations) {
      try {
        console.log(`\n📊 Optimizing collection: ${opt.collection}`);
        const collection = db.collection(opt.collection);
        
        // Check if collection exists
        const collections = await db.listCollections({ name: opt.collection }).toArray();
        if (collections.length === 0) {
          console.log(`⚠️ Collection ${opt.collection} doesn't exist, skipping...`);
          continue;
        }
        
        // Get existing indexes
        const existingIndexes = await collection.listIndexes().toArray();
        const existingIndexNames = existingIndexes.map(idx => idx.name);
        
        console.log(`   Current indexes: ${existingIndexNames.join(', ')}`);
        
        // Create new indexes
        let indexesCreated = 0;
        for (const index of opt.indexes) {
          try {
            const indexName = Object.keys(index).join('_');
            
            // Skip if index already exists
            if (existingIndexNames.some(name => name.includes(indexName))) {
              console.log(`   ⏭️ Index ${indexName} already exists`);
              continue;
            }
            
            await collection.createIndex(index, { 
              background: true, // Create index in background
              name: `${indexName}_idx`
            });
            console.log(`   ✅ Created index: ${indexName}`);
            indexesCreated++;
          } catch (indexError) {
            console.warn(`   ⚠️ Failed to create index ${Object.keys(index).join('_')}: ${indexError.message}`);
          }
        }
        
        console.log(`   📈 Created ${indexesCreated} new indexes for ${opt.collection}`);
        
        // Get collection stats
        const stats = await collection.stats();
        console.log(`   📊 Collection stats: ${stats.count} documents, ${(stats.size / 1024).toFixed(2)} KB`);
        
      } catch (collectionError) {
        console.error(`❌ Error optimizing ${opt.collection}:`, collectionError.message);
      }
    }
    
    // Analyze query performance (if explain() is available)
    console.log('\n🔍 Analyzing query performance...');
    
    try {
      // Test common queries
      const testQueries = [
        { collection: 'projects', query: { isPublic: true, featured: true } },
        { collection: 'certificates', query: { status: 'active' } },
        { collection: 'techstacks', query: { category: 'Frontend' } }
      ];
      
      for (const test of testQueries) {
        try {
          const collection = db.collection(test.collection);
          const explain = await collection.find(test.query).explain('executionStats');
          
          console.log(`   Query: ${test.collection}.find(${JSON.stringify(test.query)})`);
          console.log(`   Execution time: ${explain.executionStats.executionTimeMillis}ms`);
          console.log(`   Documents examined: ${explain.executionStats.totalDocsExamined}`);
          console.log(`   Index used: ${explain.executionStats.executionSuccess ? '✅' : '❌'}`);
        } catch (queryError) {
          console.log(`   ⚠️ Could not analyze query for ${test.collection}`);
        }
      }
    } catch (analysisError) {
      console.log('⚠️ Query analysis not available');
    }
    
    console.log('\n✅ Database optimization completed!');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📵 MongoDB connection closed');
    }
  }
};

// Run optimization if script is executed directly
if (require.main === module) {
  optimizeDatabase()
    .then(() => {
      console.log('🎉 Optimization script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Optimization script failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeDatabase };