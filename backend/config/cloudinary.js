const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// FIXED: Configure storage for resume uploads with proper PDF handling
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'image', // Use 'image' for PDFs - works with public access
    format: 'pdf', // Explicitly set format
    flags: 'attachment', // This ensures proper download headers
    public_id: (req, file) => {
      // Clean filename and add timestamp
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');
      const cleanName = originalName.replace(/[^a-zA-Z0-9-_]/g, '_');
      return `${cleanName}_${Date.now()}`;
    }
  },
});

// Alternative: If the above doesn't work, use this configuration
const resumeStorageAlternative = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'portfolio/resumes',
      resource_type: 'image', // Use 'image' for proper PDF handling with public access
      format: 'pdf',
      public_id: `naveen-resume-${Date.now()}`,
      type: 'upload',
      access_mode: 'public',
      flags: 'attachment' // Ensures proper Content-Disposition header
    };
  },
});

// Configure storage for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/profile',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => `naveen-profile-${Date.now()}`,
  },
});

// Configure storage for project images
const projectImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/projects',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => `project-${Date.now()}`,
  },
});

// Configure storage for tech stack logos
const techLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/tech-logos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 100, height: 100, crop: 'fit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req, file) => `tech-logo-${Date.now()}`,
  },
});

// Configure storage for certificate images
const certificateImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/certificates/images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
    transformation: [
      { width: 1200, height: 900, crop: 'fit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => `certificate-image-${Date.now()}`,
  },
});

// Configure storage for certificate logos
const certificateLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/certificates/logos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
    transformation: [
      { width: 200, height: 200, crop: 'fit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => `certificate-logo-${Date.now()}`,
  },
});

// Create multer upload instances
const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // More robust PDF validation
    const isPDF = file.mimetype === 'application/pdf' || 
                  file.originalname.toLowerCase().endsWith('.pdf');
    
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resume uploads'), false);
    }
  }
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const uploadProjectImage = multer({
  storage: projectImageStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for project images'), false);
    }
  }
});

const uploadTechLogo = multer({
  storage: techLogoStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for tech logos'), false);
    }
  }
});

const uploadCertificateImage = multer({
  storage: certificateImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed for certificate images'), false);
    }
  }
});

const uploadCertificateLogo = multer({
  storage: certificateLogoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for certificate logos'), false);
    }
  }
});

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true // Clear CDN cache
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// ENHANCED: Helper function to generate proper PDF download URL
const getPDFDownloadUrl = (url) => {
  if (!url) return '';
  
  // Add fl_attachment flag to force download with proper headers
  if (url.includes('cloudinary.com')) {
    // Insert fl_attachment after the version number
    return url.replace('/upload/v', '/upload/fl_attachment/v');
  }
  return url;
};

// ENHANCED: Helper function to generate PDF view URL (for inline viewing)
const getPDFViewUrl = (url) => {
  if (!url) return '';
  
  // Remove any attachment flags for inline viewing
  if (url.includes('cloudinary.com')) {
    return url.replace('/fl_attachment/v', '/v');
  }
  return url;
};

// Helper function to optimize image transformations
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 'auto',
    format = 'auto',
    crop = 'fit'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    quality,
    fetch_format: format,
    crop,
    secure: true
  });
};

// Helper function to generate multiple image sizes
const generateImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900 }),
    original: cloudinary.url(publicId, { secure: true })
  };
};

// ENHANCED: Upload PDF with proper handling
const uploadPDFToCloudinary = async (buffer, filename, folder = 'portfolio/resumes') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image', // Use 'image' for PDFs - allows public access
        folder: folder,
        public_id: filename,
        format: 'pdf',
        access_mode: 'public',
        type: 'upload',
        overwrite: true, // Allow overwriting existing files
        invalidate: true, // Clear CDN cache
        flags: 'attachment' // Ensures proper Content-Disposition header
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Upload result:', {
            public_id: result.public_id,
            url: result.secure_url,
            resource_type: result.resource_type,
            access_mode: result.access_mode
          });
          // Return both view and download URLs
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
            viewUrl: result.secure_url, // View URL is the regular URL
            downloadUrl: result.secure_url.replace('/upload/', '/upload/fl_attachment/'), // Add attachment flag
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes
          });
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadResume,
  uploadProfileImage,
  uploadProjectImage,
  uploadTechLogo,
  uploadCertificateImage,
  uploadCertificateLogo,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  generateImageVariants,
  getPDFDownloadUrl, // NEW
  getPDFViewUrl, // NEW
  uploadPDFToCloudinary // NEW
};