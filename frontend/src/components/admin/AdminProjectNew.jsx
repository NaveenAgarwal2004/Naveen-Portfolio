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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/admin/projects">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back to Projects</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
              <Plus className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
              <span className="hidden sm:inline">Add New Project</span>
              <span className="sm:hidden">Add Project</span>
            </h1>
            <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
              Create a new project to showcase in your portfolio.
            </p>
          </div>
          
          {/* Preview Toggle */}
          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreview(!preview)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto text-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {preview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white text-lg md:text-xl">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <form id="project-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., E-commerce Platform"
                  className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.title && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your project, its features, and what makes it special..."
                  className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm md:text-base ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.description && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base ${
                      errors.category ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="Web">Web Development</option>
                    <option value="AI">AI & Machine Learning</option>
                  </select>
                  {errors.category && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.category}</p>}
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  />
                  <p className="text-gray-400 text-xs mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Project Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Image *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Project"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                      <ImageIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="project-image"
                    />
                    <label htmlFor="project-image">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer w-full sm:w-auto text-sm"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById('project-image').click()}
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
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended: 800x600px, Max 3MB
                    </p>
                  </div>
                </div>
                {errors.image && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.image}</p>}
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technologies Used *
                </label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB, Express, Tailwind CSS"
                  className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base ${
                    errors.techStack ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.techStack && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.techStack}</p>}
                <p className="text-gray-400 text-xs mt-1">
                  Separate technologies with commas
                </p>
                {techStackArray.length > 0 && (
                  <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                    {techStackArray.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Repository *
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 md:h-5 w-4 md:w-5" />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username/repo"
                      className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base ${
                        errors.githubUrl ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.githubUrl && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.githubUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Live Demo URL *
                  </label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 md:h-5 w-4 md:w-5" />
                    <input
                      type="url"
                      name="liveUrl"
                      value={formData.liveUrl}
                      onChange={handleChange}
                      placeholder="https://your-project.vercel.app"
                      className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base ${
                        errors.liveUrl ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.liveUrl && <p className="text-red-400 text-xs md:text-sm mt-1">{errors.liveUrl}</p>}
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center justify-between p-3 md:p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Featured Project
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Featured projects appear prominently on your portfolio
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 md:w-5 md:h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {preview && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-white text-lg md:text-xl">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="bg-gray-750 border border-gray-600 rounded-lg overflow-hidden space-y-3 md:space-y-4 p-4 md:p-6">
                {/* Project Image */}
                <div className="relative">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt={formData.title || 'Project preview'}
                      className="w-full h-36 md:h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-36 md:h-48 bg-gray-700 flex items-center justify-center ${formData.image ? 'hidden' : 'flex'}`}
                  >
                    <div className="text-center text-gray-400">
                      <ImageIcon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2" />
                      <p className="text-sm">Image preview</p>
                    </div>
                  </div>
                  
                  {formData.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  {formData.category && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-gray-900/80 border-gray-600 text-gray-300 text-xs">
                        {formData.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {formData.title || 'Project Title'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {formData.description || 'Project description will appear here...'}
                  </p>
                </div>

                {/* Technologies */}
                {techStackArray.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm md:text-base">Technologies</h4>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {techStackArray.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div>
                  <h4 className="text-white font-medium mb-2 text-sm md:text-base">Links</h4>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    {formData.githubUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 text-xs md:text-sm"
                        onClick={() => window.open(formData.githubUrl, '_blank')}
                      >
                        <Github className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                    {formData.liveUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 text-xs md:text-sm"
                        onClick={() => window.open(formData.liveUrl, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Live Demo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Empty State Message */}
                {!formData.title && !formData.description && !formData.image && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Fill out the form to see your project preview
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminProjectNew;