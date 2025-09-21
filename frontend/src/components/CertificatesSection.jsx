import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ExternalLink, Award, Calendar, Building, AlertCircle, RefreshCcw, 
  IdCard, CheckCircle, Clock, Filter, Search, ChevronDown, Image as ImageIcon,
  Eye, X, Download, Star, MapPin, Trophy, Target, Timer, GraduationCap,
  Zap, ShieldCheck, AlertTriangle, Grid3X3, List, SlidersHorizontal
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
  const [sortBy, setSortBy] = useState('issueDate');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch certificates and stats
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
      
      setCertificates(certificatesResponse.data.data || []);
      setStats(statsResponse.data.success ? statsResponse.data.data : {});
      
    } catch (err) {
      setError('Unable to load certificates. Please try again later.');
      console.error('Certificates fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [certificates, searchTerm, filter, sortBy]);

  const applyFiltersAndSearch = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(term) ||
        cert.issuer.toLowerCase().includes(term) ||
        (cert.description && cert.description.toLowerCase().includes(term)) ||
        (cert.tags && cert.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Apply status filter
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

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'issuer':
          return a.issuer.localeCompare(b.issuer);
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'expiryDate':
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(b.expiryDate) - new Date(a.expiryDate);
        case 'issueDate':
        default:
          return new Date(b.issueDate) - new Date(a.issueDate);
      }
    });

    setFilteredCertificates(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  const openModal = (certificate) => {
    setSelectedCertificate(certificate);
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-6 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{certificate.title}</h2>
              <div className="flex items-center gap-4 text-gray-400">
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

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Certificate Image */}
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

            {/* Certificate Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
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

              {/* Right Column */}
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

            {/* Description */}
            {certificate.description && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{certificate.description}</p>
              </div>
            )}

            {/* Actions */}
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
      <section id="certificates" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Professional Certifications</h2>
          
          {/* Loading skeleton */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse max-w-md mx-auto mb-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4 mx-auto"></div>
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
      <section id="certificates" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
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
    <section id="certificates" className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        {/* Header with enhanced stats */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Professional Certifications</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            Validated expertise through industry-recognized certifications and continuous learning
          </p>
          
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
              <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                {stats.total || certificates.length}
              </div>
              <div className="text-gray-400 text-sm">Total Earned</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
              <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                {stats.active || 0}
              </div>
              <div className="text-gray-400 text-sm">Currently Valid</div>
            </div>
            {(stats.expiring > 0 || certificates.some(c => c.isExpiringSoon)) && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6" />
                  {stats.expiring || certificates.filter(c => c.isExpiringSoon).length}
                </div>
                <div className="text-gray-400 text-sm">Expiring Soon</div>
              </div>
            )}
            {stats.recentlyAdded > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6" />
                  {stats.recentlyAdded}
                </div>
                <div className="text-gray-400 text-sm">Recently Added</div>
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

        {/* Enhanced Search and Filter Controls */}
        {certificates.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Search Bar with View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search certificates, issuers, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Advanced Filter Controls */}
            {showFilters && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Certificates</option>
                      <option value="active">Active Only</option>
                      <option value="expiring">Expiring Soon</option>
                      <option value="expired">Expired</option>
                      <option value="verified">Verified Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="issueDate">Issue Date (Newest)</option>
                      <option value="expiryDate">Expiry Date</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="issuer">Issuer (A-Z)</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                        setSortBy('issueDate');
                      }}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Info */}
        {certificates.length > 0 && (
          <div className="text-center mb-6 text-gray-400">
            Showing {filteredCertificates.length} of {certificates.length} certificates
            {searchTerm && <span> for "{searchTerm}"</span>}
          </div>
        )}

        {/* Certificates Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => {
              const statusInfo = getStatusInfo(cert);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card 
                  key={cert._id} 
                  className={`bg-gray-900/80 backdrop-blur border-gray-700 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 group relative overflow-hidden cursor-pointer ${
                    statusInfo.status === 'expired' ? 'opacity-75' : ''
                  }`}
                  onClick={() => openModal(cert)}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Priority Star */}
                  {cert.priority > 0 && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                      <Star className="w-3 h-3 fill-current" />
                      {cert.priority}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 ${statusInfo.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.status === 'expired' ? 'Expired' : 
                     statusInfo.status === 'expiring' ? 'Expiring' : 'Active'}
                  </div>

                  <CardHeader className="text-center pb-4 relative z-10">
                    {/* Logo or Certificate Image */}
                    <div className="relative">
                      {cert.certificateImage?.url ? (
                        <div className="w-20 h-20 mx-auto mb-4 relative group/image">
                          <img 
                            src={cert.certificateImage.url} 
                            alt={`${cert.title} certificate`}
                            className="w-full h-full object-cover rounded-xl border border-gray-600 group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/40 transition-colors duration-300 rounded-xl flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      ) : cert.logo?.url ? (
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-white/5 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                          <img 
                            src={cert.logo.url} 
                            alt={`${cert.issuer} logo`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                  <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Award className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <CardTitle className="text-white text-lg leading-tight hover:text-blue-300 transition-colors duration-300">
                      {cert.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 relative z-10">
                    {/* Issuer */}
                    <div className="flex items-center text-gray-300 text-sm">
                      <Building className="w-4 h-4 mr-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate font-medium">{cert.issuer}</span>
                    </div>
                    
                    {/* Date Information */}
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate">Issued: {formatDate(cert.issueDate)}</div>
                          {cert.expiryDate && (
                            <div className={`truncate text-xs ${statusInfo.textColor}`}>
                              Expires: {formatDate(cert.expiryDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status and Difficulty */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center text-sm ${statusInfo.textColor}`}>
                        <StatusIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="font-medium truncate">{statusInfo.label}</span>
                      </div>
                      {cert.difficulty && (
                        <Badge className={getDifficultyColor(cert.difficulty)}>
                          {cert.difficulty}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {cert.tags && cert.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cert.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {cert.tags.length > 3 && (
                          <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs">
                            +{cert.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Credential ID */}
                    {cert.credentialId && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <IdCard className="w-4 h-4 mr-3 text-yellow-400 flex-shrink-0" />
                        <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded truncate">
                          {cert.credentialId}
                        </span>
                      </div>
                    )}
                    
                    {/* Score */}
                    {cert.score && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <GraduationCap className="w-4 h-4 mr-3 text-purple-400 flex-shrink-0" />
                        <span className="font-semibold text-white">{cert.score}</span>
                      </div>
                    )}

                    {/* Certificate Image Indicator */}
                    {cert.certificateImage?.url && (
                      <div className="flex items-center text-blue-400 text-sm">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        <span>Certificate Available</span>
                      </div>
                    )}
                    
                    {/* Action Button */}
                    {cert.credentialUrl && (
                      <div className="pt-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(cert.credentialUrl, '_blank');
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify Certificate
                        </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredCertificates.map((cert) => {
              const statusInfo = getStatusInfo(cert);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card 
                  key={cert._id} 
                  className={`bg-gray-900/80 backdrop-blur border-gray-700 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 cursor-pointer ${
                    statusInfo.status === 'expired' ? 'opacity-75' : ''
                  }`}
                  onClick={() => openModal(cert)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Logo/Image */}
                      <div className="flex-shrink-0">
                        {cert.certificateImage?.url ? (
                          <div className="w-16 h-16 relative group/image">
                            <img 
                              src={cert.certificateImage.url} 
                              alt={`${cert.title} certificate`}
                              className="w-full h-full object-cover rounded-lg border border-gray-600"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/40 transition-colors duration-300 rounded-lg flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        ) : cert.logo?.url ? (
                          <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-lg p-2">
                            <img 
                              src={cert.logo.url} 
                              alt={`${cert.issuer} logo`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Certificate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white text-xl font-semibold leading-tight truncate pr-4">
                            {cert.title}
                          </h3>
                          {cert.priority > 0 && (
                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex-shrink-0">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {cert.priority}
                            </Badge>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-300 text-sm">
                              <Building className="w-4 h-4 mr-2 text-blue-400" />
                              <span className="truncate">{cert.issuer}</span>
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-green-400" />
                              <span>{formatDate(cert.issueDate)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className={`flex items-center text-sm ${statusInfo.textColor}`}>
                              <StatusIcon className="w-4 h-4 mr-2" />
                              <span className="truncate">{statusInfo.label}</span>
                            </div>
                            {cert.difficulty && (
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-400" />
                                <Badge className={getDifficultyColor(cert.difficulty)}>
                                  {cert.difficulty}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tags and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {cert.tags && cert.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {cert.tags && cert.tags.length > 2 && (
                              <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs">
                                +{cert.tags.length - 2}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {cert.certificateImage?.url && (
                              <div className="text-blue-400 text-xs flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>Image</span>
                              </div>
                            )}
                            {cert.credentialUrl && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(cert.credentialUrl, '_blank');
                                }}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs px-3 py-1"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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