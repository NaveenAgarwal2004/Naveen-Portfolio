import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Grid,
  List,
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const AdminTechStack = () => {
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    appearance: false,
    settings: false
  });
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Code',
    logoUrl: '',
    color: '#3B82F6',
    category: 'Frontend',
    order: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Tools', 'Cloud', 'Mobile'];
  const iconOptions = [
    'Code', 'FileCode', 'Palette', 'Zap', 'Component', 'Wind', 'Layout', 
    'GitBranch', 'Github', 'Server', 'Database', 'Layers', 'Settings', 
    'Smartphone', 'Monitor', 'Globe', 'Shield', 'Cpu', 'HardDrive'
  ];

  const colorPresets = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    fetchTechStack();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchTechStack = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTechStack();
      if (response.data.success) {
        setTechStack(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tech stack:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tech stack data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'Code',
      logoUrl: '',
      color: '#3B82F6',
      category: 'Frontend',
      order: 0
    });
    setFormErrors({});
    setEditingItem(null);
    setShowAddForm(false);
    setExpandedSections({
      basic: true,
      appearance: false,
      settings: false
    });
  };

  const validateLogoUrl = (url) => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.icon) errors.icon = 'Icon is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.logoUrl && !validateLogoUrl(formData.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL (http:// or https://)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        order: parseInt(formData.order) || 0
      };

      const response = editingItem 
        ? await adminAPI.updateTechStack(editingItem._id, payload)
        : await adminAPI.createTechStack(payload);

      if (response.data.success) {
        toast({
          title: editingItem ? 'Tech Updated' : 'Tech Added',
          description: `${formData.name} has been ${editingItem ? 'updated' : 'added'} successfully.`,
        });
        resetForm();
        fetchTechStack();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingItem ? 'update' : 'add'} technology.`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      icon: item.icon,
      logoUrl: item.logoUrl || '',
      color: item.color,
      category: item.category,
      order: item.order || 0
    });
    setEditingItem(item);
    setShowAddForm(true);
    setExpandedSections({
      basic: true,
      appearance: true,
      settings: true
    });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await adminAPI.deleteTechStack(id);
      if (response.data.success) {
        toast({
          title: 'Tech Deleted',
          description: `${name} has been deleted successfully.`,
        });
        fetchTechStack();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete technology.',
        variant: 'destructive',
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Filter and search
  const filteredTechStack = techStack.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const TechCard = ({ item }) => (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 group">
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-center justify-between mb-3">
          <div 
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-white font-bold text-base lg:text-lg"
            style={{ backgroundColor: item.color }}
          >
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={item.name} className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />
            ) : (
              item.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 lg:h-8 lg:w-8 p-0 text-blue-400 hover:bg-blue-400/20"
              onClick={() => handleEdit(item)}
            >
              <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 lg:h-8 lg:w-8 p-0 text-red-400 hover:bg-red-400/20"
              onClick={() => handleDelete(item._id, item.name)}
            >
              <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          </div>
        </div>
        <h3 className="text-white font-medium mb-1 text-sm lg:text-base truncate">{item.name}</h3>
        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
          {item.category}
        </Badge>
      </CardContent>
    </Card>
  );

  const TechRow = ({ item }) => (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors duration-200">
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
            <div 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: item.color }}
            >
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} className="w-5 h-5 lg:w-6 lg:h-6 object-contain" />
              ) : (
                item.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium text-sm lg:text-base truncate">{item.name}</h3>
              <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs mt-1">
                {item.category}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 lg:gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-400 hover:bg-blue-400/20 h-8 w-8 p-0"
              onClick={() => handleEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:bg-red-400/20 h-8 w-8 p-0"
              onClick={() => handleDelete(item._id, item.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <Code className="h-6 w-6 lg:h-8 lg:w-8 text-purple-400" />
            Tech Stack Management
          </h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">
            Manage your technical skills and technologies.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Technology
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {categories.slice(1).map(category => (
          <Card key={category} className="bg-gray-800 border-gray-700">
            <CardContent className="p-3 lg:p-4 text-center">
              <p className="text-xl lg:text-2xl font-bold text-white">
                {techStack.filter(item => item.category === category).length}
              </p>
              <p className="text-xs lg:text-sm text-gray-400">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg lg:text-xl">
              {editingItem ? 'Edit Technology' : 'Add New Technology'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Mobile Accordion Layout */}
            <div className="lg:hidden space-y-4">
              <form onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader 
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection('basic')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base">Basic Information</CardTitle>
                      {expandedSections.basic ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </CardHeader>
                  {expandedSections.basic && (
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Technology Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="e.g., React, Node.js, MongoDB"
                          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            formErrors.name ? 'border-red-500' : 'border-gray-600'
                          }`}
                        />
                        {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            formErrors.category ? 'border-red-500' : 'border-gray-600'
                          }`}
                        >
                          {categories.slice(1).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {formErrors.category && <p className="text-red-400 text-sm mt-1">{formErrors.category}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Logo URL (Optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            name="logoUrl"
                            value={formData.logoUrl}
                            onChange={handleFormChange}
                            placeholder="https://example.com/logo.png"
                            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              formErrors.logoUrl ? 'border-red-500' : 'border-gray-600'
                            }`}
                          />
                          {formData.logoUrl && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const img = new Image();
                                img.onload = () => toast({ 
                                  title: 'Logo URL is valid!', 
                                  description: 'Image loaded successfully.' 
                                });
                                img.onerror = () => toast({ 
                                  title: 'Invalid URL', 
                                  description: 'Could not load image from this URL.', 
                                  variant: 'destructive' 
                                });
                                img.src = formData.logoUrl;
                              }}
                              className="text-sm whitespace-nowrap"
                            >
                              Test
                            </Button>
                          )}
                        </div>
                        {formErrors.logoUrl && <p className="text-red-400 text-sm mt-1">{formErrors.logoUrl}</p>}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Appearance Section */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader 
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection('appearance')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base">Appearance</CardTitle>
                      {expandedSections.appearance ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </CardHeader>
                  {expandedSections.appearance && (
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Icon *
                        </label>
                        <select
                          name="icon"
                          value={formData.icon}
                          onChange={handleFormChange}
                          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            formErrors.icon ? 'border-red-500' : 'border-gray-600'
                          }`}
                        >
                          {iconOptions.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        {formErrors.icon && <p className="text-red-400 text-sm mt-1">{formErrors.icon}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Color *
                        </label>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {colorPresets.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, color }))}
                              className={`w-full h-10 rounded-lg border-2 ${
                                formData.color === color ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={handleFormChange}
                          className="w-full h-12 rounded-lg border border-gray-600 bg-gray-700"
                        />
                        {formErrors.color && <p className="text-red-400 text-sm mt-1">{formErrors.color}</p>}
                      </div>

                      {/* Preview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Preview
                        </label>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: formData.color }}
                            >
                              {formData.logoUrl ? (
                                <img 
                                  src={formData.logoUrl} 
                                  alt={formData.name} 
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <span className={formData.logoUrl ? 'hidden' : 'block'}>
                                {formData.name.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {formData.name || 'Technology Name'}
                              </p>
                              <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                {formData.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Settings Section */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader 
                    className="cursor-pointer py-3"
                    onClick={() => toggleSection('settings')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base">Settings</CardTitle>
                      {expandedSections.settings ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </CardHeader>
                  {expandedSections.settings && (
                    <CardContent className="pt-0">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          name="order"
                          value={formData.order}
                          onChange={handleFormChange}
                          min="0"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-gray-400 text-xs mt-1">Lower numbers appear first</p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingItem ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingItem ? 'Update' : 'Add'} Technology
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
            </div>

            {/* Desktop Layout */}
            <form onSubmit={handleSubmit} className="hidden lg:grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Technology Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., React, Node.js, MongoDB"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.category ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-400 text-sm mt-1">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon *
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      formErrors.icon ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  {formErrors.icon && <p className="text-red-400 text-sm mt-1">{formErrors.icon}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Logo URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color *
                  </label>
                  <div className="flex gap-2 mb-3">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-white' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                    className="w-full h-12 rounded-lg border border-gray-600 bg-gray-700"
                  />
                  {formErrors.color && <p className="text-red-400 text-sm mt-1">{formErrors.color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Lower numbers appear first</p>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: formData.color }}
                      >
                        {formData.logoUrl ? (
                          <img 
                            src={formData.logoUrl} 
                            alt={formData.name} 
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span className={formData.logoUrl ? 'hidden' : 'block'}>
                          {formData.name.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {formData.name || 'Technology Name'}
                        </p>
                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          {formData.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingItem ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingItem ? 'Update' : 'Add'} Technology
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
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-3 lg:p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 sm:flex-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="text-gray-300 flex-1 sm:flex-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="text-gray-300 flex-1 sm:flex-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack Grid/List */}
      {filteredTechStack.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 lg:p-12 text-center">
            <Code className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No technologies found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filterCategory !== 'All' 
                ? 'No technologies match your search criteria.' 
                : 'Get started by adding your first technology.'}
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Technology
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'
            : 'space-y-3 lg:space-y-4'
        }>
          {filteredTechStack.map((item) => 
            viewMode === 'grid' 
              ? <TechCard key={item._id} item={item} />
              : <TechRow key={item._id} item={item} />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTechStack;