const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for resume uploads
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    public_id: (req, file) => `naveen-agarwal-resume-${Date.now()}`,
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

// NEW: Configure storage for certificate images (actual certificate documents)
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

// ENHANCED: Configure storage for certificate logos (issuer logos)
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
    if (file.mimetype === 'application/pdf') {
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

// NEW: Certificate image upload (for actual certificate documents)
const uploadCertificateImage = multer({
  storage: certificateImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for certificate images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed for certificate images'), false);
    }
  }
});

// ENHANCED: Certificate logo upload (for issuer logos)
const uploadCertificateLogo = multer({
  storage: certificateLogoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for logos
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
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// NEW: Helper function to optimize image transformations
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

// NEW: Helper function to generate multiple image sizes
const generateImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900 }),
    original: cloudinary.url(publicId, { secure: true })
  };
};

module.exports = {
  cloudinary,
  uploadResume,
  uploadProfileImage,
  uploadProjectImage,
  uploadTechLogo,
  uploadCertificateImage, // NEW
  uploadCertificateLogo, // ENHANCED
  deleteFromCloudinary,
  getOptimizedImageUrl, // NEW
  generateImageVariants // NEW
};