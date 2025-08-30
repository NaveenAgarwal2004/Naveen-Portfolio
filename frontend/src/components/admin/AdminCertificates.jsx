import React, { useState, useEffect, useCallback } from 'react';
import { 
  Award, Save, Upload, Trash2, Plus, Calendar, Building, 
  ExternalLink, IdCard, Image as ImageIcon, Edit, X, Eye,
  Download, Filter, Search, Grid3X3, List, CheckSquare,
  Square, Star, Target, GraduationCap, Clock, AlertTriangle,
  ShieldCheck, FileDown, Tags, SlidersHorizontal, Loader2
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    tags: [],
    priority: 0,
    isPublic: true,
    difficulty: 'Intermediate',
    duration: '',
    score: ''
  });
  const [errors, setErrors] = useState({});

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [certificatesResponse, tagsResponse] = await Promise.all([
        adminAPI.getCertificates(),
        adminAPI.getCertificateTags()
      ]);
      
      if (certificatesResponse.data.success) {
        setCertificates(certificatesResponse.data.data || []);
      }
      
      if (tagsResponse.data.success) {
        setAvailableTags(tagsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch certificates.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [certificates, searchTerm, filter, sortBy]);

  const applyFiltersAndSearch = () => {
    let filtered = [...certificates];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(term) ||
        cert.issuer.toLowerCase().includes(term) ||
        (cert.description && cert.description.toLowerCase().includes(term)) ||
        (cert.tags && cert.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(cert => {
        switch (filter) {
          case 'active':
            return cert.isActive && !cert.isExpired;
          case 'inactive':
            return !cert.isActive;
          case 'expired':
            return cert.isExpired;
          case 'expiring':
            return cert.isExpiringSoon && !cert.isExpired;
          case 'public':
            return cert.isPublic;
          case 'private':
            return !cert.isPublic;
          default:
            return true;
        }
      });
    }

    // Sort
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
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        case 'issueDate':
        default:
          return new Date(b.issueDate) - new Date(a.issueDate);
      }
    });

    setFilteredCertificates(filtered);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      description: '',
      tags: [],
      priority: 0,
      isPublic: true,
      difficulty: 'Intermediate',
      duration: '',
      score: ''
    });
    setErrors({});
    setEditingId(null);
    setShowAddForm(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.issuer.trim()) newErrors.issuer = 'Issuer is required';
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
    
    if (formData.credentialUrl && !formData.credentialUrl.startsWith('http')) {
      newErrors.credentialUrl = 'Please enter a valid URL starting with http or https';
    }
    
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
      newErrors.expiryDate = 'Expiry date must be after issue date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const certificateData = {
        ...formData,
        title: formData.title.trim(),
        issuer: formData.issuer.trim(),
        credentialId: formData.credentialId.trim(),
        credentialUrl: formData.credentialUrl.trim(),
        description: formData.description.trim(),
        duration: formData.duration.trim(),
        score: formData.score.trim(),
        priority: parseInt(formData.priority) || 0
      };

      if (editingId) {
        const response = await adminAPI.updateCertificate(editingId, certificateData);
        if (response.data.success) {
          toast({
            title: 'Certificate Updated',
            description: 'Certificate has been updated successfully.',
          });
        }
      } else {
        const response = await adminAPI.addCertificate(certificateData);
        if (response.data.success) {
          toast({
            title: 'Certificate Added',
            description: 'New certificate has been added successfully.',
          });
        }
      }
      
      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Certificate save error:', error);
      toast({
        title: 'Save Failed',
        description: `Failed to ${editingId ? 'update' : 'add'} certificate.`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (certificate) => {
    setFormData({
      title: certificate.title,
      issuer: certificate.issuer,
      issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
      expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate).toISOString().split('T')[0] : '',
      credentialId: certificate.credentialId || '',
      credentialUrl: certificate.credentialUrl || '',
      description: certificate.description || '',
      tags: certificate.tags || [],
      priority: certificate.priority || 0,
      isPublic: certificate.isPublic !== undefined ? certificate.isPublic : true,
      difficulty: certificate.difficulty || 'Intermediate',
      duration: certificate.duration || '',
      score: certificate.score || ''
    });
    setEditingId(certificate._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteCertificate(id);
      toast({
        title: 'Certificate Deleted',
        description: 'Certificate has been deleted successfully.',
      });
      await fetchData();
      setSelectedCerts(prev => prev.filter(certId => certId !== id));
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete certificate.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (certificateId, file, type = 'image') => {
    if (!file) return;

    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for images, 2MB for logos
    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      : ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File',
        description: `Please upload a valid ${type === 'image' ? 'image or PDF' : 'image'} file.`,
        variant: 'destructive',
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: `File must be less than ${maxSize / (1024 * 1024)}MB.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(certificateId + '-' + type);
    try {
      const response = type === 'image' 
        ? await adminAPI.uploadCertificateImage(certificateId, file)
        : await adminAPI.uploadCertificateLogo(certificateId, file);
        
      if (response.data.success) {
        toast({
          title: `${type === 'image' ? 'Certificate Image' : 'Logo'} Uploaded`,
          description: `${type === 'image' ? 'Certificate image' : 'Logo'} has been uploaded successfully.`,
        });
        await fetchData();
      }
    } catch (error) {
      console.error(`${type} upload error:`, error);
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${type === 'image' ? 'certificate image' : 'logo'}.`,
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCerts.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select certificates to perform bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    let confirmMessage = '';
    let data = {};

    switch (action) {
      case 'delete':
        confirmMessage = `Are you sure you want to delete ${selectedCerts.length} certificate(s)?`;
        break;
      case 'activate':
        confirmMessage = `Activate ${selectedCerts.length} certificate(s)?`;
        data = { isActive: true };
        break;
      case 'deactivate':
        confirmMessage = `Deactivate ${selectedCerts.length} certificate(s)?`;
        data = { isActive: false };
        break;
      case 'makePublic':
        confirmMessage = `Make ${selectedCerts.length} certificate(s) public?`;
        data = { isPublic: true };
        break;
      case 'makePrivate':
        confirmMessage = `Make ${selectedCerts.length} certificate(s) private?`;
        data = { isPublic: false };
        break;
      default:
        return;
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await adminAPI.bulkCertificateOperation(
        action === 'activate' || action === 'deactivate' ? 'updateStatus' :
        action === 'makePublic' || action === 'makePrivate' ? 'updateVisibility' :
        action,
        selectedCerts,
        data
      );

      if (response.data.success) {
        toast({
          title: 'Bulk Action Completed',
          description: `Successfully processed ${response.data.data.updatedCount} certificate(s).`,
        });
        await fetchData();
        setSelectedCerts([]);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        title: 'Bulk Action Failed',
        description: 'Failed to perform bulk action.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await adminAPI.exportCertificates(format);
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificates.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificates.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: 'Export Successful',
        description: `Certificates exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export certificates.',
        variant: 'destructive',
      });
    }
  };

  const toggleCertSelection = (certId) => {
    setSelectedCerts(prev => 
      prev.includes(certId) 
        ? prev.filter(id => id !== certId)
        : [...prev, certId]
    );
  };

  const selectAllCerts = () => {
    if (selectedCerts.length === filteredCertificates.length) {
      setSelectedCerts([]);
    } else {
      setSelectedCerts(filteredCertificates.map(cert => cert._id));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusInfo = (cert) => {
    if (cert.isExpired) {
      return {
        label: 'Expired',
        color: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: AlertTriangle
      };
    }
    
    if (cert.isExpiringSoon) {
      return {
        label: 'Expiring Soon',
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        icon: Clock
      };
    }
    
    return {
      label: 'Active',
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
      icon: ShieldCheck
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

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="space-y-4">
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Award className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-400" />
            Certificates Management
          </h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">
            Manage your professional certifications with images and detailed tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certificate
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {certificates.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* View Mode and Filters Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Certificates</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="expired">Expired</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="public">Public Only</option>
                    <option value="private">Private Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedCerts.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-yellow-300 font-medium">
                  {selectedCerts.length} certificate(s) selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('activate')}
                    className="border-green-600 text-green-300 hover:bg-green-700"
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('makePublic')}
                    className="border-blue-600 text-blue-300 hover:bg-blue-700"
                  >
                    Make Public
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('makePrivate')}
                    className="border-purple-600 text-purple-300 hover:bg-purple-700"
                  >
                    Make Private
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="border-red-600 text-red-300 hover:bg-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                {editingId ? 'Edit Certificate' : 'Add New Certificate'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="e.g., Amazon Web Services"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.issuer ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.issuer && <p className="text-red-400 text-sm mt-1">{errors.issuer}</p>}
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.issueDate ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.issueDate && <p className="text-red-400 text-sm mt-1">{errors.issueDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.expiryDate && <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>}
                </div>
              </div>

              {/* Credential Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                    placeholder="Certificate ID or credential number"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                    placeholder="https://..."
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.credentialUrl ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.credentialUrl && <p className="text-red-400 text-sm mt-1">{errors.credentialUrl}</p>}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 3 months, 6 weeks"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Score/Grade
                  </label>
                  <input
                    type="text"
                    value={formData.score}
                    onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                    placeholder="e.g., 95%, Pass, Distinction"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                      className="border-gray-600"
                    />
                    <span className="text-gray-300 text-sm">Public</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  }))}
                  placeholder="e.g., Cloud, AWS, Architecture"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-gray-500 text-xs mt-1">Separate tags with commas</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of the certification..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Update Certificate' : 'Add Certificate'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {certificates.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllCerts}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {selectedCerts.length === filteredCertificates.length ? (
                <CheckSquare className="h-4 w-4 mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Select All ({filteredCertificates.length})
            </Button>
            <span className="text-gray-400 text-sm">
              Showing {filteredCertificates.length} of {certificates.length} certificates
            </span>
          </div>
        </div>
      )}

      {/* Certificates Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => {
            const statusInfo = getStatusInfo(cert);
            const StatusIcon = statusInfo.icon;
            const isSelected = selectedCerts.includes(cert._id);
            
            return (
              <Card key={cert._id} className={`bg-gray-800 border-gray-700 relative ${isSelected ? 'ring-2 ring-yellow-500' : ''}`}>
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCertSelection(cert._id)}
                    className="border-gray-500 bg-gray-700"
                  />
                </div>

                {/* Priority Badge */}
                {cert.priority > 0 && (
                  <div className="absolute top-3 left-12 bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-current" />
                    {cert.priority}
                  </div>
                )}

                {/* Status Badge */}
                <Badge className={`absolute top-3 right-3 ${statusInfo.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>

                <CardHeader className="text-center pb-4 pt-12">
                  {/* Certificate Image or Logo */}
                  <div className="relative group">
                    {cert.certificateImage?.url ? (
                      <div className="w-20 h-20 mx-auto mb-4 relative">
                        <img 
                          src={cert.certificateImage.url} 
                          alt={`${cert.title} certificate`}
                          className="w-full h-full object-cover rounded-lg border border-gray-600"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    ) : cert.logo?.url ? (
                      <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-white/5 rounded-lg p-3">
                        <img 
                          src={cert.logo.url} 
                          alt={`${cert.issuer} logo`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-white text-lg leading-tight">
                    {cert.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="truncate">{cert.issuer}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(cert.issueDate)} - {formatDate(cert.expiryDate)}</span>
                  </div>
                  
                  {cert.difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Level:</span>
                      <Badge className={getDifficultyColor(cert.difficulty)}>
                        {cert.difficulty}
                      </Badge>
                    </div>
                  )}

                  {cert.score && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Score:</span>
                      <span className="text-white font-medium text-sm">{cert.score}</span>
                    </div>
                  )}

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
                  
                  {cert.credentialId && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <IdCard className="w-4 h-4 mr-2" />
                      <span className="font-mono text-xs bg-gray-700 px-2 py-1 rounded truncate">
                        {cert.credentialId}
                      </span>
                    </div>
                  )}

                  {/* Visibility Indicators */}
                  <div className="flex items-center gap-2 pt-2">
                    <Badge className={cert.isPublic ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>
                      {cert.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge className={cert.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                      {cert.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="pt-3 space-y-2">
                    {/* File Upload Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(cert._id, e.target.files[0], 'image')}
                          className="hidden"
                          id={`cert-image-upload-${cert._id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`cert-image-upload-${cert._id}`).click()}
                          disabled={uploading === cert._id + '-image'}
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                        >
                          {uploading === cert._id + '-image' ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {cert.certificateImage?.url ? 'Update' : 'Add'} Image
                            </>
                          )}
                        </Button>
                      </div>

                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(cert._id, e.target.files[0], 'logo')}
                          className="hidden"
                          id={`logo-upload-${cert._id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`logo-upload-${cert._id}`).click()}
                          disabled={uploading === cert._id + '-logo'}
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                        >
                          {uploading === cert._id + '-logo' ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-3 w-3 mr-1" />
                              {cert.logo?.url ? 'Update' : 'Add'} Logo
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cert)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cert._id)}
                        className="border-red-600 text-red-300 hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                    
                    {cert.credentialUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cert.credentialUrl, '_blank')}
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View Credential
                      </Button>
                    )}
                  </div>
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
            const isSelected = selectedCerts.includes(cert._id);
            
            return (
              <Card key={cert._id} className={`bg-gray-800 border-gray-700 ${isSelected ? 'ring-2 ring-yellow-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Selection and Image */}
                    <div className="flex flex-col items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCertSelection(cert._id)}
                        className="border-gray-500 bg-gray-700"
                      />
                      
                      {cert.certificateImage?.url ? (
                        <div className="w-16 h-16 relative group">
                          <img 
                            src={cert.certificateImage.url} 
                            alt={`${cert.title} certificate`}
                            className="w-full h-full object-cover rounded-lg border border-gray-600"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Certificate Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white text-xl font-semibold leading-tight mb-1">
                            {cert.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Building className="w-4 h-4" />
                            <span>{cert.issuer}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {cert.priority > 0 && (
                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {cert.priority}
                            </Badge>
                          )}
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-green-400" />
                            <span>Issued: {formatDate(cert.issueDate)}</span>
                          </div>
                          {cert.expiryDate && (
                            <div className="flex items-center text-gray-300 text-sm">
                              <Clock className="w-4 h-4 mr-2 text-red-400" />
                              <span>Expires: {formatDate(cert.expiryDate)}</span>
                            </div>
                          )}
                          {cert.duration && (
                            <div className="flex items-center text-gray-300 text-sm">
                              <Target className="w-4 h-4 mr-2 text-purple-400" />
                              <span>Duration: {cert.duration}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {cert.difficulty && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-purple-400" />
                              <Badge className={getDifficultyColor(cert.difficulty)}>
                                {cert.difficulty}
                              </Badge>
                            </div>
                          )}
                          {cert.score && (
                            <div className="flex items-center text-gray-300 text-sm">
                              <Star className="w-4 h-4 mr-2 text-yellow-400" />
                              <span>Score: {cert.score}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge className={cert.isPublic ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>
                              {cert.isPublic ? 'Public' : 'Private'}
                            </Badge>
                            <Badge className={cert.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                              {cert.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {cert.tags && cert.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {cert.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {cert.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {cert.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-0 w-48">
                      {/* File Upload Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload(cert._id, e.target.files[0], 'image')}
                            className="hidden"
                            id={`list-cert-image-${cert._id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`list-cert-image-${cert._id}`).click()}
                            disabled={uploading === cert._id + '-image'}
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                          >
                            {uploading === cert._id + '-image' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <ImageIcon className="h-3 w-3" />
                            )}
                          </Button>
                        </div>

                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(cert._id, e.target.files[0], 'logo')}
                            className="hidden"
                            id={`list-logo-${cert._id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`list-logo-${cert._id}`).click()}
                            disabled={uploading === cert._id + '-logo'}
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                          >
                            {uploading === cert._id + '-logo' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Main Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cert)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cert._id)}
                          className="border-red-600 text-red-300 hover:bg-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                      
                      {cert.credentialUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(cert.credentialUrl, '_blank')}
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View
                        </Button>
                      )}

                      {/* Image Preview Links */}
                      <div className="flex gap-1">
                        {cert.certificateImage?.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(cert.certificateImage.url, '_blank')}
                            className="flex-1 border-blue-600 text-blue-300 hover:bg-blue-700 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        {cert.logo?.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(cert.logo.url, '_blank')}
                            className="flex-1 border-green-600 text-green-300 hover:bg-green-700 text-xs"
                          >
                            <Building className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {certificates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700 flex items-center justify-center">
            <Award className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No certificates yet</h3>
          <p className="text-gray-400 mb-6">Start by adding your first professional certificate with images.</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Certificate
          </Button>
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
              setSortBy('issueDate');
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;