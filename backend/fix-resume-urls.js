const mongoose = require('mongoose');
require('dotenv').config();

// Import the Personal model
const Personal = require('./models/Personal');

const fixResumeUrls = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Find the personal document
    const personal = await Personal.findOne();
    
    if (!personal) {
      console.log('No personal document found');
      return;
    }

    console.log('Current resume URLs:');
    console.log('Frontend Resume:', personal.frontendResume?.url);
    console.log('Backend Resume:', personal.backendResume?.url);
    console.log('General Resume:', personal.generalResume?.url);

    // Function to fix URL by replacing /image/upload/ with /raw/upload/
    const fixUrl = (url) => {
      if (!url || !url.includes('/image/upload/')) {
        return url;
      }
      return url.replace('/image/upload/', '/raw/upload/');
    };

    // Function to fix resume object
    const fixResumeObject = (resume) => {
      if (!resume || !resume.url) return resume;
      
      const fixedUrl = fixUrl(resume.url);
      return {
        ...resume,
        url: fixedUrl,
        viewUrl: fixedUrl,
        downloadUrl: fixedUrl
      };
    };

    // Fix all resume URLs
    const updatedPersonal = {
      ...personal.toObject(),
      frontendResume: fixResumeObject(personal.frontendResume),
      backendResume: fixResumeObject(personal.backendResume),
      generalResume: fixResumeObject(personal.generalResume)
    };

    // Update the database
    await Personal.findOneAndUpdate(
      { _id: personal._id },
      {
        frontendResume: updatedPersonal.frontendResume,
        backendResume: updatedPersonal.backendResume,
        generalResume: updatedPersonal.generalResume
      },
      { new: true }
    );

    console.log('\n✅ Updated resume URLs:');
    console.log('Frontend Resume:', updatedPersonal.frontendResume?.url);
    console.log('Backend Resume:', updatedPersonal.backendResume?.url);
    console.log('General Resume:', updatedPersonal.generalResume?.url);

    console.log('\n✅ Resume URLs fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing resume URLs:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the script
fixResumeUrls();