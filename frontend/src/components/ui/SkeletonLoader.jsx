import React from 'react';

const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  className = '', 
  variant = 'text',
  count = 1,
  animation = 'pulse' 
}) => {
  const baseClasses = `bg-gray-700/50 rounded-lg ${animation === 'pulse' ? 'animate-pulse' : 'animate-shimmer'}`;
  
  const variants = {
    text: 'h-4',
    title: 'h-8',
    avatar: 'w-12 h-12 rounded-full',
    card: 'h-48',
    button: 'h-10 w-24',
    image: 'aspect-video',
  };

  const Component = () => (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{ width, height: variant !== 'text' && variant !== 'title' ? height : undefined }}
      role="status"
      aria-label="Loading..."
    />
  );

  if (count === 1) {
    return <Component />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

// Skeleton variants for common patterns
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${className}`}>
    <div className="space-y-4">
      <SkeletonLoader variant="image" className="w-full" />
      <SkeletonLoader variant="title" className="w-3/4" />
      <SkeletonLoader count={3} className="w-full" />
      <div className="flex gap-2">
        <SkeletonLoader variant="button" />
        <SkeletonLoader variant="button" />
      </div>
    </div>
  </div>
);

export const SkeletonProfile = ({ className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonLoader variant="avatar" />
      <div className="space-y-2 flex-1">
        <SkeletonLoader variant="title" className="w-1/2" />
        <SkeletonLoader className="w-3/4" />
      </div>
    </div>
    <SkeletonLoader count={4} />
  </div>
);

export const SkeletonNavigation = () => (
  <div className="flex space-x-6">
    {Array.from({ length: 5 }, (_, i) => (
      <SkeletonLoader key={i} width="80px" height="20px" />
    ))}
  </div>
);

export default SkeletonLoader;