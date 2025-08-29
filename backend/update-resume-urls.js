const mongoose = require('mongoose');
const Personal = require('./models/Personal');
require('dotenv').config();

async function updateResumeUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get the existing personal record
    const personal = await Personal.findOne();
    
    if (!personal) {
      console.log('No personal record found. Creating a new one...');
      return;
    }

    // Update with new Cloudinary URLs
    personal.frontendResumeUrl = 'https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755274566/portfolio/resumes/naveen-agarwal-frontend.pdf';
    personal.backendResumeUrl = 'https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755274567/portfolio/resumes/naveen-agarwal-backend.pdf';
    personal.resumeUrl = 'https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755274568/portfolio/resumes/naveen-agarwal-resume.pdf';

    // Also update the nested resume objects
    personal.frontendResume = {
      public_id: 'portfolio/resumes/naveen-agarwal-frontend',
      url: 'https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755274566/portfolio/resumes/naveen-agarwal-frontend.pdf'
    };
    
    personal.backendResume = {
      public_id: 'portfolio/resumes/naveen-agarwal-backend',
      url: 'https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755274567/portfolio/resumes/naveen-agarwal-backend.pdf'
    };
    
    personal.generalResume = {
      public_id: 'portfolio/resumes/naveen-agarwal-resume',
      url: 'https://res.cloudinary.com/dtor3nqkz/raw/upload/v1755274568/portfolio/resumes/naveen-agarwal-resume.pdf'
    };

    await personal.save();
    console.log('Resume URLs updated successfully!');
    console.log('Frontend Resume:', personal.frontendResumeUrl);
    console.log('Backend Resume:', personal.backendResumeUrl);
    console.log('General Resume:', personal.resumeUrl);

  } catch (error) {
    console.error('Error updating resume URLs:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the update function
updateResumeUrls();
