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
import { adminAPI } from '../../services/api';

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
      // Use the centralized apiClient instead of fetch
      const response = await adminAPI.getSEOData();
      if (response.data.success) {
        setSeoData(prev => ({ ...prev, ...response.data.data }));

        // Set image previews for existing images
        const previews = {};
        Object.keys(response.data.data).forEach(page => {
          if (response.data.data[page]?.ogImage) {
            previews[page] = response.data.data[page].ogImage;
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
      // First save the SEO data using the centralized API client
      const response = await adminAPI.updateSEOData(page, seoData[page]);

      if (response.data.success) {
        // Then upload image if selected
        if (imageFiles[page]) {
          try {
            const imageResponse = await adminAPI.uploadSEOImage(page, imageFiles[page]);
            if (imageResponse.data.success) {
              setSeoData(prev => ({
                ...prev,
                [page]: {
                  ...prev[page],
                  ogImage: imageResponse.data.data.ogImage
                }
              }));
            }
          } catch (imageError) {
            console.warn('Image upload failed, but SEO data was saved');
          }
        }

        toast({
          title: "Success",
          description: `SEO settings for ${page} page saved successfully`
        });

        // Clear the file input for this page
        setImageFiles(prev => ({ ...prev, [page]: null }));
      } else {
        throw new Error(response.data.message || 'Failed to save SEO data');
      }
    } catch (error) {
      console.error('SEO save error:', error);
      toast({
        title: "Error",
        description: `Failed to save SEO settings for ${page} page. ${error.message}`,
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
