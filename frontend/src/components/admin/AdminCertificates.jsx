import React, { useState, useEffect } from 'react';
import { 
  Award, Save, Upload, Trash2, Plus, Calendar, Building, 
  ExternalLink, IdCard, Image as ImageIcon, Edit, X
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const { toast } = useToast();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCertificates();
      if (response.data.success) {
        setCertificates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch certificates.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      description: ''
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
    
    // URL validation
    if (formData.credentialUrl && !formData.credentialUrl.startsWith('http')) {
      newErrors.credentialUrl = 'Please enter a valid URL starting with http or https';
    }
    
    // Date validation
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
        description: formData.description.trim()
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
      
      await fetchCertificates();
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
      description: certificate.description || ''
    });
    setEditingId(certificate._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      await adminAPI.deleteCertificate(id);
      toast({
        title: 'Certificate Deleted',
        description: 'Certificate has been deleted successfully.',
      });
      await fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete certificate.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUpload = async (certificateId, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image file must be less than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const response = await adminAPI.uploadCertificateLogo(certificateId, file);
      if (response.data.success) {
        toast({
          title: 'Logo Uploaded',
          description: 'Certificate logo has been uploaded successfully.',
        });
        await fetchCertificates();
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload certificate logo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Award className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-400" />
            Certificates Management
          </h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">
            Manage your professional certifications and achievements.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certificate
        </Button>
      </div>

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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      {/* Certificates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card key={cert._id} className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center pb-4">
              {cert.logo?.url ? (
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <img 
                    src={cert.logo.url} 
                    alt={`${cert.issuer} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-600 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              )}
              
              <CardTitle className="text-white text-lg leading-tight">
                {cert.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center text-gray-400 text-sm">
                <Building className="w-4 h-4 mr-2" />
                {cert.issuer}
              </div>
              
              <div className="flex items-center text-gray-400 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(cert.issueDate)} - {formatDate(cert.expiryDate)}
              </div>
              
              {cert.credentialId && (
                <div className="flex items-center text-gray-400 text-sm">
                  <IdCard className="w-4 h-4 mr-2" />
                  <span className="font-mono text-xs">{cert.credentialId}</span>
                </div>
              )}
              
              <div className="pt-3 space-y-2">
                {/* Logo Upload */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(cert._id, e.target.files[0])}
                    className="hidden"
                    id={`logo-upload-${cert._id}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`logo-upload-${cert._id}`).click()}
                    disabled={uploading}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cert)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cert._id)}
                    className="flex-1 border-red-600 text-red-300 hover:bg-red-700"
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
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700 flex items-center justify-center">
            <Award className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No certificates yet</h3>
          <p className="text-gray-400 mb-6">Start by adding your first professional certificate.</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Certificate
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;