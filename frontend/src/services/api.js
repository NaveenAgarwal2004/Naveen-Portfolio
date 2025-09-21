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

// ============= RESUME APIs =============

export const resumeAPI = {
  // Get resume URLs (public)
  getResumes: () => apiClient.get('/resume/urls'),
  
  // Upload resume (admin only)
  uploadResume: (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/admin/resume/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete resume (admin only)
  deleteResume: (type) => apiClient.delete(`/admin/resume/${type}`)
};

// ============= ENHANCED CERTIFICATES APIs =============

export const certificatesAPI = {
  // Get all public certificates with enhanced filtering
  getCertificates: (params = {}) => apiClient.get('/certificates', { params }),
  
  // Get certificate statistics (public)
  getCertificateStats: () => apiClient.get('/certificates/stats'),
  
  // Get all certificates for admin (includes private ones)
  getAllCertificates: () => apiClient.get('/certificates/admin/all'),
  
  // Add certificate (admin only)
  addCertificate: (certificateData) => apiClient.post('/admin/certificates', certificateData),
  
  // Update certificate (admin only)
  updateCertificate: (id, certificateData) => apiClient.put(`/admin/certificates/${id}`, certificateData),
  
  // Delete certificate (admin only)
  deleteCertificate: (id) => apiClient.delete(`/admin/certificates/${id}`),
  
  // Upload certificate image (admin only) - NEW
  uploadCertificateImage: (id, file) => {
    const formData = new FormData();
    formData.append('certificateImage', file);
    return apiClient.post(`/admin/certificates/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload certificate logo (admin only) - ENHANCED
  uploadCertificateLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`/admin/certificates/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Bulk operations (admin only) - NEW
  bulkOperation: (action, certificateIds, data = {}) => {
    return apiClient.post('/admin/certificates/bulk', {
      action,
      certificateIds,
      data
    });
  },
  
  // Export certificates (admin only) - NEW
  exportCertificates: (format = 'json') => {
    return apiClient.get('/admin/certificates/export', {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
  },
  
  // Get available tags (admin only) - NEW
  getTags: () => apiClient.get('/admin/certificates/tags')
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

// ============= ADMIN APIs - UPDATED =============

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
  
  // Resume Management
  uploadResume: (type, file) => resumeAPI.uploadResume(type, file),
  deleteResume: (type) => resumeAPI.deleteResume(type),
  getResumes: () => resumeAPI.getResumes(),
  
  // Static file sync for About.jsx compatibility
  syncStaticFiles: () => apiClient.post('/resume/sync-static'),
  getStaticStatus: () => apiClient.get('/resume/static-status'),
  
  // Enhanced Certificates Management
  getCertificates: () => certificatesAPI.getAllCertificates(),
  addCertificate: (certificateData) => certificatesAPI.addCertificate(certificateData),
  updateCertificate: (id, certificateData) => certificatesAPI.updateCertificate(id, certificateData),
  deleteCertificate: (id) => certificatesAPI.deleteCertificate(id),
  uploadCertificateImage: (id, file) => certificatesAPI.uploadCertificateImage(id, file), // NEW
  uploadCertificateLogo: (id, file) => certificatesAPI.uploadCertificateLogo(id, file),
  bulkCertificateOperation: (action, ids, data) => certificatesAPI.bulkOperation(action, ids, data), // NEW
  exportCertificates: (format) => certificatesAPI.exportCertificates(format), // NEW
  getCertificateTags: () => certificatesAPI.getTags(), // NEW
  
  // File Uploads - LEGACY (keeping for backward compatibility)
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