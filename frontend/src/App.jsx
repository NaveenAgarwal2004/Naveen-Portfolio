import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { portfolioAPI } from './services/api';
import ResumeSection from './components/ResumeSection';
import CertificatesSection from './components/CertificatesSection';

// Lazy load admin components (rarely used)
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
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

// Loading component for Suspense fallback
const AdminLoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading admin panel...</p>
    </div>
  </div>
);

// SEO Component
const SEO = ({ title, description, keywords }) => {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="keywords"]')?.setAttribute('content', keywords);
  }, [title, description, keywords]);

  return null;
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [error, setError] = useState(null);

  const fetchPortfolioData = async (useCache = true) => {
    try {
      // Try to get data from localStorage cache first (valid for 5 minutes)
      const cachedData = useCache ? localStorage.getItem('portfolioData') : null;
      const cacheTimestamp = useCache ? localStorage.getItem('portfolioDataTimestamp') : null;
      const now = new Date().getTime();
      const cacheValid = cacheTimestamp && (now - parseInt(cacheTimestamp)) < 5 * 60 * 1000; // 5 minutes

      if (cachedData && cacheValid) {
        setPortfolioData(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

      const [personalResponse, projectsResponse, techStackResponse, statsResponse] = await Promise.all([
        portfolioAPI.getPersonal(),
        portfolioAPI.getProjects(),
        portfolioAPI.getTechStack(),
        portfolioAPI.getStats()
      ]);

      const data = {
        personal: personalResponse.data.data,
        projects: projectsResponse.data.data,
        techStack: techStackResponse.data.data,
        stats: statsResponse.data.data
      };

      setPortfolioData(data);
      
      // Cache the data in localStorage
      localStorage.setItem('portfolioData', JSON.stringify(data));
      localStorage.setItem('portfolioDataTimestamp', now.toString());
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      
      // Try to use cached data even if it's older
      const cachedData = localStorage.getItem('portfolioData');
      if (cachedData) {
        setPortfolioData(JSON.parse(cachedData));
        setError('Using cached data. Having trouble connecting to the server.');
      } else {
        // Set fallback data
        setPortfolioData({
          personal: {
            name: 'Naveen Agarwal',
            title: 'Front-End Web Developer',
            tagline: 'Building modern, responsive web experiences with clean code and creative design'
          },
          projects: [],
          techStack: [],
          stats: {}
        });
        setError('Using fallback data. Having trouble connecting to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial portfolio data
    fetchPortfolioData();

    // Listen for personal data updates from AdminPersonal component
    const handlePersonalDataUpdate = () => {
      fetchPortfolioData(false); // Don't use cache when personal data is updated
    };

    window.addEventListener('personalDataUpdated', handlePersonalDataUpdate);

    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchPortfolioData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      window.removeEventListener('personalDataUpdated', handlePersonalDataUpdate);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio...</p>
          {error && <p className="text-yellow-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const seoData = portfolioData?.personal ? {
    title: `${portfolioData.personal.name} - ${portfolioData.personal.title} | Portfolio`,
    description: portfolioData.personal.tagline,
    keywords: `${portfolioData.personal.name}, Front-End Developer, React Developer, MERN Stack, Portfolio, JavaScript, Web Development, AI Projects, Tailwind CSS`
  } : {
    title: "Naveen Agarwal - Front-End Web Developer | Portfolio",
    description: "Front-End Web Developer specializing in React.js, Tailwind CSS, and MERN Stack",
    keywords: "Front-End Developer, React Developer, Portfolio, JavaScript, Web Development"
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden md:overflow-visible">
      <SEO {...seoData} />
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
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/login" 
              element={
                <Suspense fallback={<AdminLoadingSpinner />}>
                  <AdminLogin />
                </Suspense>
              } 
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <Suspense fallback={<AdminLoadingSpinner />}>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </Suspense>
              }
            >
              <Route 
                index 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                } 
              />
              
              {/* Projects Management */}
              <Route 
                path="projects" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminProjects />
                  </Suspense>
                } 
              />
              <Route 
                path="projects/new" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminProjectNew />
                  </Suspense>
                } 
              />
              <Route 
                path="projects/edit/:id" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminProjectEdit />
                  </Suspense>
                } 
              />
              
              {/* Personal Info Management */}
              <Route 
                path="personal" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminPersonal />
                  </Suspense>
                } 
              />
              
              {/* Tech Stack Management */}
              <Route 
                path="tech-stack" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminTechStack />
                  </Suspense>
                } 
              />
              
              {/* Certificates Management */}
              <Route 
                path="certificates" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminCertificates />
                  </Suspense>
                } 
              />
              
              {/* Messages Management */}
              <Route 
                path="messages" 
                element={
                  <Suspense fallback={<AdminLoadingSpinner />}>
                    <AdminMessages />
                  </Suspense>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;