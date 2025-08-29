import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Download, FileText, AlertCircle } from 'lucide-react';

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
      
      // Try the dedicated resume endpoint first
      let response = await fetch('/api/resume/urls');
      
      if (!response.ok) {
        // If resume endpoint fails, fall back to portfolio personal endpoint
        response = await fetch('/api/portfolio/personal');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType && !contentType.includes('application/json') && !contentType.includes('text/plain')) {
        throw new Error('Invalid response format: expected JSON, got ' + contentType);
      }
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', responseText);
        throw new Error('Failed to parse JSON response: ' + parseError.message);
      }
      
      if (!data.success) throw new Error(data.message || 'Failed to fetch resumes');
      
      let frontendUrl = '';
      let backendUrl = '';
      let generalUrl = '';
      
      // Handle different response formats
      if (data.data.frontendResume && data.data.frontendResume.url) {
        // Resume endpoint format
        frontendUrl = data.data.frontendResume.url;
        backendUrl = data.data.backendResume.url;
        generalUrl = data.data.generalResume.url;
      } else {
        // Portfolio personal endpoint format
        frontendUrl = data.data.frontendResumeUrl || '';
        backendUrl = data.data.backendResumeUrl || '';
        generalUrl = data.data.resumeUrl || '';
      }
      
      setResumes({
        frontend: { url: frontendUrl, public_id: '' },
        backend: { url: backendUrl, public_id: '' },
        general: { url: generalUrl, public_id: '' }
      });
    } catch (err) {
      setError('⚠️ Unable to load resumes. Please try again later.');
      console.error('Resume fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resumeTypes = [
    { type: 'frontend', label: 'Frontend Resume', color: 'text-blue-400' },
    { type: 'backend', label: 'Backend Resume', color: 'text-green-400' },
    { type: 'general', label: 'General Resume', color: 'text-purple-400' }
  ];

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">My Resumes</h2>
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
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">My Resumes</h2>

        {error && (
          <div className="flex items-center justify-center mb-6 text-red-400 text-sm gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resumeTypes.map(({ type, label, color }) => (
            <Card key={type} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${color}`}>
                  <FileText className="w-5 h-5" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumes[type].url ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">Available</p>
                    <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resumes[type].url, '_blank')}
                        className="flex items-center gap-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resumes[type].url, '_blank')}
                        className="flex items-center gap-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No resume uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;
