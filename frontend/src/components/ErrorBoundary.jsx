import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('Error Boundary Caught:', error, errorInfo);
    
    // You can integrate with error reporting services here
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportIssue = () => {
    const subject = encodeURIComponent('Portfolio Website Error Report');
    const body = encodeURIComponent(`
Error Details:
${this.state.error?.message || 'Unknown error'}

Stack Trace:
${this.state.error?.stack || 'No stack trace available'}

Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack available'}

Please describe what you were doing when this error occurred:
`);
    
    window.open(`mailto:naveen@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      const { title, message, showDetails } = this.props;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Icon Animation */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <AlertTriangle className="h-10 w-10 text-red-400" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-red-500/10 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Error Content */}
            <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                {title || "Oops! Something went wrong"}
              </h1>
              
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {message || "We encountered an unexpected error. Don't worry, our team has been notified and we're working on a fix."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={this.handleRetry}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center"
                >
                  <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center"
                >
                  <Home className="h-5 w-5" />
                  Go Home
                </button>
                
                <button
                  onClick={this.handleReportIssue}
                  className="bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <Mail className="h-5 w-5" />
                  Report Issue
                </button>
              </div>

              {/* Error Details (Development Mode) */}
              {(import.meta.env.MODE === 'development' || showDetails) && this.state.error && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left">
                  <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Error Details (Development Mode)
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="text-gray-300 font-medium mb-1">Error Message:</h4>
                      <pre className="text-red-300 bg-red-900/20 p-2 rounded border-l-4 border-red-500 overflow-x-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    
                    {this.state.error.stack && (
                      <div>
                        <h4 className="text-gray-300 font-medium mb-1">Stack Trace:</h4>
                        <pre className="text-gray-400 bg-gray-900/50 p-2 rounded text-xs overflow-x-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-gray-300 font-medium mb-1">Component Stack:</h4>
                        <pre className="text-gray-400 bg-gray-900/50 p-2 rounded text-xs overflow-x-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Retry Count Info */}
              {this.state.retryCount > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Retry attempts: {this.state.retryCount}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                If this problem persists, please contact support at{' '}
                <a 
                  href="mailto:naveen@example.com" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  naveen@example.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component wrapper for functional components
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);
  
  const handleError = React.useCallback((error) => {
    setError(error);
    console.error('Component Error:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

export default ErrorBoundary;