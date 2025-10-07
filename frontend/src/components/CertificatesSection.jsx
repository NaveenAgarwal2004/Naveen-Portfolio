import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Award, Calendar, Building, AlertCircle, RefreshCcw, 
  IdCard, CheckCircle, Clock, Search, ChevronLeft, ChevronRight,
  Eye, X, Download, Star, Trophy, Target, GraduationCap,
  Zap, ShieldCheck, AlertTriangle, ExternalLink, Shuffle
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

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
    setCurrentIndex(0);
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
        color: 'bg-red-500',
        textColor: 'text-red-400',
        badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: AlertTriangle
      };
    }
    
    if (cert.isExpiringSoon) {
      return {
        status: 'expiring',
        label: `Expires in ${getRelativeTime(cert.expiryDate)}`,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        icon: Clock
      };
    }
    
    return {
      status: 'active',
      label: cert.expiryDate ? `Valid for ${getRelativeTime(cert.expiryDate)}` : 'Active',
      color: 'bg-green-500',
      textColor: 'text-green-400',
      badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
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

  const nextCard = () => {
    if (isAnimating || currentIndex >= filteredCertificates.length - 1) return;
    setIsAnimating(true);
    setDirection('next');
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevCard = () => {
    if (isAnimating || currentIndex <= 0) return;
    setIsAnimating(true);
    setDirection('prev');
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const shuffleCards = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const shuffled = [...filteredCertificates].sort(() => Math.random() - 0.5);
    setFilteredCertificates(shuffled);
    setCurrentIndex(0);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToCard = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const openModal = (cert) => {
    setSelectedCertificate(cert);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showModal) return;
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === ' ') e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filteredCertificates.length, showModal, isAnimating]);

  // Certificate Modal Component
  const CertificateModal = ({ certificate, isOpen, onClose }) => {
    if (!isOpen || !certificate) return null;

    const statusInfo = getStatusInfo(certificate);
    const StatusIcon = statusInfo.icon;

    return (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onClose}
      >
        <div 
          className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          style={{ animation: 'slideUp 0.3s ease-out' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-6 flex justify-between items-start z-10">
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
                  className="w-full max-h-96 object-contain bg-white/5 rounded-lg border border-gray-700"
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
                <div className="bg-gray-800/50 rounded-lg p-4">
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

                <div className="bg-gray-800/50 rounded-lg p-4">
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
                  <div className="bg-gray-800/50 rounded-lg p-4">
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
                  <div className="bg-gray-800/50 rounded-lg p-4">
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
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{certificate.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-700">
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
      <section id="certificates" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Professional Certifications</h2>
          
          <div className="flex items-center justify-center min-h-[600px]">
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
      <section id="certificates" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">Professional Certifications</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Validated expertise through industry-recognized certifications
            </p>
          </div>
          
          {error && (
            <div className="flex items-center justify-center mb-8 text-red-400 gap-2 bg-red-900/20 border border-red-800 rounded-lg p-4 max-w-md mx-auto">
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
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Award className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">No Certifications Available</h3>
            <p className="text-gray-500 text-lg mb-6">Professional certifications will be displayed here once available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="certificates" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="container mx-auto px-4">
        {/* Header with Stats */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Professional Certifications</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            Validated expertise through industry-recognized certifications and continuous learning
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
              <div className="text-3xl font-bold text-blue-400 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                {stats.total || certificates.length}
              </div>
              <div className="text-gray-400 text-sm mt-1">Total Earned</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
              <div className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                {stats.active || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">Currently Valid</div>
            </div>
            {(stats.expiring > 0 || certificates.some(c => c.isExpiringSoon)) && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6" />
                  {stats.expiring || certificates.filter(c => c.isExpiringSoon).length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Expiring Soon</div>
              </div>
            )}
            {stats.recentlyAdded > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                <div className="text-3xl font-bold text-purple-400 flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6" />
                  {stats.recentlyAdded}
                </div>
                <div className="text-gray-400 text-sm mt-1">Recently Added</div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center mb-8 text-red-400 gap-2 bg-red-900/20 border border-red-800 rounded-lg p-4 max-w-md mx-auto">
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
        <div className="mb-8 space-y-4 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search certificates, issuers, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Certificates</option>
              <option value="active">Active Only</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="verified">Verified Only</option>
            </select>

            {/* Shuffle Button */}
            <Button
              onClick={shuffleCards}
              disabled={isAnimating || filteredCertificates.length <= 1}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>

          {/* Results Info */}
          <div className="text-center text-gray-400 text-sm">
            Showing {filteredCertificates.length} of {certificates.length} certificates
            {searchTerm && <span> for "{searchTerm}"</span>}
          </div>
        </div>

        {/* No Results */}
        {filteredCertificates.length === 0 && certificates.length > 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700 flex items-center justify-center">
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

        {/* Floating Card Stack */}
        {filteredCertificates.length > 0 && (
          <div className="relative">
            {/* Main Stack Container */}
            <div className="relative min-h-[700px] md:min-h-[800px] flex items-center justify-center mb-12">
              {/* Stack of Cards */}
              <div className="relative w-full max-w-2xl" style={{ perspective: '2000px' }}>
                {filteredCertificates.map((cert, index) => {
                  const statusInfo = getStatusInfo(cert);
                  const StatusIcon = statusInfo.icon;
                  const offset = index - currentIndex;
                  const absOffset = Math.abs(offset);
                  
                  // Only render cards that are close to current
                  if (absOffset > 3) return null;

                  // Calculate transform based on position in stack
                  let transform = '';
                  let opacity = 1;
                  let zIndex = filteredCertificates.length - absOffset;
                  let pointerEvents = 'auto';

                  if (offset === 0) {
                    // Front card
                    transform = 'translateX(0) translateY(0) rotateY(0deg) scale(1)';
                    opacity = 1;
                    zIndex = filteredCertificates.length + 10;
                  } else if (offset > 0) {
                    // Cards behind (to the right)
                    transform = `translateX(${offset * 30}px) translateY(${offset * 20}px) rotateY(-${offset * 5}deg) scale(${1 - offset * 0.1})`;
                    opacity = Math.max(0.3, 1 - offset * 0.2);
                    pointerEvents = 'none';
                  } else {
                    // Cards in front (to the left) - hidden
                    transform = `translateX(${offset * 30}px) translateY(${offset * 20}px) rotateY(${offset * 5}deg) scale(${1 + offset * 0.1})`;
                    opacity = 0;
                    pointerEvents = 'none';
                  }

                  const isExpired = cert.isExpired;

                  return (
                    <div
                      key={cert._id}
                      className="absolute inset-0 transition-all duration-700 ease-out"
                      style={{
                        transform,
                        opacity,
                        zIndex,
                        pointerEvents,
                        filter: isExpired ? 'grayscale(0.5)' : 'none'
                      }}
                    >
                      <div
                        className={`bg-gray-900 border-2 rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:shadow-blue-900/50 transition-all duration-300 ${
                          offset === 0 ? 'border-blue-500/50' : 'border-gray-700'
                        } ${cert.priority > 7 ? 'ring-2 ring-yellow-500/30' : ''}`}
                        onClick={() => offset === 0 && openModal(cert)}
                        style={{
                          height: '600px',
                          animation: offset === 0 ? 'float 3s ease-in-out infinite' : 'none'
                        }}
                      >
                        {/* Card Header */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-900 to-purple-900 overflow-hidden">
                          {cert.certificateImage?.url ? (
                            <img
                              src={cert.certificateImage.url}
                              alt={cert.title}
                              className="w-full h-full object-cover opacity-80"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Award className="w-24 h-24 text-white/20" />
                            </div>
                          )}
                          
                          {/* Priority Badge */}
                          {cert.priority > 0 && (
                            <div className="absolute top-4 left-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full flex items-center gap-1 font-bold shadow-lg">
                              <Star className="w-4 h-4 fill-current" />
                              {cert.priority}
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className={`absolute top-4 right-4 ${statusInfo.color} text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-lg`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.status === 'expired' ? 'Expired' : 
                             statusInfo.status === 'expiring' ? 'Expiring' : 'Active'}
                          </div>

                          {/* Logo Overlay */}
                          {cert.logo?.url && (
                            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-lg p-2 shadow-lg">
                              <img
                                src={cert.logo.url}
                                alt={`${cert.issuer} logo`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                              {cert.title}
                            </h3>
                            <div className="flex items-center text-gray-400 mb-3">
                              <Building className="w-4 h-4 mr-2" />
                              <span className="text-sm">{cert.issuer}</span>
                            </div>
                          </div>

                          {cert.description && (
                            <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                              {cert.description}
                            </p>
                          )}

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center text-green-400 mb-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="text-xs font-medium">Issued</span>
                              </div>
                              <div className="text-white text-sm font-semibold">
                                {formatDate(cert.issueDate)}
                              </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className={`flex items-center mb-1 ${statusInfo.textColor}`}>
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-xs font-medium">
                                  {cert.expiryDate ? 'Expires' : 'Valid'}
                                </span>
                              </div>
                              <div className="text-white text-sm font-semibold">
                                {formatDate(cert.expiryDate)}
                              </div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center justify-between pt-2">
                            {cert.difficulty && (
                              <Badge className={getDifficultyColor(cert.difficulty)}>
                                <Target className="w-3 h-3 mr-1" />
                                {cert.difficulty}
                              </Badge>
                            )}
                            
                            {cert.score && (
                              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {cert.score}
                              </Badge>
                            )}
                          </div>

                          {/* Tags */}
                          {cert.tags && cert.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {cert.tags.slice(0, 4).map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {cert.tags.length > 4 && (
                                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs">
                                  +{cert.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {cert.credentialUrl && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(cert.credentialUrl, '_blank');
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                            )}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(cert);
                              }}
                              variant="outline"
                              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 text-sm"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <Button
                onClick={prevCard}
                disabled={currentIndex === 0 || isAnimating}
                className="bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed w-12 h-12 rounded-full p-0 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                {filteredCertificates.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCard(index)}
                    disabled={isAnimating}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'w-8 h-3 bg-blue-500'
                        : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to certificate ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                onClick={nextCard}
                disabled={currentIndex === filteredCertificates.length - 1 || isAnimating}
                className="bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed w-12 h-12 rounded-full p-0 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Current Certificate Info */}
            {filteredCertificates[currentIndex] && (
              <div className="text-center text-gray-400 text-sm">
                <p>
                  Certificate {currentIndex + 1} of {filteredCertificates.length}
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  Use arrow keys to navigate • Click card for details
                </p>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700"
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