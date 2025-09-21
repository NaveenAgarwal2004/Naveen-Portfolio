import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Download, FileText, AlertCircle, RefreshCcw } from 'lucide-react';
import { resumeAPI } from '../services/api';

const ResumeSection = () => {
  const [resumes, setResumes] = useState({
    frontend: { url: '', public_id: '' },
    backend: { url: '', public_id: '' },
    general: { url: '', public_id: '' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log('🔄 Fetching resume URLs...');
      
      const response = await resumeAPI.getResumes();
      console.log('✅ Resume response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch resumes');
      }
      
      const resumeData = response.data.data;
      
      setResumes({
        frontend: resumeData.frontendResume || { url: '', public_id: '' },
        backend: resumeData.backendResume || { url: '', public_id: '' },
        general: resumeData.generalResume || { url: '', public_id: '' }
      });
      
      console.log('✅ Resumes updated:', {
        frontend: resumeData.frontendResume?.url ? 'Available' : 'Not available',
        backend: resumeData.backendResume?.url ? 'Available' : 'Not available',
        general: resumeData.generalResume?.url ? 'Available' : 'Not available'
      });
      
    } catch (err) {
      setError('⚠️ Unable to load resumes. Please try again later.');
      console.error('❌ Resume fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url, resumeType) => {
    if (!url) {
      console.error(`No URL available for ${resumeType} resume`);
      return;
    }
    
    // Use our backend local file serving as primary method
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const localUrl = `${backendUrl}/api/local/pdf/${resumeType}`;
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `Naveen_Agarwal_${resumeType}_Resume.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (resumeType) => {
    // Use our backend local file serving for viewing
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    const localUrl = `${backendUrl}/api/local/pdf/${resumeType}`;
    
    window.open(localUrl, '_blank', 'noopener,noreferrer');
  };

  const resumeTypes = [
    { type: 'general', label: 'General Resume', color: 'text-purple-400', description: 'Complete professional resume' },
    { type: 'frontend', label: 'Frontend Resume', color: 'text-blue-400', description: 'Frontend development focused' },
    { type: 'backend', label: 'Backend Resume', color: 'text-green-400', description: 'Backend development focused' }
  ];

  if (loading) {
    return (
      <section id="resumes" className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">My Resumes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="resumes" className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">My Resumes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Download my tailored resumes for different roles and expertise areas
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-center mb-6 text-red-400 text-sm gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchResumes}
              className="ml-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resumeTypes.map(({ type, label, color, description }) => (
            <Card key={type} className="bg-gray-800 border-gray-700 hover:shadow-xl hover:shadow-gray-900/50 transition-all duration-300 group">
              <CardHeader className="text-center">
                <CardTitle className={`flex items-center justify-center gap-2 ${color} text-lg`}>
                  <FileText className="w-5 h-5" />
                  {label}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">{description}</p>
              </CardHeader>
              <CardContent>
                {resumes[type]?.url ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-sm text-green-400 font-medium">Available</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(type)}
                        className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(resumes[type].url, type)}
                        className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm">No resume uploaded</p>
                    <p className="text-gray-600 text-xs mt-1">Check back soon</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={fetchResumes}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Resumes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;
            