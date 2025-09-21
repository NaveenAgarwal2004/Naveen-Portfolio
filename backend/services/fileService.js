const fs = require('fs');
const path = require('path');
const axios = require('axios');

const STATIC_FILES_DIR = path.join(__dirname, '../../frontend/public');
const RESUME_FILES = {
  general: 'NaveenAgarwal__Resume.pdf',
  frontend: 'Naveen Agarwal - Frontend.pdf', 
  backend: 'NaveenAgarwal_Backend.pdf'
};

/**
 * Copy uploaded resume to public folder for static serving (About.jsx approach)
 */
const copyResumeToPublic = async (resumeBuffer, type) => {
  try {
    const filename = RESUME_FILES[type];
    if (!filename) {
      throw new Error(`Invalid resume type: ${type}`);
    }

    const filePath = path.join(STATIC_FILES_DIR, filename);
    
    // Ensure public directory exists
    if (!fs.existsSync(STATIC_FILES_DIR)) {
      fs.mkdirSync(STATIC_FILES_DIR, { recursive: true });
    }

    // Write file to public folder
    fs.writeFileSync(filePath, resumeBuffer);
    
    console.log(`✅ Resume copied to public: ${filename}`);
    return {
      success: true,
      staticUrl: `/${filename}`,
      filePath: filePath,
      filename: filename
    };
  } catch (error) {
    console.error('Error copying resume to public:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download resume from Cloudinary and copy to public folder
 */
const syncCloudinaryToPublic = async (cloudinaryUrl, type) => {
  try {
    if (!cloudinaryUrl) {
      throw new Error('No Cloudinary URL provided');
    }

    console.log(`📥 Downloading resume from Cloudinary: ${cloudinaryUrl}`);
    
    // Download file from Cloudinary
    const response = await axios({
      method: 'GET',
      url: cloudinaryUrl,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Portfolio-Backend/1.0'
      }
    });

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Copy to public folder
    const result = await copyResumeToPublic(buffer, type);
    
    if (result.success) {
      console.log(`✅ Successfully synced ${type} resume to public folder`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error syncing ${type} resume from Cloudinary:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if static resume files exist
 */
const checkStaticFiles = () => {
  const status = {};
  
  Object.entries(RESUME_FILES).forEach(([type, filename]) => {
    const filePath = path.join(STATIC_FILES_DIR, filename);
    status[type] = {
      filename: filename,
      exists: fs.existsSync(filePath),
      path: filePath,
      staticUrl: `/${filename}`
    };
    
    if (status[type].exists) {
      const stats = fs.statSync(filePath);
      status[type].size = stats.size;
      status[type].modified = stats.mtime;
    }
  });
  
  return status;
};

/**
 * Update personal data with static URLs (for About.jsx compatibility)
 */
const updatePersonalWithStaticUrls = async (Personal) => {
  try {
    const personal = await Personal.findOne();
    if (!personal) return { success: false, message: 'Personal data not found' };

    let updated = false;
    const staticStatus = checkStaticFiles();

    // Update static URLs if files exist
    if (staticStatus.general.exists) {
      personal.resumeUrl = staticStatus.general.staticUrl;
      updated = true;
    }
    
    if (staticStatus.frontend.exists) {
      personal.frontendResumeUrl = staticStatus.frontend.staticUrl;
      updated = true;
    }
    
    if (staticStatus.backend.exists) {
      personal.backendResumeUrl = staticStatus.backend.staticUrl;
      updated = true;
    }

    if (updated) {
      await personal.save();
      console.log('✅ Personal data updated with static URLs');
    }

    return { 
      success: true, 
      updated: updated,
      staticStatus: staticStatus
    };
  } catch (error) {
    console.error('Error updating personal data with static URLs:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = {
  copyResumeToPublic,
  syncCloudinaryToPublic,
  checkStaticFiles,
  updatePersonalWithStaticUrls,
  RESUME_FILES
};