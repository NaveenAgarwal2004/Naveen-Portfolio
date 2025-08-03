import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Save, 
  ArrowLeft, 
  Upload, 
  Eye, 
  Github, 
  ExternalLink,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const AdminProjectNew = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web',
    image: '',
    imagePublicId: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    order: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image file must be less than 3MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const response = await adminAPI.uploadProjectImage(file);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          image: response.data.data.url,
          imagePublicId: response.data.data.publicId
        }));
        toast({
          title: 'Project Image Uploaded',
          description: 'Your project image has been uploaded successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload project image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.image.trim()) newErrors.image = 'Project image is required';
    if (!formData.githubUrl.trim()) newErrors.githubUrl = 'GitHub URL is required';
    if (!formData.liveUrl.trim()) newErrors.liveUrl = 'Live URL is required';
    if (!formData.techStack.trim()) newErrors.techStack = 'At least one technology is required';
    
    // URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL starting with http:// or https://';
    }
    if (formData.liveUrl && !urlPattern.test(formData.liveUrl)) {
      newErrors.liveUrl = 'Please enter a valid URL starting with http:// or https://';
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

    setLoading(true);
    try {
      // Convert techStack string to array
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(Boolean);
      
      const payload = { 
        ...formData, 
        techStack: techStackArray,
        order: parseInt(formData.order) || 0
      };
      
      const response = await adminAPI.createProject(payload);
      if (response.data.success) {
        toast({
          title: 'Project Created',
          description: `"${formData.title}" has been created successfully.`,
        });
        navigate('/admin/projects');
      } else {
        toast({
          title: 'Creation Failed',
          description: response.data.message || 'Failed to create the project.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the project.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const techStackArray = formData.techStack
    ? formData.techStack.split(',').map(tech => tech.trim()).filter(Boolean)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/admin/projects">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Projects
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Plus className="h-8 w-8 text-green-400" />
            Add New Project
          </h1>
          <p className="text-gray-400 mt-2">
            Create a new project to showcase in your portfolio.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreview(!preview)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            {preview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectNew;
