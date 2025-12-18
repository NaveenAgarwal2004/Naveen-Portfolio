import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/toaster';
import { portfolioAPI, testConnection } from './services/api';
import ResumeSection from './components/ResumeSection';
import CertificatesSection from './components/CertificatesSection';
// import InteractiveTimeline from './components/InteractiveTimeline';
// import AIFabChatAssistant from './components/AIFabChatAssistant';
import MetaTags from './components/SEO/MetaTags';
import LanguageLoadingOverlay from './components/LanguageLoadingOverlay';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

// Lazy load admin components
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminProjects = lazy(() => import('./components/admin/AdminProjects'));
const AdminProjectNew = lazy(() => import('./components/admin/AdminProjectNew'));
const AdminProjectEdit = lazy(() => import('./components/admin/AdminProjectEdit'));
const AdminPersonal = lazy(() => import('./components/admin/AdminPersonal'));
const AdminTechStack = lazy(() => import('./components/admin/AdminTechStack'));
const AdminMessages = lazy(() => import('./components/admin/AdminMessages'));
const AdminCertificates = lazy(() => import('./components/admin/AdminCertificates'));
const AdminSEO = lazy(() => import('./components/admin/AdminSEO'));
const AdminCaseStudies = lazy(() => import('./components/admin/AdminCaseStudies'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

// Enhanced Loading component with better UX
const LoadingSpinner = ({ message = "Loading...", showRetry = false, onRetry }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md px-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
      <p className="text-gray-400 text-lg mb-2">{message}</p>
      <p className="text-gray-500 text-sm mb-4">This may take a moment...</p>
      {showRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Connection Status Indicator
const ConnectionStatus = ({ status, onRetry }) => {
  if (status === 'connected') return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm ${
      status === 'connecting' ? 'bg-yellow-600' : 'bg-red-600'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {status === 'connecting' ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            <span className="text-white">Connecting to server...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-white" />
            <span className="text-white">Connection lost</span>
            <button
              onClick={onRetry}
              className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [retryCount, setRetryCount] = useState(0);
  
  // SEO data state
  const [seoData, setSeoData] = useState({
    title: 'Naveen Agarwal - MERN Stack Developer',
    description: 'Passionate MERN Stack Developer specializing in React.js, Node.js, MongoDB, and Express.js.',
    keywords: 'MERN Stack Developer, React Developer, Node.js Developer, Full Stack, JavaScript, MongoDB',
    author: 'Naveen Agarwal'
  });

  // Enhanced data fetching with better error handling
  const fetchPortfolioData = async (forceRefresh = false) => {
    const maxRetries = 3;
    
    try {
      setConnectionStatus('connecting');
      setError(null);
      
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = localStorage.getItem('portfolioData');
        const cacheTimestamp = localStorage.getItem('portfolioDataTimestamp');
        const now = Date.now();
        const cacheValid = cacheTimestamp && (now - parseInt(cacheTimestamp)) < 5 * 60 * 1000;
        
        if (cachedData && cacheValid) {
          setPortfolioData(JSON.parse(cachedData));
          setConnectionStatus('connected');
          setIsLoading(false);
          return;
        }
      }

      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Backend connection failed: ${connectionTest.error}`);
      }

      setConnectionStatus('connected');
      
      // Fetch all data with individual error handling
      const [personalResult, projectsResult, techStackResult, statsResult] = await Promise.allSettled([
        portfolioAPI.getPersonal(),
        portfolioAPI.getProjects(),
        portfolioAPI.getTechStack(),
        portfolioAPI.getStats()
      ]);
      
      // Process results with fallbacks
      const data = {
        personal: personalResult.status === 'fulfilled' && personalResult.value.data.success
          ? personalResult.value.data.data
          : getFallbackPersonalData(),
        
        projects: projectsResult.status === 'fulfilled' && projectsResult.value.data.success
          ? projectsResult.value.data.data
          : [],
          
        techStack: techStackResult.status === 'fulfilled' && techStackResult.value.data.success
          ? techStackResult.value.data.data
          : [],
          
        stats: statsResult.status === 'fulfilled' && statsResult.value.data.success
          ? statsResult.value.data.data
          : getFallbackStatsData()
      };
      
      setPortfolioData(data);
      setRetryCount(0); // Reset retry count on success
      
      // Cache successful result
      localStorage.setItem('portfolioData', JSON.stringify(data));
      localStorage.setItem('portfolioDataTimestamp', Date.now().toString());
      
      // Log what was fetched vs fallback
      console.log('📊 Data fetch results:', {
        personal: personalResult.status === 'fulfilled' ? 'API' : 'fallback',
        projects: projectsResult.status === 'fulfilled' ? `API (${data.projects.length})` : 'fallback',
        techStack: techStackResult.status === 'fulfilled' ? `API (${data.techStack.length})` : 'fallback',
        stats: statsResult.status === 'fulfilled' ? 'API' : 'fallback'
      });
      
      // Show partial error if some requests failed
      const failedRequests = [personalResult, projectsResult, techStackResult, statsResult]
        .filter(result => result.status === 'rejected').length;
      
      if (failedRequests > 0) {
        setError(`${failedRequests} of 4 data sources failed to load. Some content may be outdated.`);
      }
      
    } catch (error) {
      console.error(`❌ Portfolio data fetch failed (attempt ${retryCount + 1}):`, error);
      setConnectionStatus('disconnected');
      
      // Try cached data as fallback
      const cachedData = localStorage.getItem('portfolioData');
      if (cachedData) {
        console.log('📱 Using cached data as fallback');
        setPortfolioData(JSON.parse(cachedData));
        setError('Connection failed. Using cached data - some information may be outdated.');
      } else if (retryCount < maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`🔄 Retrying in ${delay}ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchPortfolioData(forceRefresh);
        }, delay);
        return;
      } else {
        // Use complete fallback data
        console.log('🔄 Max retries reached, using fallback data');
        setPortfolioData({
          personal: getFallbackPersonalData(),
          projects: [],
          techStack: [],
          stats: getFallbackStatsData()
        });
        setError('Unable to connect to server. Displaying offline content.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback data functions
  const getFallbackPersonalData = () => ({
    name: 'Naveen Agarwal',
    title: 'MERN Stack Developer',
    tagline: 'Building modern, responsive web experiences with clean code and creative design',
    bio: 'Passionate MERN Stack Developer with expertise in React.js, Node.js, MongoDB, and Express.js.',
    email: 'naveenagarwal7624@gmail.com',
    phone: '+91 9079691064',
    location: 'India',
    socialLinks: {
      github: 'https://github.com/naveenagarwal2004',
      linkedin: 'https://linkedin.com/in/naveen-agar',
      twitter: 'https://twitter.com/naveen_dev',
      email: 'mailto:naveenagarwal7624@gmail.com'
    }
  });

  const getFallbackStatsData = () => ({
    totalProjects: 8,
    totalTechnologies: 10,
    totalCertificates: 1,
    yearsExperience: 2,
    clients: 15
  });

  useEffect(() => {
    fetchPortfolioData();

    // Listen for data updates from admin panel
    const handleDataUpdate = (event) => {
      console.log('🔄 Data updated from admin panel, refetching...', event.type);
      fetchPortfolioData(true); // Force refresh
    };

    // Listen for various update events
    const updateEvents = ['personalDataUpdated', 'portfolioDataUpdated', 'projectsUpdated', 'techStackUpdated'];
    updateEvents.forEach(eventType => {
      window.addEventListener(eventType, handleDataUpdate);
    });

    // Periodic refresh (every 10 minutes instead of 5)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchPortfolioData();
      }
    }, 10 * 60 * 1000);

    return () => {
      updateEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleDataUpdate);
      });
      clearInterval(interval);
    };
  }, []);

  // Enhanced SEO data fetching
  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://naveen-portfolio-il6e.onrender.com' : 'http://localhost:8001');
        const response = await fetch(`${backendUrl}/api/seo/home`, {
          timeout: 5000 // 5 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSeoData(prev => ({
              ...prev,
              title: data.data.title || prev.title,
              description: data.data.description || prev.description,
              keywords: data.data.keywords || prev.keywords,
              author: portfolioData?.personal?.name || prev.author,
              image: data.data.ogImage || undefined,
              twitterHandle: data.data.twitterHandle || undefined
            }));
          }
        }
      } catch (error) {
        console.warn('Could not fetch SEO data, using defaults:', error.message);
      }
    };

    if (portfolioData && connectionStatus === 'connected') {
      fetchSEOData();
    }
  }, [portfolioData, connectionStatus]);

  // Handle manual retry
  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
    fetchPortfolioData(true);
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading portfolio..."
        showRetry={retryCount > 1}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden md:overflow-visible">
        <MetaTags {...seoData} />
        <ConnectionStatus status={connectionStatus} onRetry={handleRetry} />
        
        {/* Error Banner */}
        {error && (
          <div className={`bg-yellow-600/10 border-b border-yellow-600/20 px-4 py-3 text-center ${connectionStatus !== 'connected' ? 'mt-8' : ''}`}>
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="ml-2 px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 rounded text-xs transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
        
        <Header />
        <main className="px-4 sm:px-6 lg:px-8 w-full max-w-full md:max-w-full mx-auto">
          <Hero personalData={portfolioData?.personal} />
          <About personalData={portfolioData?.personal} statsData={portfolioData?.stats} />
          <TechStack techStackData={portfolioData?.techStack} />
          <Projects projectsData={portfolioData?.projects} />
          <ResumeSection />
          <CertificatesSection />
          <Contact />
        </main>
        <Footer personalData={portfolioData?.personal} />
        <Toaster />
        
        {/* Debug Info in Development
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 left-4 bg-gray-800/90 p-3 rounded-lg text-xs text-gray-300 z-40 max-w-xs">
            <div className="space-y-1">
              <div>Status: <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>{connectionStatus}</span></div>
              <div>Projects: {portfolioData?.projects?.length || 0}</div>
              <div>Tech: {portfolioData?.techStack?.length || 0}</div>
              <div>Retries: {retryCount}</div>
              <div className="text-xs text-gray-500 pt-1">
                Backend: {import.meta.env.VITE_BACKEND_URL?.includes('localhost') ? 'Local' : 'Remote'}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <div className="App">
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                
                  {/* Admin Login Route */}
                  <Route 
                    path="/admin/login" 
                    element={
                      <Suspense fallback={<LoadingSpinner message="Loading admin panel..." />}>
                        <AdminLogin />
                      </Suspense>
                    } 
                  />
                  
                  {/* Protected Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <Suspense fallback={<LoadingSpinner message="Loading admin panel..." />}>
                        <ProtectedRoute>
                          <AdminLayout />
                        </ProtectedRoute>
                      </Suspense>
                    }
                  >
                    <Route index element={<Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense>} />
                    <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense>} />
                    <Route path="projects" element={<Suspense fallback={<LoadingSpinner />}><AdminProjects /></Suspense>} />
                    <Route path="projects/new" element={<Suspense fallback={<LoadingSpinner />}><AdminProjectNew /></Suspense>} />
                    <Route path="projects/edit/:id" element={<Suspense fallback={<LoadingSpinner />}><AdminProjectEdit /></Suspense>} />
                    <Route path="personal" element={<Suspense fallback={<LoadingSpinner />}><AdminPersonal /></Suspense>} />
                    <Route path="tech-stack" element={<Suspense fallback={<LoadingSpinner />}><AdminTechStack /></Suspense>} />
                    <Route path="certificates" element={<Suspense fallback={<LoadingSpinner />}><AdminCertificates /></Suspense>} />
                    <Route path="case-studies" element={<Suspense fallback={<LoadingSpinner />}><AdminCaseStudies /></Suspense>} />
                    <Route path="seo" element={<Suspense fallback={<LoadingSpinner />}><AdminSEO /></Suspense>} />
                    <Route path="messages" element={<Suspense fallback={<LoadingSpinner />}><AdminMessages /></Suspense>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </AuthProvider>
            <LanguageLoadingOverlay />
            <Analytics />
            <SpeedInsights />
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;