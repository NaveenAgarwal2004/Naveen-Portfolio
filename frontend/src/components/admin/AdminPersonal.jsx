import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  Upload, 
  Eye, 
  EyeOff,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const AdminPersonal = () => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    tagline: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    profileImageUrl: '',
    resumeUrl: '',
    frontendResumeUrl: '',
    backendResumeUrl: '',
    skills: [
      { name: '', level: 50 }
    ],
    socialLinks: {
      github: '',
      linkedin: '',
      email: '',
      twitter: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    skills: false,
    contact: false,
    social: false,
    files: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonalData();
  }, []);

  const fetchPersonalData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPersonal();
      
      if (response.data.success) {
        const data = response.data.data;
        
        setFormData({
          name: data.name || '',
          title: data.title || '',
          tagline: data.tagline || '',
          bio: data.bio || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          profileImageUrl: data.profileImageUrl || '',
          resumeUrl: data.resumeUrl || '',
          frontendResumeUrl: data.frontendResumeUrl || '',
          backendResumeUrl: data.backendResumeUrl || '',
          skills: data.skills && data.skills.length > 0 ? data.skills : [{ name: '', level: 50 }],
          socialLinks: {
            github: data.socialLinks?.github || '',
            linkedin: data.socialLinks?.linkedin || '',
            email: data.socialLinks?.email || '',
            twitter: data.socialLinks?.twitter || ''
          }
        });
        
        setOriginalData(data);
      }
    } catch (error) {
      console.error('❌ Error fetching personal data:', error);
      console.error('❌ Error details:', error.response?.data);
      toast({
        title: 'Error',
        description: 'Failed to fetch personal information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 50 }]
    }));
  };

  const removeSkill = (index) => {
    if (formData.skills.length <= 1) {
      toast({
        title: 'Cannot Remove Skill',
        description: 'You must have at least one skill.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.tagline.trim()) newErrors.tagline = 'Tagline is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // URL validation for social links
    const urlPattern = /^https?:\/\/.+/;
    if (formData.socialLinks.github && !urlPattern.test(formData.socialLinks.github)) {
      newErrors['socialLinks.github'] = 'Please enter a valid URL';
    }
    if (formData.socialLinks.linkedin && !urlPattern.test(formData.socialLinks.linkedin)) {
      newErrors['socialLinks.linkedin'] = 'Please enter a valid URL';
    }
    if (formData.socialLinks.twitter && !urlPattern.test(formData.socialLinks.twitter)) {
      newErrors['socialLinks.twitter'] = 'Please enter a valid URL';
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

    // Filter out skills with empty names before sending to backend
    const filteredFormData = {
      ...formData,
      skills: formData.skills.filter(skill => skill.name.trim() !== '')
    };

    setSaving(true);
    try {
      const response = await adminAPI.updatePersonal(filteredFormData);
      if (response.data.success) {
        toast({
          title: 'Personal Info Updated',
          description: 'Your personal information has been updated successfully.',
        });
        setOriginalData(filteredFormData);
        
        // Refetch personal data to update state with latest info
        await fetchPersonalData();
        
        // Dispatch a custom event to notify other components that personal data has been updated
        window.dispatchEvent(new CustomEvent('personalDataUpdated'));
      } else {
        toast({
          title: 'Update Failed',
          description: response.data.message || 'Failed to update personal information.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating personal information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e, resumeType = 'main') => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Resume file must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingResume(true);
    try {
      let response;
      if (resumeType === 'frontend') {
        response = await adminAPI.uploadFrontendResume(file);
      } else if (resumeType === 'backend') {
        response = await adminAPI.uploadBackendResume(file);
      } else {
        response = await adminAPI.uploadResume(file);
      }
      
      if (response.data.success) {
        if (resumeType === 'frontend') {
          setFormData(prev => ({
            ...prev,
            frontendResumeUrl: response.data.data.url
          }));
        } else if (resumeType === 'backend') {
          setFormData(prev => ({
            ...prev,
            backendResumeUrl: response.data.data.url
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            resumeUrl: response.data.data.url
          }));
        }
        toast({
          title: 'Resume Uploaded',
          description: `Your ${resumeType} resume has been uploaded successfully. Don't forget to save changes!`,
        });
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${resumeType} resume.`,
        variant: 'destructive',
      });
    } finally {
      setUploadingResume(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
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

    setUploadingImage(true);
    try {
      console.log("📤 Uploading profile image...");
      const response = await adminAPI.uploadProfileImage(file);
      console.log("📸 Upload response:", response.data);
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          profileImageUrl: response.data.data.url
        }));
        
        toast({
          title: 'Profile Image Uploaded',
          description: 'Your profile image has been uploaded successfully. Don\'t forget to save changes!',
        });
      }
    } catch (error) {
      console.error('❌ Profile image upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const hasChanges = originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="space-y-4">
            <div className="h-96 bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
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
            <User className="h-6 w-6 lg:h-8 lg:w-8 text-blue-400" />
            Personal Information
          </h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">
            Manage your personal details, contact information, and social links.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm lg:text-base"
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            type="submit"
            form="personal-form"
            disabled={saving || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-sm lg:text-base"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-sm font-medium">You have unsaved changes</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Accordion Layout */}
      <div className="lg:hidden space-y-4">
        <form id="personal-form" onSubmit={handleSubmit}>
          {/* Basic Info Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('basic')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Basic Information</CardTitle>
                {expandedSections.basic ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
            {expandedSections.basic && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Front-End Developer"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tagline *
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="A brief, catchy description of what you do"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tagline ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.tagline && <p className="text-red-400 text-sm mt-1">{errors.tagline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell your story, highlight your experience and passion..."
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      errors.bio ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Files Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('files')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Files & Media</CardTitle>
                {expandedSections.files ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
            {expandedSections.files && (
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Profile Image
                  </label>
                  <div className="flex flex-col items-center gap-4">
                    {formData.profileImageUrl ? (
                      <img 
                        src={formData.profileImageUrl} 
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                        onError={(e) => {
                          console.error('❌ Profile image failed to load:', formData.profileImageUrl);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Profile image loaded successfully:', formData.profileImageUrl);
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById('profile-image').click()}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Recommended: 400x400px, Max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Resumes/CVs
                  </label>
                  <div className="space-y-4">
                    {/* Main Resume */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Main Resume</span>
                        {formData.resumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(formData.resumeUrl, '_blank')}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            View
                          </Button>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleResumeUpload(e, 'main')}
                          className="hidden"
                          id="resume-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                          disabled={uploadingResume}
                          onClick={() => document.getElementById('resume-upload').click()}
                        >
                          {uploadingResume ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Frontend Resume */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Frontend Resume</span>
                        {formData.frontendResumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(formData.frontendResumeUrl, '_blank')}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            View
                          </Button>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleResumeUpload(e, 'frontend')}
                          className="hidden"
                          id="frontend-resume-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                          disabled={uploadingResume}
                          onClick={() => document.getElementById('frontend-resume-upload').click()}
                        >
                          {uploadingResume ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.frontendResumeUrl ? 'Replace Resume' : 'Upload Resume'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Backend Resume */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Backend Resume</span>
                        {formData.backendResumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(formData.backendResumeUrl, '_blank')}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            View
                          </Button>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleResumeUpload(e, 'backend')}
                          className="hidden"
                          id="backend-resume-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                          disabled={uploadingResume}
                          onClick={() => document.getElementById('backend-resume-upload').click()}
                        >
                          {uploadingResume ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.backendResumeUrl ? 'Replace Resume' : 'Upload Resume'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Skills Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('skills')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Technical Skills</CardTitle>
                {expandedSections.skills ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
            {expandedSections.skills && (
              <CardContent className="space-y-4">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                        placeholder="Skill name"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0%</span>
                        <span>{skill.level}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSkill(index)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                    >
                      Remove Skill
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                >
                  Add Skill
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Contact Info Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('contact')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Contact Information</CardTitle>
                {expandedSections.contact ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
            {expandedSections.contact && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Social Links Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('social')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Social Links</CardTitle>
                {expandedSections.social ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </CardHeader>
            {expandedSections.social && (
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Profile
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="socialLinks.github"
                      value={formData.socialLinks.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['socialLinks.github'] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors['socialLinks.github'] && <p className="text-red-400 text-sm mt-1">{errors['socialLinks.github']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['socialLinks.linkedin'] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors['socialLinks.linkedin'] && <p className="text-red-400 text-sm mt-1">{errors['socialLinks.linkedin']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter Profile
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/username"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['socialLinks.twitter'] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors['socialLinks.twitter'] && <p className="text-red-400 text-sm mt-1">{errors['socialLinks.twitter']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="socialLinks.email"
                      value={formData.socialLinks.email}
                      onChange={handleChange}
                      placeholder="mailto:contact@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </form>
      </div>

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="personal-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Front-End Developer"
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tagline *
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="A brief, catchy description of what you do"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tagline ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.tagline && <p className="text-red-400 text-sm mt-1">{errors.tagline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell your story, highlight your experience and passion..."
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      errors.bio ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Technical Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.skills.map((skill, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      placeholder="Skill name"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>{skill.level}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSkill(index)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
              >
                Add Skill
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Profile
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="socialLinks.github"
                      value={formData.socialLinks.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['socialLinks.github'] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors['socialLinks.github'] && <p className="text-red-400 text-sm mt-1">{errors['socialLinks.github']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['socialLinks.linkedin'] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors['socialLinks.linkedin'] && <p className="text-red-400 text-sm mt-1">{errors['socialLinks.linkedin']}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter Profile
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/username"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['socialLinks.twitter'] ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors['socialLinks.twitter'] && <p className="text-red-400 text-sm mt-1">{errors['socialLinks.twitter']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="socialLinks.email"
                      value={formData.socialLinks.email}
                      onChange={handleChange}
                      placeholder="mailto:contact@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files & Preview */}
        <div className="space-y-6">
          {/* File Uploads */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Files & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  {formData.profileImageUrl ? (
                    <img 
                      src={formData.profileImageUrl} 
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                      onError={(e) => {
                        console.error('❌ Profile image failed to load:', formData.profileImageUrl);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('✅ Profile image loaded successfully:', formData.profileImageUrl);
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-desktop"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('profile-image-desktop').click()}
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended: 400x400px, Max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resumes/CVs
                </label>
                <div className="space-y-4">
                  {/* Main Resume */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Main Resume</span>
                      {formData.resumeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(formData.resumeUrl, '_blank')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          View
                        </Button>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleResumeUpload(e, 'main')}
                        className="hidden"
                        id="resume-upload-desktop"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                        disabled={uploadingResume}
                        onClick={() => document.getElementById('resume-upload-desktop').click()}
                      >
                        {uploadingResume ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            {formData.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Frontend Resume */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Frontend Resume</span>
                      {formData.frontendResumeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(formData.frontendResumeUrl, '_blank')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          View
                        </Button>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleResumeUpload(e, 'frontend')}
                        className="hidden"
                        id="frontend-resume-upload-desktop"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                        disabled={uploadingResume}
                        onClick={() => document.getElementById('frontend-resume-upload-desktop').click()}
                      >
                        {uploadingResume ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            {formData.frontendResumeUrl ? 'Replace Resume' : 'Upload Resume'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Backend Resume */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Backend Resume</span>
                      {formData.backendResumeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(formData.backendResumeUrl, '_blank')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          View
                        </Button>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleResumeUpload(e, 'backend')}
                        className="hidden"
                        id="backend-resume-upload-desktop"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                        disabled={uploadingResume}
                        onClick={() => document.getElementById('backend-resume-upload-desktop').click()}
                      >
                        {uploadingResume ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            {formData.backendResumeUrl ? 'Replace Resume' : 'Upload Resume'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-750 border border-gray-600 rounded-lg p-6 space-y-4">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4">
                    {formData.profileImageUrl ? (
                      <img 
                        src={formData.profileImageUrl} 
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          console.error('❌ Preview image failed to load:', formData.profileImageUrl);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Preview image loaded successfully:', formData.profileImageUrl);
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {formData.name || 'Your Name'}
                      </h3>
                      <p className="text-blue-400">
                        {formData.title || 'Your Title'}
                      </p>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-gray-300 italic">
                    "{formData.tagline || 'Your tagline will appear here...'}"
                  </p>

                  {/* Bio */}
                  <div>
                    <h4 className="text-white font-medium mb-2">About</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {formData.bio || 'Your bio will appear here...'}
                    </p>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Contact</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      {formData.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{formData.email}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{formData.phone}</span>
                        </div>
                      )}
                      {formData.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{formData.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Social Links</h4>
                    <div className="flex gap-3">
                      {formData.socialLinks.github && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                          <Github className="h-4 w-4" />
                        </Button>
                      )}
                      {formData.socialLinks.linkedin && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      )}
                      {formData.socialLinks.twitter && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                          <Twitter className="h-4 w-4" />
                        </Button>
                      )}
                      {formData.socialLinks.email && (
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Resumes */}
                  {(formData.resumeUrl || formData.frontendResumeUrl || formData.backendResumeUrl) && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Resumes</h4>
                      <div className="flex flex-col gap-2">
                        {formData.resumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 justify-start"
                            onClick={() => window.open(formData.resumeUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Main Resume
                          </Button>
                        )}
                        {formData.frontendResumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 justify-start"
                            onClick={() => window.open(formData.frontendResumeUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Frontend Resume
                          </Button>
                        )}
                        {formData.backendResumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 justify-start"
                            onClick={() => window.open(formData.backendResumeUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Backend Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Preview */}
                  {formData.skills.some(skill => skill.name.trim()) && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills
                          .filter(skill => skill.name.trim())
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                            >
                              {skill.name} ({skill.level}%)
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Preview */}
      {showPreview && (
        <div className="lg:hidden">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 space-y-4">
                {/* Profile Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {formData.profileImageUrl ? (
                    <img 
                      src={formData.profileImageUrl} 
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-white">
                      {formData.name || 'Your Name'}
                    </h3>
                    <p className="text-blue-400">
                      {formData.title || 'Your Title'}
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-gray-300 italic text-sm text-center sm:text-left">
                  "{formData.tagline || 'Your tagline will appear here...'}"
                </p>

                {/* Bio */}
                <div>
                  <h4 className="text-white font-medium mb-2">About</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {formData.bio || 'Your bio will appear here...'}
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-white font-medium mb-2">Contact</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    {formData.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="break-all">{formData.email}</span>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{formData.phone}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="text-white font-medium mb-2">Social Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.socialLinks.github && (
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                    {formData.socialLinks.linkedin && (
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                    {formData.socialLinks.twitter && (
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                        <Twitter className="h-4 w-4" />
                      </Button>
                    )}
                    {formData.socialLinks.email && (
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Skills Preview */}
                {formData.skills.some(skill => skill.name.trim()) && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills
                        .filter(skill => skill.name.trim())
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
                          >
                            {skill.name} ({skill.level}%)
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPersonal;