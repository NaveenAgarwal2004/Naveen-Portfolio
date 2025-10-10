import axios from 'axios';

// Temporary fix: Hardcode production backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? 'https://naveen-portfolio-il6e.onrender.com' : 'http://localhost:8001');
const API = `${BACKEND_URL}/api`;

console.log('🔗 Backend URL:', BACKEND_URL); // Debug log

// Create axios instance with enhanced config
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Enhanced retry configuration
const MAX_RETRIES = 2;
const BASE_DELAY = 1000;

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp for admin routes to bust cache
    if (config.method === 'get' && config.url.includes('/admin/')) {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const { config } = error;
    
    console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Initialize retry count
    if (!config?.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Don't retry on 4xx errors (except 408) or rate limits
    const shouldRetry = 
      config &&
      config.__retryCount < MAX_RETRIES && 
      error.response &&
      error.response.status !== 429 && 
      (
        error.response.status >= 500 ||
        error.response.status === 408 ||
        error.code === 'ECONNABORTED' ||
        error.code === 'NETWORK_ERROR'
      );
    
    if (!shouldRetry) {
      return Promise.reject(error);
    }
    
    // Increment retry count
    config.__retryCount += 1;
    
    // Calculate delay with exponential backoff
    const delay = BASE_DELAY * Math.pow(2, config.__retryCount - 1);
    
    console.log(`🔄 Retrying request (${config.__retryCount}/${MAX_RETRIES}) after ${delay}ms...`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return apiClient(config);
  }
);

// ============= PORTFOLIO APIs (PUBLIC) =============

export const portfolioAPI = {
  // Get projects - FIXED: Direct route check
  getProjects: async () => {
    try {
      console.log('📦 Fetching projects...');
      const response = await apiClient.get('/portfolio/projects');
      console.log('📦 Projects response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Projects fetch failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get personal info - FIXED
  getPersonal: async () => {
    try {
      console.log('👤 Fetching personal data...');
      const response = await apiClient.get('/portfolio/personal');
      console.log('👤 Personal response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Personal fetch failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get tech stack - FIXED
  getTechStack: async () => {
    try {
      console.log('⚡ Fetching tech stack...');
      const response = await apiClient.get('/portfolio/tech-stack');
      console.log('⚡ Tech stack response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Tech stack fetch failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get certificates - FIXED: Use certificates endpoint
  getCertificates: async () => {
    try {
      console.log('🏆 Fetching certificates...');
      const response = await apiClient.get('/certificates');
      console.log('🏆 Certificates response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Certificates fetch failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get portfolio stats - FIXED
  getStats: async () => {
    try {
      console.log('📊 Fetching stats...');
      const response = await apiClient.get('/portfolio/stats');
      console.log('📊 Stats response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Stats fetch failed:', error.response?.data || error.message);
      // Return fallback stats on error
      return {
        data: {
          success: true,
          data: {
            totalProjects: 0,
            totalTechnologies: 0,
            totalCertificates: 0,
            yearsExperience: 2,
            clients: 15
          }
        }
      };
    }
  }
};

// ============= CERTIFICATES APIs =============

export const certificatesAPI = {
  // Get all certificates
  getCertificates: async () => {
    try {
      console.log('🏆 Fetching certificates...');
      const response = await apiClient.get('/certificates');
      console.log('🏆 Certificates response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Certificates fetch failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get certificate stats
  getCertificateStats: async () => {
    try {
      console.log('📊 Fetching certificate stats...');
      const response = await apiClient.get('/certificates/stats');
      console.log('📊 Certificate stats response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Certificate stats fetch failed:', error.response?.data || error.message);
      // Return fallback stats
      return {
        data: {
          success: true,
          data: {
            total: 0,
            active: 0,
            expired: 0,
            expiring: 0,
            recentlyAdded: 0
          }
        }
      };
    }
  }
};

// ============= CONTACT APIs =============

export const contactAPI = {
  // Contact form submission
  submitContact: async (messageData) => {
    try {
      console.log('📧 Submitting contact form...');
      const response = await apiClient.post('/contact', messageData);
      console.log('📧 Contact response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Contact submission failed:', error.response?.data || error.message);
      throw error;
    }
  }
};

// ============= AUTH APIs =============

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verify: () => apiClient.post('/auth/verify'),
  logout: () => apiClient.post('/auth/logout')
};

// ============= RESUME APIs =============

export const resumeAPI = {
  getResumes: () => apiClient.get('/resume/urls'),
  uploadResume: (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/resume/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteResume: (type) => apiClient.delete(`/resume/${type}`),
  downloadResume: (type) => apiClient.get(`/resume/download/${type}`),
  viewResume: (type) => apiClient.get(`/resume/view/${type}`)
};

// ============= ADMIN APIs =============

export const adminAPI = {
  // Dashboard
  getDashboard: () => apiClient.get('/admin/dashboard'),
  
  // Projects Management
  getProjects: () => apiClient.get('/admin/projects'),
  createProject: (projectData) => apiClient.post('/admin/projects', projectData),
  updateProject: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  deleteProject: (id) => apiClient.delete(`/admin/projects/${id}`),
  
  // Personal Info Management
  getPersonal: () => apiClient.get('/admin/personal'),
  updatePersonal: (personalData) => apiClient.put('/admin/personal', personalData),
  
  // Tech Stack Management
  getTechStack: () => apiClient.get('/admin/tech-stack'),
  createTechStack: (techData) => apiClient.post('/admin/tech-stack', techData),
  updateTechStack: (id, techData) => apiClient.put(`/admin/tech-stack/${id}`, techData),
  deleteTechStack: (id) => apiClient.delete(`/admin/tech-stack/${id}`),
  
  // Certificates Management
  getCertificates: () => certificatesAPI.getCertificates(),
  getCertificateTags: () => apiClient.get('/admin/certificates/tags'),
  addCertificate: (certificateData) => apiClient.post('/admin/certificates', certificateData),
  updateCertificate: (id, certificateData) => apiClient.put(`/admin/certificates/${id}`, certificateData),
  deleteCertificate: (id) => apiClient.delete(`/admin/certificates/${id}`),
  uploadCertificateImage: (certificateId, file) => {
    const formData = new FormData();
    formData.append('certificateImage', file);
    return apiClient.post(`/admin/certificates/${certificateId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadCertificateLogo: (certificateId, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`/admin/certificates/${certificateId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  bulkCertificateOperation: (action, certificateIds, data) => apiClient.post('/admin/certificates/bulk', { action, certificateIds, data }),
  exportCertificates: (format = 'json') => apiClient.get('/admin/certificates/export', { params: { format } }),
  
  // File Uploads
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return apiClient.post('/admin/upload/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadProjectImage: (file) => {
    const formData = new FormData();
    formData.append('projectImage', file);
    return apiClient.post('/admin/upload/project-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Helper function to test API connectivity
export const testConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await apiClient.get('/health');
    console.log('✅ API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Default export for backwards compatibility
export default {
  portfolioAPI,
  contactAPI,
  adminAPI,
  authAPI,
  resumeAPI,
  certificatesAPI,
  testConnection
};