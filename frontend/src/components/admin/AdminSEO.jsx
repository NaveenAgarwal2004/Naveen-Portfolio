import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Search,
  Save,
  Upload,
  Eye,
  Globe,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import OptimizedImage, { ImagePresets } from '../ui/OptimizedImage';

const AdminSEO = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [seoData, setSeoData] = useState({
    home: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      twitterHandle: '',
      canonicalUrl: ''
    },
    about: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      twitterHandle: '',
      canonicalUrl: ''
    },
    projects: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      twitterHandle: '',
      canonicalUrl: ''
    },
    contact: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      twitterHandle: '',
      canonicalUrl: ''
    }
  });
  const [activeTab, setActiveTab] = useState('home');
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      // Use the backend URL from environment or default
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/seo`);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('SEO API not available, using default data');
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch SEO data');
      }

      const data = await response.json();
      if (data.success) {
        setSeoData(prev => ({ ...prev, ...data.data }));

        // Set image previews for existing images
        const previews = {};
        Object.keys(data.data).forEach(page => {
          if (data.data[page]?.ogImage) {
            previews[page] = data.data[page].ogImage;
          }
        });
        setImagePreviews(previews);
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      toast({
        title: "Warning",
        description: "SEO API not available. Using default settings.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (page, field, value) => {
    setSeoData(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  const handleImageChange = (page, e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles(prev => ({ ...prev, [page]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({ ...prev, [page]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const savePage = async (page) => {
    setIsSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      
      // First save the SEO data
      const seoResponse = await fetch(`${backendUrl}/api/seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          page,
          ...seoData[page]
        })
      });

      if (!seoResponse.ok) {
        const errorText = await seoResponse.text();
        console.error('SEO save error:', errorText);
        throw new Error('Failed to save SEO data');
      }

      // Then upload image if selected
      if (imageFiles[page]) {
        const formData = new FormData();
        formData.append('ogImage', imageFiles[page]);

        const imageResponse = await fetch(`${backendUrl}/api/seo/${page}/og-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success) {
            setSeoData(prev => ({
              ...prev,
              [page]: {
                ...prev[page],
                ogImage: imageData.data.ogImage
              }
            }));
          }
        } else {
          console.warn('Image upload failed, but SEO data was saved');
        }
      }

      toast({
        title: "Success",
        description: `SEO settings for ${page} page saved successfully`
      });

      // Clear the file input for this page
      setImageFiles(prev => ({ ...prev, [page]: null }));
    } catch (error) {
      console.error('SEO save error:', error);
      toast({
        title: "Error",
        description: `Failed to save SEO settings for ${page} page. SEO API may not be available.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCharacterCount = (text, limit) => {
    const count = text?.length || 0;
    const isOverLimit = count > limit;
    return (
      <span className={`text-sm ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
        {count}/{limit}
      </span>
    );
  };

  const getPreviewUrl = () => {
    const baseUrl = window.location.origin;
    switch (activeTab) {
      case 'home': return baseUrl;
      case 'about': return `${baseUrl}#about`;
      case 'projects': return `${baseUrl}#projects`;
      case 'contact': return `${baseUrl}#contact`;
      default: return baseUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentPageData = seoData[activeTab] || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="h-6 w-6" />
            SEO Management
          </h1>
        </div>

        <Button
          onClick={() => window.open(getPreviewUrl(), '_blank')}
          variant="outline"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Page
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
          <TabsTrigger value="projects">Projects Section</TabsTrigger>
          <TabsTrigger value="contact">Contact Section</TabsTrigger>
        </TabsList>

        {/* Page SEO Content */}
        {['home', 'about', 'projects', 'contact'].map((page) => (
          <TabsContent key={page} value={page} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {page.charAt(0).toUpperCase() + page.slice(1)} Page SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${page}-title`}>Meta Title</Label>
                    {getCharacterCount(currentPageData.title, 60)}
                  </div>
                  <Input
                    id={`${page}-title`}
                    value={currentPageData.title || ''}
                    onChange={(e) => handleInputChange(page, 'title', e.target.value)}
                    placeholder="Enter SEO title (recommended: 50-60 characters)"
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-400">
                    This appears as the clickable headline in search results
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${page}-description`}>Meta Description</Label>
                    {getCharacterCount(currentPageData.description, 160)}
                  </div>
                  <Textarea
                    id={`${page}-description`}
                    value={currentPageData.description || ''}
                    onChange={(e) => handleInputChange(page, 'description', e.target.value)}
                    placeholder="Enter SEO description (recommended: 150-160 characters)"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-400">
                    This appears as the description snippet in search results
                  </p>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label htmlFor={`${page}-keywords`}>Keywords</Label>
                  <Input
                    id={`${page}-keywords`}
                    value={currentPageData.keywords || ''}
                    onChange={(e) => handleInputChange(page, 'keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-sm text-gray-400">
                    Comma-separated keywords relevant to this page
                  </p>
                </div>

                {/* Twitter Handle */}
                <div className="space-y-2">
                  <Label htmlFor={`${page}-twitter`}>Twitter Handle</Label>
                  <Input
                    id={`${page}-twitter`}
                    value={currentPageData.twitterHandle || ''}
                    onChange={(e) => handleInputChange(page, 'twitterHandle', e.target.value)}
                    placeholder="@your_twitter_handle"
                  />
                </div>

                {/* Canonical URL */}
                <div className="space-y-2">
                  <Label htmlFor={`${page}-canonical`}>Canonical URL</Label>
                  <Input
                    id={`${page}-canonical`}
                    value={currentPageData.canonicalUrl || ''}
                    onChange={(e) => handleInputChange(page, 'canonicalUrl', e.target.value)}
                    placeholder={getPreviewUrl()}
                  />
                  <p className="text-sm text-gray-400">
                    Leave empty to use the current page URL
                  </p>
                </div>

                {/* OG Image */}
                <div className="space-y-4">
                  <Label>Open Graph Image</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(page, e)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        Recommended: 1200x630px for social media sharing
                      </p>
                    </div>

                    {imagePreviews[page] && (
                      <div className="relative">
                        <img
                          src={imagePreviews[page]}
                          alt={`${page} OG image preview`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-700"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => savePage(page)}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save {page.charAt(0).toUpperCase() + page.slice(1)} SEO
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SEO Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Search Engine Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="text-blue-400 text-lg hover:underline cursor-pointer">
                    {currentPageData.title || `${page.charAt(0).toUpperCase() + page.slice(1)} - Your Portfolio`}
                  </div>
                  <div className="text-green-400 text-sm mt-1">
                    {currentPageData.canonicalUrl || getPreviewUrl()}
                  </div>
                  <div className="text-gray-300 text-sm mt-2">
                    {currentPageData.description || `Learn more about the ${page} section of the portfolio...`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminSEO;