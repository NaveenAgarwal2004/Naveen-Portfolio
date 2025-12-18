import React from 'react';

const SkeletonCard = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-700 rounded-lg h-48 mb-4"></div>
    <div className="space-y-2">
      <div className="bg-gray-700 rounded h-4 w-3/4"></div>
      <div className="bg-gray-700 rounded h-4 w-1/2"></div>
    </div>
  </div>
);

const SkeletonLine = ({ className = "" }) => (
  <div className={`bg-gray-700 rounded h-4 animate-pulse ${className}`}></div>
);

const SkeletonCircle = ({ size = "w-12 h-12" }) => (
  <div className={`bg-gray-700 rounded-full animate-pulse ${size}`}></div>
);

const LoadingSpinner = ({ 
  message = "Loading...", 
  type = "spinner", // 'spinner', 'skeleton', 'dots'
  size = "medium", // 'small', 'medium', 'large'
  theme = "dark" // 'dark', 'light'
}) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12", 
    large: "h-16 w-16"
  };

  const themeClasses = {
    dark: {
      container: "bg-gray-900",
      text: "text-white",
      subtext: "text-gray-400",
      spinner: "border-forge-orange"
    },
    light: {
      container: "bg-white",
      text: "text-gray-800", 
      subtext: "text-gray-600",
      spinner: "border-forge-orange"
    }
  };

  const currentTheme = themeClasses[theme];

  if (type === 'skeleton') {
    return (
      <div className={`min-h-screen ${currentTheme.container} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <SkeletonLine className="w-64 h-8 mx-auto mb-4" />
            <SkeletonLine className="w-96 h-4 mx-auto" />
          </div>
          
          {/* Content Grid Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`min-h-screen ${currentTheme.container} flex flex-col justify-center items-center`}>
        <div className="flex space-x-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 ${currentTheme.spinner.replace('border-', 'bg-')} rounded-full animate-pulse`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        <h3 className={`text-lg font-semibold ${currentTheme.text} mb-2`}>{message}</h3>
        <p className={`${currentTheme.subtext} text-sm text-center max-w-sm`}>
          Preparing your experience...
        </p>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`min-h-screen ${currentTheme.container} flex flex-col justify-center items-center relative overflow-hidden`}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-forge-orange/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-ember-red/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="text-center relative z-10">
        {/* Enhanced Spinner */}
        <div className="relative mb-8">
          <div className={`${sizeClasses[size]} border-4 border-gray-300/20 rounded-full animate-spin`}>
            <div className={`absolute inset-0 border-4 ${currentTheme.spinner} border-t-transparent rounded-full animate-spin`}></div>
          </div>
          {/* Pulse ring */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-forge-orange/30 rounded-full animate-ping`}></div>
        </div>
        
        <h3 className={`text-lg font-semibold ${currentTheme.text} mb-2`}>{message}</h3>
        <p className={`${currentTheme.subtext} text-sm animate-pulse`}>
          Waking up the server, please wait...
        </p>
        
        {/* Progress Dots */}
        <div className="flex justify-center mt-6 space-x-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-forge-orange/50 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Additional Loading Components
export const InlineSpinner = ({ size = "small", className = "" }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <div className={`${size === 'small' ? 'w-4 h-4' : 'w-6 h-6'} border-2 border-forge-orange/30 border-t-forge-orange rounded-full animate-spin`}></div>
  </div>
);

export const ButtonSpinner = ({ className = "" }) => (
  <div className={`w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`}></div>
);

export const CardSkeleton = ({ lines = 3, showImage = true, className = "" }) => (
  <div className={`animate-pulse p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl ${className}`}>
    {showImage && <div className="bg-gray-700 rounded-lg h-32 mb-4"></div>}
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="bg-gray-700 rounded h-4"
          style={{ width: `${100 - (i * 20)}%` }}
        ></div>
      ))}
    </div>
  </div>
);

export { SkeletonCard, SkeletonLine, SkeletonCircle };
export default LoadingSpinner;