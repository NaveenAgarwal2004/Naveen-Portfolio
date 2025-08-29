import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Award, Calendar, Building, AlertCircle, RefreshCcw, IdCard } from 'lucide-react';
import { certificatesAPI } from '../services/api';

const CertificatesSection = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log('🔄 Fetching certificates...');
      
      const response = await certificatesAPI.getCertificates();
      console.log('✅ Certificates response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch certificates');
      }
      
      setCertificates(response.data.data || []);
      console.log(`✅ ${response.data.data?.length || 0} certificates loaded`);
      
    } catch (err) {
      setError('⚠️ Unable to load certificates. Please try again later.');
      console.error('❌ Certificates fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0; // Expires within 90 days
  };

  if (loading) {
    return (
      <section id="certificates" className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-gray-900 border-gray-700">
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

  if (certificates.length === 0 && !loading) {
    return (
      <section id="certificates" className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Certifications</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Professional certifications and achievements
            </p>
          </div>
          
          {error && (
            <div className="flex items-center justify-center mb-6 text-red-400 text-sm gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCertificates}
                className="ml-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700 flex items-center justify-center">
              <Award className="w-12 h-12 text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg">No certifications available yet</p>
            <p className="text-gray-600 text-sm mt-2">Check back soon for updates</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-12 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Certifications</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Professional certifications and achievements that validate my expertise
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-center mb-6 text-red-400 text-sm gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCertificates}
              className="ml-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const expired = isExpired(cert.expiryDate);
            const expiringSoon = isExpiringSoon(cert.expiryDate);
            
            return (
              <Card 
                key={cert._id} 
                className={`bg-gray-900 border-gray-700 hover:shadow-xl hover:shadow-gray-900/50 transition-all duration-300 group relative ${
                  expired ? 'opacity-75' : ''
                }`}
              >
                {/* Status indicators */}
                {expired && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Expired
                  </div>
                )}
                {expiringSoon && !expired && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                    Expires Soon
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  {cert.logo?.url ? (
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <img 
                        src={cert.logo.url} 
                        alt={`${cert.issuer} logo`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  <CardTitle className="text-white text-lg leading-tight">
                    {cert.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{cert.issuer}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      {formatDate(cert.issueDate)}
                      {cert.expiryDate && (
                        <span className={expired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : ''}>
                          {' - '}{formatDate(cert.expiryDate)}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {cert.credentialId && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <IdCard className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-mono text-xs truncate">{cert.credentialId}</span>
                    </div>
                  )}
                  
                  {cert.description && (
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                  
                  {cert.credentialUrl && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cert.credentialUrl, '_blank')}
                        className="w-full border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Credential
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={fetchCertificates}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Certificates
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;