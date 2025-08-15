import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Create axios instance with enhanced config for backend sleep issues
const apiClient = axios.create({
  baseURL: API,
  timeout: 45000, // 45 seconds for slow wake-ups
  headers: {
    'Content-Type': 'application/json',
  }
});

// Enhanced retry configuration
const MAX_RETRIES = 10; // Increased for backend sleep
const BASE_DELAY = 3000; // Start with 3s delay

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp as query parameter instead of header to avoid CORS issues
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor for backend sleep handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    if (!config._retryCount) {
      config._retryCount = 1;
    } else {
      config._retryCount += 1;
    }
    
    // Handle CORS and network errors specifically
    const shouldRetry = 
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      error.response?.status >= 500 || // Server errors
      error.response?.status === 0 || // CORS/network issues
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('CORS') ||
      error.message.includes('ERR_FAILED');
    
    if (shouldRetry && config._retryCount <= MAX_RETRIES) {
      console.log(`🔄 Retrying ${config.url} (${config._retryCount}/${MAX_RETRIES})`);
      
      // Exponential backoff with jitter for backend wake-up
      const delay = Math.min(
        BASE_DELAY * Math.pow(1.5, config._retryCount - 1) + Math.random() * 1000,
        10000 // Max 10 seconds between retries
      );
      
      console.log(`⏳ Waiting ${Math.round(delay/1000)}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return apiClient(config);
    }
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/admin/login';
    }
    
    // Enhanced error logging
    console.error('❌ API Error:', {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      message: error.message,
      retryCount: config?._retryCount,
      timestamp: new Date().toISOString()
    });
    
    return Promise.reject(error);
  }
);

// ============= PUBLIC APIs =============

export const portfolioAPI = {
  // Get personal information with retry
  getPersonal: () => apiClient.get('/portfolio/personal'),
  
  // Get all projects with retry
  getProjects: (category = '') => {
    const params = category && category !== 'All' ? { category } : {};
    return apiClient.get('/portfolio/projects', { params });
  },
  
  // Get featured projects with retry
  getFeaturedProjects: () => apiClient.get('/portfolio/projects/featured'),
  
  // Get tech stack with retry
  getTechStack: () => apiClient.get('/portfolio/tech-stack'),
  
  // Get portfolio stats with retry
  getStats: () => apiClient.get('/portfolio/stats')
};

// ============= CONTACT API =============

export const contactAPI = {
  // Submit contact form with retry
  submitContact: (contactData) => {
    const config = {};
    if (process.env.NODE_ENV === 'development') {
      config.headers = { 'x-bypass-rate-limit': 'true' };
    }
    return apiClient.post('/contact', contactData, config);
  }
};

// ============= AUTH APIs =============

export const authAPI = {
  // Login with retry
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Verify token with retry
  verify: () => apiClient.post('/auth/verify'),
  
  // Logout with retry
  logout: () => apiClient.post('/auth/logout')
};

// ============= ADMIN APIs =============

export const adminAPI = {
  // Dashboard with retry
  getDashboard: () => apiClient.get('/admin/dashboard'),
  
  // Projects Management with retry
  getProjects: () => apiClient.get('/admin/projects'),
  createProject: (projectData) => apiClient.post('/admin/projects', projectData),
  updateProject: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  deleteProject: (id) => apiClient.delete(`/admin/projects/${id}`),
  
  // Personal Info Management with retry
  getPersonal: () => apiClient.get('/admin/personal'),
  updatePersonal: (personalData) => apiClient.put('/admin/personal', personalData),
  
  // Tech Stack Management with retry
  getTechStack: () => apiClient.get('/admin/tech-stack'),
  createTechStack: (techData) => apiClient.post('/admin/tech-stack', techData),
  updateTechStack: (id, techData) => apiClient.put(`/admin/tech-stack/${id}`, techData),
  deleteTechStack: (id) => apiClient.delete(`/admin/tech-stack/${id}`),
  
  // File Uploads with retry
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.post('/admin/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadFrontendResume: (file) => {
    const formData = new FormData();
    formData.append('frontendResume', file);
    return apiClient.post('/admin/upload/frontend-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadBackendResume: (file) => {
    const formData = new FormData();
    formData.append('backendResume', file);
    return apiClient.post('/admin/upload/backend-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
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
  },
  
  uploadTechLogo: (file) => {
    const formData = new FormData();
    formData.append('techLogo', file);
    return apiClient.post('/admin/upload/tech-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Contact Messages with retry
  getMessages: (params = {}) => apiClient.get('/admin/contact/messages', { params }),
  updateMessageStatus: (id, status) => apiClient.put(`/admin/contact/messages/${id}/status`, { status })
};

export default apiClient;
