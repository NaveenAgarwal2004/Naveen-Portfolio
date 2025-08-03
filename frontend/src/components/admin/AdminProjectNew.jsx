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
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    order: 0
  });
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
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
          <Button
            type="submit"
            form="project-form"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
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
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
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
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="Web">Web Development</option>
                    <option value="AI">AI & Machine Learning</option>
                  </select>
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
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
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Image URL *
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="/Assets/Project Images/your-image.jpg"
                    className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.image ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                </div>
                {errors.image && <p className="text-red-400 text-sm mt-1">{errors.image}</p>}
                <p className="text-gray-400 text-xs mt-1">
                  Use relative path starting with /Assets/ or full URL
                </p>
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
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.techStack ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.techStack && <p className="text-red-400 text-sm mt-1">{errors.techStack}</p>}
                <p className="text-gray-400 text-xs mt-1">
                  Separate technologies with commas
                </p>
                {techStackArray.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {techStackArray.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* URLs */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Repository *
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username/repo"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.githubUrl ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.githubUrl && <p className="text-red-400 text-sm mt-1">{errors.githubUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Live Demo URL *
                  </label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      name="liveUrl"
                      value={formData.liveUrl}
                      onChange={handleChange}
                      placeholder="https://your-project.vercel.app"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.liveUrl ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.liveUrl && <p className="text-red-400 text-sm mt-1">{errors.liveUrl}</p>}
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
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
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        {preview && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-750 border border-gray-600 rounded-lg overflow-hidden">
                {/* Project Image */}
                <div className="relative">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt={formData.title || 'Project preview'}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-48 bg-gray-700 flex items-center justify-center ${formData.image ? 'hidden' : 'flex'}`}
                  >
                    <div className="text-center text-gray-400">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Image preview</p>
                    </div>
                  </div>
                  
                  {formData.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  {formData.category && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-gray-900/80 border-gray-600 text-gray-300">
                        {formData.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Project Content */}
                <div className="p-4 space-y-4">
                  <h3 className="text-white text-lg font-semibold">
                    {formData.title || 'Project Title'}
                  </h3>
                  
                  <p className="text-gray-400 text-sm">
                    {formData.description || 'Project description will appear here...'}
                  </p>
                  
                  {techStackArray.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {techStackArray.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                      disabled
                    >
                      <Github className="h-3 w-3 mr-1" />
                      Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                      disabled
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Live Demo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminProjectNew;