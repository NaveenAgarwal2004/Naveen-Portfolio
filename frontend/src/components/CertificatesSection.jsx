import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Award, Calendar, Building, AlertCircle, RefreshCcw, 
  IdCard, CheckCircle, Clock, Search, Eye, X, Download, Star, 
  Trophy, Target, GraduationCap, Zap, ShieldCheck, AlertTriangle, 
  ExternalLink, Filter, ChevronDown
} from 'lucide-react';
import { certificatesAPI } from '../services/api';

const CertificatesSection = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch certificates and stats from API
  const fetchData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      
      const [certificatesResponse, statsResponse] = await Promise.all([
        certificatesAPI.getCertificates(),
        certificatesAPI.getCertificateStats()
      ]);
      
      if (!certificatesResponse.data.success) {
        throw new Error(certificatesResponse.data.message || 'Failed to fetch certificates');
      }

      const certificatesData = certificatesResponse.data.data;
      const certs = Array.isArray(certificatesData) ? certificatesData : [];
      
      // Sort by priority (highest first) then by issue date (newest first)
      const sortedCerts = certs.sort((a, b) => {
        if ((b.priority || 0) !== (a.priority || 0)) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return new Date(b.issueDate) - new Date(a.issueDate);
      });
      
      setCertificates(sortedCerts);
      setFilteredCertificates(sortedCerts);
      setStats(statsResponse.data.success ? statsResponse.data.data : {});
      
    } catch (err) {
      setError('Unable to load certificates. Please try again later.');
      console.error('Certificates fetch error:', err);
      setCertificates([]);
      setFilteredCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [certificates, searchTerm, filter]);

  const applyFiltersAndSearch = () => {
    let filtered = [...certificates];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.title?.toLowerCase().includes(term) ||
        cert.issuer?.toLowerCase().includes(term) ||
        cert.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(cert => {
        switch (filter) {
          case 'active':
            return !cert.isExpired;
          case 'expired':
            return cert.isExpired;
          case 'expiring':
            return cert.isExpiringSoon && !cert.isExpired;
          case 'verified':
            return cert.verificationStatus === 'Verified';
          default:
            return true;
        }
      });
    }

    setFilteredCertificates(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const pastDays = Math.abs(diffDays);
      if (pastDays < 30) return `${pastDays} days ago`;
      if (pastDays < 365) return `${Math.floor(pastDays / 30)} months ago`;
      return `${Math.floor(pastDays / 365)} years ago`;
    }
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getStatusInfo = (cert) => {
    if (cert.isExpired) {
      return {
        status: 'expired',
        label: 'Expired',
        color: 'bg-red-500/20',
        textColor: 'text-red-400',
        badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
        dotColor: 'bg-red-500',
        icon: AlertTriangle
      };
    }
    
    if (cert.isExpiringSoon) {
      return {
        status: 'expiring',
        label: `Expires in ${getRelativeTime(cert.expiryDate)}`,
        color: 'bg-yellow-500/20',
        textColor: 'text-yellow-400',
        badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        dotColor: 'bg-yellow-500',
        icon: Clock
      };
    }
    
    return {
      status: 'active',
      label: cert.expiryDate ? `Valid for ${getRelativeTime(cert.expiryDate)}` : 'Active',
      color: 'bg-green-500/20',
      textColor: 'text-green-400',
      badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
      dotColor: 'bg-green-500',
      icon: CheckCircle
    };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Intermediate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Advanced':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Expert':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Get grid span class based on priority
  const getGridSpan = (cert, index) => {
    // High priority certificates (8+) get large tiles
    if (cert.priority >= 8) {
      return index % 3 === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-2';
    }
    // Medium priority (5-7) get medium tiles
    if (cert.priority >= 5) {
      return index % 4 === 0 ? 'md:col-span-2 md:row-span-1' : 'md:col-span-1 md:row-span-1';
    }
    // Normal tiles
    return 'md:col-span-1 md:row-span-1';
  };

  const openModal = (cert) => {
    setSelectedCertificate(cert);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  // Certificate Modal Component
  const CertificateModal = ({ certificate, isOpen, onClose }) => {
    if (!isOpen || !certificate) return null;

    const statusInfo = getStatusInfo(certificate);
    const StatusIcon = statusInfo.icon;

    return (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 p-6 flex justify-between items-start z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{certificate.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{certificate.issuer}</span>
                </div>
                <Badge className={statusInfo.badgeColor}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {certificate.certificateImage?.url && (
              <div className="relative group">
                <img
                  src={certificate.certificateImage.url}
                  alt={`${certificate.title} certificate`}
                  className="w-full max-h-96 object-contain bg-white/5 rounded-lg border border-gray-700/50"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(certificate.certificateImage.url, '_blank')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-white/20 text-white hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Size
                  </Button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    Issuer Information
                  </h3>
                  <div className="flex items-center gap-3">
                    {certificate.logo?.url && (
                      <img
                        src={certificate.logo.url}
                        alt={`${certificate.issuer} logo`}
                        className="w-12 h-12 object-contain bg-white/5 rounded-lg p-2"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">{certificate.issuer}</p>
                      {certificate.credentialId && (
                        <p className="text-gray-400 text-sm font-mono">{certificate.credentialId}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issued:</span>
                      <span className="text-white">{formatDate(certificate.issueDate)}</span>
                    </div>
                    {certificate.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires:</span>
                        <span className={certificate.isExpired ? 'text-red-400' : 'text-white'}>
                          {formatDate(certificate.expiryDate)}
                        </span>
                      </div>
                    )}
                    {certificate.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{certificate.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {certificate.difficulty && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Certification Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Level:</span>
                        <Badge className={getDifficultyColor(certificate.difficulty)}>
                          {certificate.difficulty}
                        </Badge>
                      </div>
                      {certificate.score && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Score:</span>
                          <span className="text-white font-medium">{certificate.score}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status:</span>
                        <Badge className={statusInfo.badgeColor}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {certificate.verificationStatus || 'Verified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {certificate.tags && certificate.tags.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <h3 className="text-white font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {certificate.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {certificate.description && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <h3 className="text-white font-semibold mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{certificate.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-700/50">
              {certificate.credentialUrl && (
                <Button
                  onClick={() => window.open(certificate.credentialUrl, '_blank')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              )}
              {certificate.certificateImage?.url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(certificate.certificateImage.url, '_blank')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section id="certificates" className="py-20 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Professional Certifications</h2>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading certificates...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (certificates.length === 0 && !loading) {
    return (
      <section id="certificates" className="py-20 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">Professional Certifications</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Validated expertise through industry-recognized certifications
            </p>
          </div>
          
          {error && (
            <div className="flex items-center justify-center mb-8 text-red-400 gap-2 bg-red-900/20 border border-red-800/50 rounded-lg p-4 max-w-md mx-auto backdrop-blur-sm">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="ml-2 border-red-600 text-red-300 hover:text-white hover:border-red-400"
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 flex items-center justify-center">
              <Award className="w-16 h-16 text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">No Certifications Available</h3>
            <p className="text-gray-500 text-lg mb-6">Professional certifications will be displayed here once available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-20 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .bg-grid-white {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        }
      `}</style>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header with Stats */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
            Professional Certifications
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
            Validated expertise through industry-recognized certifications and continuous learning
          </p>
          
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
            <div className="bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-blue-400 flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-6 h-6" />
                {stats.total || certificates.length}
              </div>
              <div className="text-gray-400 text-sm">Total Earned</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-6 h-6" />
                {stats.active || 0}
              </div>
              <div className="text-gray-400 text-sm">Currently Valid</div>
            </div>
            {(stats.expiring > 0 || certificates.some(c => c.isExpiringSoon)) && (
              <div className="bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-6 h-6" />
                  {stats.expiring || certificates.filter(c => c.isExpiringSoon).length}
                </div>
                <div className="text-gray-400 text-sm">Expiring Soon</div>
              </div>
            )}
            {stats.recentlyAdded > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-purple-400 flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-6 h-6" />
                  {stats.recentlyAdded}
                </div>
                <div className="text-gray-400 text-sm">Recently Added</div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center mb-8 text-red-400 gap-2 bg-red-900/20 border border-red-800/50 rounded-lg p-4 max-w-md mx-auto backdrop-blur-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="ml-2 border-red-600 text-red-300 hover:text-white hover:border-red-400"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-10 space-y-4 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search certificates, issuers, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-700/50 bg-white/5 backdrop-blur-md text-gray-300 hover:bg-white/10 px-6"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-slideUp">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Certificates</option>
                    <option value="active">Active Only</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="expired">Expired</option>
                    <option value="verified">Verified Only</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="w-full border-gray-600/50 text-gray-300 hover:bg-gray-700"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center text-gray-400 text-sm">
            Showing {filteredCertificates.length} of {certificates.length} certificates
            {searchTerm && <span> for "{searchTerm}"</span>}
          </div>
        </div>

        {/* No Results */}
        {filteredCertificates.length === 0 && certificates.length > 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No certificates found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Bento Grid Layout */}
        {filteredCertificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
            {filteredCertificates.map((cert, index) => {
              const statusInfo = getStatusInfo(cert);
              const StatusIcon = statusInfo.icon;
              const gridSpan = getGridSpan(cert, index);
              const isLargeTile = gridSpan.includes('col-span-2') || gridSpan.includes('row-span-2');
              
              return (
                <div
                  key={cert._id}
                  className={`group relative ${gridSpan} animate-scaleIn cursor-pointer`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => openModal(cert)}
                >
                  {/* Card */}
                  <div className="h-full bg-white/5 backdrop-blur-md border border-gray-700/50 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
                    {/* Status Indicator Dot */}
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${statusInfo.dotColor} animate-pulse shadow-lg z-10`}></div>
                    
                    {/* Priority Star Badge */}
                    {cert.priority > 7 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    )}

                    {/* Certificate Image/Logo Background */}
                    <div className={`relative ${isLargeTile ? 'h-48' : 'h-32'} bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-gray-900/30 overflow-hidden`}>
                      {cert.certificateImage?.url ? (
                        <>
                          <img 
                            src={cert.certificateImage.url} 
                            alt={cert.title}
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award className="w-16 h-16 text-white/10 group-hover:text-white/20 transition-colors duration-500" />
                        </div>
                      )}
                      
                      {/* Overlay Logo */}
                      {cert.logo?.url && (
                        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                          <img
                            src={cert.logo.url}
                            alt={`${cert.issuer} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      {/* Title & Issuer */}
                      <div>
                        <h3 className={`font-bold text-white mb-2 line-clamp-2 ${isLargeTile ? 'text-xl' : 'text-lg'} group-hover:text-blue-300 transition-colors`}>
                          {cert.title}
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Building className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{cert.issuer}</span>
                        </div>
                      </div>

                      {/* Description (only for large tiles) */}
                      {isLargeTile && cert.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                          {cert.description}
                        </p>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="flex items-center text-green-400 text-xs mb-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>Issued</span>
                          </div>
                          <div className="text-white text-xs font-semibold truncate">
                            {formatDate(cert.issueDate)}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-2">
                          <div className={`flex items-center text-xs mb-1 ${statusInfo.textColor}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            <span className="truncate">
                              {cert.expiryDate ? 'Expires' : 'Status'}
                            </span>
                          </div>
                          <div className="text-white text-xs font-semibold truncate">
                            {cert.expiryDate ? formatDate(cert.expiryDate) : 'Valid'}
                          </div>
                        </div>
                      </div>

                      {/* Tags & Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {cert.difficulty && (
                          <Badge className={`${getDifficultyColor(cert.difficulty)} text-xs`}>
                            <Target className="w-3 h-3 mr-1" />
                            {cert.difficulty}
                          </Badge>
                        )}
                        
                        {cert.score && (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {cert.score}
                          </Badge>
                        )}

                        {cert.tags && cert.tags.length > 0 && (
                          <>
                            {cert.tags.slice(0, isLargeTile ? 3 : 2).map((tag, idx) => (
                              <Badge
                                key={idx}
                                className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {cert.tags.length > (isLargeTile ? 3 : 2) && (
                              <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs">
                                +{cert.tags.length - (isLargeTile ? 3 : 2)}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>

                      {/* Hover Action */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-2">
                        <div className="flex items-center justify-between text-blue-400 text-sm font-medium">
                          <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </span>
                          {cert.credentialUrl && (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="border-gray-700/50 bg-white/5 backdrop-blur-md text-gray-300 hover:text-white hover:border-gray-600 hover:bg-white/10 px-8 py-3"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Certificates
          </Button>
        </div>
      </div>

      {/* Certificate Detail Modal */}
      <CertificateModal 
        certificate={selectedCertificate}
        isOpen={showModal}
        onClose={closeModal}
      />
    </section>
  );
};

export default CertificatesSection;