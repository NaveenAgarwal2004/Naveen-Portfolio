import React from 'react';
import LazyImage from './LazyImage';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '',
  width,
  height,
  quality = 80,
  cloudinaryTransforms = '',
  ...props 
}) => {
  // Helper function to generate Cloudinary URLs with optimizations
  const getOptimizedSrc = (originalSrc, transforms = '') => {
    if (!originalSrc || !originalSrc.includes('cloudinary.com')) {
      return originalSrc;
    }

    try {
      const url = new URL(originalSrc);
      const pathParts = url.pathname.split('/');
      
      // Find the position where we can insert transformations
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return originalSrc;

      // Build optimization transformations
      const optimizations = [
        'f_auto', // Auto format (WebP when supported)
        'q_auto', // Auto quality
        `q_${quality}`, // Specific quality
        ...(width ? [`w_${width}`] : []),
        ...(height ? [`h_${height}`] : []),
        'c_fill', // Crop to fill dimensions
        'g_auto', // Auto gravity for smart cropping
        transforms
      ].filter(Boolean).join(',');

      // Insert transformations after /upload/
      pathParts.splice(uploadIndex + 1, 0, optimizations);
      
      return `${url.protocol}//${url.host}${pathParts.join('/')}`;
    } catch (error) {
      console.warn('Failed to optimize Cloudinary URL:', error);
      return originalSrc;
    }
  };

  const optimizedSrc = getOptimizedSrc(src, cloudinaryTransforms);

  return (
    <LazyImage
      src={optimizedSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

// Predefined optimization presets
export const ImagePresets = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  card: { width: 400, height: 250, quality: 80 },
  hero: { width: 1200, height: 600, quality: 85 },
  profile: { width: 300, height: 300, quality: 90 }
};

// Usage examples:
// <OptimizedImage src={url} {...ImagePresets.card} alt="Project screenshot" />
// <OptimizedImage src={url} width={800} height={400} cloudinaryTransforms="e_blur:300" />

export default OptimizedImage;