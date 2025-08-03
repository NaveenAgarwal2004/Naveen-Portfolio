import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProjects from './components/admin/AdminProjects';
import AdminProjectNew from './components/admin/AdminProjectNew';
import AdminProjectEdit from './components/admin/AdminProjectEdit';
import AdminPersonal from './components/admin/AdminPersonal';
import AdminTechStack from './components/admin/AdminTechStack';
import AdminMessages from './components/admin/AdminMessages';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { portfolioAPI } from './services/api';

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
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              
              {/* Projects Management */}
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<AdminProjectNew />} />
              <Route path="projects/edit/:id" element={<AdminProjectEdit />} />
              
              {/* Personal Info Management */}
              <Route path="personal" element={<AdminPersonal />} />
              
              {/* Tech Stack Management */}
              <Route path="tech-stack" element={<AdminTechStack />} />
              
              {/* Messages Management */}
              <Route path="messages" element={<AdminMessages />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;