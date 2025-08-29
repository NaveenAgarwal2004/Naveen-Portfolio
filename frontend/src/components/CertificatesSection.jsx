import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Award, Calendar, Building, AlertCircle, RefreshCcw, IdCard, CheckCircle, Clock, Filter, Search, ChevronDown } from 'lucide-react';
import { certificatesAPI } from '../services/api';

const CertificatesSection = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired, expiring
  const [sortBy, setSortBy] = useState('issueDate'); // issueDate, expiryDate, title
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [certificates, searchTerm, filter, sortBy]);

  const fetchCertificates = async () => {
    try {
      setError('');
      setLoading(true);
      
      const response = await certificatesAPI.getCertificates();
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch certificates');
      }
      
      setCertificates(response.data.data || []);
      
    } catch (err) {
      setError('Unable to load certificates. Please try again later.');
      console.error('Certificates fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(term) ||
        cert.issuer.toLowerCase().includes(term) ||
        (cert.description && cert.description.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(cert => {
        const expired = isExpired(cert.expiryDate);
        const expiring = isExpiringSoon(cert.expiryDate);
        
        switch (filter) {
          case 'active':
            return !expired;
          case 'expired':
            return expired;
          case 'expiring':
            return expiring && !expired;
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
    return diffDays <= 90 && diffDays > 0;
  };

  const getStatusInfo = (cert) => {
    const expired = isExpired(cert.expiryDate);
    const expiring = isExpiringSoon(cert.expiryDate);
    
    if (expired) {
      return {
        status: 'expired',
        label: 'Expired',
        color: 'bg-red-500',
        textColor: 'text-red-400',
        icon: AlertCircle
      };
    }
    
    if (expiring) {
      return {
        status: 'expiring',
        label: `Expires in ${getRelativeTime(cert.expiryDate)}`,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        icon: Clock
      };
    }
    
    return {
      status: 'active',
      label: cert.expiryDate ? `Valid for ${getRelativeTime(cert.expiryDate)}` : 'Active',
      color: 'bg-green-500',
      textColor: 'text-green-400',
      icon: CheckCircle
    };
  };

  const getCertificateStats = () => {
    const total = certificates.length;
    const active = certificates.filter(cert => !isExpired(cert.expiryDate)).length;
    const expired = certificates.filter(cert => isExpired(cert.expiryDate)).length;
    const expiring = certificates.filter(cert => isExpiringSoon(cert.expiryDate) && !isExpired(cert.expiryDate)).length;
    
    return { total, active, expired, expiring };
  };

  const stats = getCertificateStats();

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
                onClick={fetchCertificates}
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
        {/* Header with stats */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Professional Certifications</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            Validated expertise through industry-recognized certifications and continuous learning
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="text-gray-400 text-sm">Active</div>
            </div>
            {stats.expiring > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.expiring}</div>
                <div className="text-gray-400 text-sm">Expiring Soon</div>
              </div>
            )}
            {stats.expired > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
                <div className="text-gray-400 text-sm">Expired</div>
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
              onClick={fetchCertificates}
              className="ml-2 border-red-600 text-red-300 hover:text-white hover:border-red-400"
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Search and Filter Controls */}
        {certificates.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters & Sort
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
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
                    </select>
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

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => {
            const statusInfo = getStatusInfo(cert);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card 
                key={cert._id} 
                className={`bg-gray-900/80 backdrop-blur border-gray-700 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-500 group relative overflow-hidden ${
                  statusInfo.status === 'expired' ? 'opacity-75' : ''
                }`}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 ${statusInfo.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.status === 'expired' ? 'Expired' : 
                   statusInfo.status === 'expiring' ? 'Expiring' : 'Active'}
                </div>

                <CardHeader className="text-center pb-4 relative z-10">
                  {/* Logo or fallback */}
                  <div className="relative">
                    {cert.logo?.url ? (
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
                  
                  {/* Status */}
                  <div className={`flex items-center text-sm ${statusInfo.textColor}`}>
                    <StatusIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="font-medium">{statusInfo.label}</span>
                  </div>
                  
                  {/* Credential ID */}
                  {cert.credentialId && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <IdCard className="w-4 h-4 mr-3 text-yellow-400 flex-shrink-0" />
                      <span className="font-mono text-xs bg-gray-800 px-2 py-1 rounded truncate">
                        {cert.credentialId}
                      </span>
                    </div>
                  )}
                  
                  {/* Description */}
                  {cert.description && (
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {cert.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  {cert.credentialUrl && (
                    <div className="pt-2">
                      <Button
                        onClick={() => window.open(cert.credentialUrl, '_blank')}
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
            onClick={fetchCertificates}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 hover:bg-gray-700"
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