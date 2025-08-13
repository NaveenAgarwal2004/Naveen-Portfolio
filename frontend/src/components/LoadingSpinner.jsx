import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
        <p className="text-gray-500 text-sm">Waking up the server, please wait...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
