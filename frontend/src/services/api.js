import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
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
const MAX_RETRIES = 3; // Reduced from 10 to prevent rate limiting
const BASE_DELAY = 2000; // Reduced from 3s to 2s

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FIXED: Remove cache busting timestamp that was causing issues
    // Only add cache busting for admin routes and when explicitly needed
    if (config.method === 'get' && config.url.includes('/admin/')) {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with exponential backoff
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // FIXED: Don't retry on 429 (rate limit) errors to prevent further rate limiting
    const shouldRetry = 
      config.__retryCount < MAX_RETRIES && 
      error.response &&
      error.response.status !== 429 && // Don't retry rate limit errors
      (
        error.response.status >= 500 ||
        error.response.status === 408 ||
        error.code === 'ECONNABORTED' ||
        error.code === 'NETWORK_ERROR'
      );
    
    // For 429 errors, add a longer delay before allowing any retries
    if (error.response?.status === 429) {
      console.warn('Rate limited. Backing off for 60 seconds...');
      // Store the backoff time
      window.__rateLimitBackoff = Date.now() + 60000;
      return Promise.reject(error);
    }
    
    // Check if we're in a rate limit backoff period
    if (window.__rateLimitBackoff && Date.now() < window.__rateLimitBackoff) {
      console.warn('Still in rate limit backoff period');
      return Promise.reject(new Error('Rate limit backoff active'));
    }
    
    if (!shouldRetry) {
      return Promise.reject(error);
    }
    
    // Increment retry count
    config.__retryCount += 1;
    
    // Calculate delay with exponential backoff and jitter
    const delay = Math.min(BASE_DELAY * Math.pow(2, config.__retryCount - 1), 30000);
    const jitter = Math.random() * 1000;
    
    console.log(`Retrying request (${config.__retryCount}/${MAX_RETRIES}) after ${delay + jitter}ms...`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay + jitter));
    
    // Retry the request
    return apiClient(config);
  }
);

// FIXED: Add request debouncing to prevent rapid duplicate requests
const pendingRequests = new Map();

const createDebouncedRequest = (requestFn) => {
  return async (...args) => {
    const key = JSON.stringify(args);
    
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    
    const promise = requestFn(...args);
    pendingRequests.set(key, promise);
    
    try {
      const result = await promise;
      pendingRequests.delete(key);
      return result;
    } catch (error) {
      pendingRequests.delete(key);
      throw error;
    }
  };
};

// ============= RESUME APIs =============

export const resumeAPI = {
  // Get resume URLs (with debouncing)
  getResumes: createDebouncedRequest(() => apiClient.get('/resume/urls')),
  
  // Upload resume
  uploadResume: (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/resume/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete resume
  deleteResume: (type) => apiClient.delete(`/resume/${type}`),
  
  // Download resume
  downloadResume: (type) => apiClient.get(`/resume/download/${type}`),
  
  // View resume
  viewResume: (type) => apiClient.get(`/resume/view/${type}`)
};

// ============= CERTIFICATES APIs =============

export const certificatesAPI = {
  // Get all certificates with debouncing
  getCertificates: createDebouncedRequest(() => apiClient.get('/certificates')),
  getAllCertificates: createDebouncedRequest(() => apiClient.get('/certificates')),
  
  // Get certificate stats with debouncing
  getCertificateStats: createDebouncedRequest(() => 
    apiClient.get('/certificates/stats').catch(() => 
      ({ data: { success: false, data: {} } })
    )
  ),
  
  // Add certificate
  addCertificate: (certificateData) => apiClient.post('/certificates', certificateData),
  
  // Update certificate
  updateCertificate: (id, certificateData) => apiClient.put(`/certificates/${id}`, certificateData),
  
  // Delete certificate
  deleteCertificate: (id) => apiClient.delete(`/certificates/${id}`),
  
  // Upload certificate image
  uploadCertificateImage: (id, file) => {
    const formData = new FormData();
    formData.append('certificateImage', file);
    return apiClient.post(`/certificates/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload certificate logo
  uploadCertificateLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`/certificates/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Bulk operations
  bulkOperation: (action, certificateIds, data = {}) => 
    apiClient.post('/certificates/bulk', { action, certificateIds, data }),
  
  // Export certificates
  exportCertificates: (format = 'json') => apiClient.get('/certificates/export', {
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  }),
  
  // Get available tags
  getTags: createDebouncedRequest(() => apiClient.get('/certificates/tags'))
};

// ============= AUTH APIs =============

export const authAPI = {
  // Login
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Verify token with debouncing
  verify: createDebouncedRequest(() => apiClient.post('/auth/verify')),
  
  // Logout
  logout: () => apiClient.post('/auth/logout')
};

// ============= CONTACT APIs =============

export const contactAPI = {
  // Contact form
  submitContact: (messageData) => apiClient.post('/contact', messageData)
};

// ============= PORTFOLIO APIs (alias for PUBLIC) =============

export const portfolioAPI = {
  // Get projects with debouncing
  getProjects: createDebouncedRequest(() => apiClient.get('/portfolio/projects')),
  
  // Get personal info with debouncing
  getPersonal: createDebouncedRequest(() => apiClient.get('/portfolio/personal')),
  
  // Get tech stack with debouncing
  getTechStack: createDebouncedRequest(() => apiClient.get('/portfolio/tech-stack')),
  
  // Get certificates with debouncing
  getCertificates: createDebouncedRequest(() => apiClient.get('/certificates')),
  
  // Get portfolio stats with debouncing
  getStats: createDebouncedRequest(() => 
    apiClient.get('/portfolio/stats').catch(() => 
      ({ data: { success: true, data: { totalProjects: 0, totalTechnologies: 0, totalCertificates: 0 } } })
    )
  )
};

// ============= PUBLIC APIs =============

export const publicAPI = {
  // Get projects with debouncing
  getProjects: createDebouncedRequest(() => apiClient.get('/portfolio/projects')),
  
  // Get personal info with debouncing
  getPersonal: createDebouncedRequest(() => apiClient.get('/portfolio/personal')),
  
  // Get tech stack with debouncing
  getTechStack: createDebouncedRequest(() => apiClient.get('/portfolio/tech-stack')),
  
  // Get certificates with debouncing
  getCertificates: createDebouncedRequest(() => apiClient.get('/certificates')),
  
  // Contact form
  sendMessage: (messageData) => apiClient.post('/contact', messageData)
};

// ============= ADMIN APIs =============

export const adminAPI = {
  // Dashboard with debouncing (admin routes get cache busting)
  getDashboard: createDebouncedRequest(() => apiClient.get('/admin/dashboard')),
  
  // Projects Management
  getProjects: createDebouncedRequest(() => apiClient.get('/admin/projects')),
  createProject: (projectData) => apiClient.post('/admin/projects', projectData),
  updateProject: (id, projectData) => apiClient.put(`/admin/projects/${id}`, projectData),
  deleteProject: (id) => apiClient.delete(`/admin/projects/${id}`),
  
  // Personal Info Management
  getPersonal: createDebouncedRequest(() => apiClient.get('/admin/personal')),
  updatePersonal: (personalData) => apiClient.put('/admin/personal', personalData),
  
  // Tech Stack Management
  getTechStack: createDebouncedRequest(() => apiClient.get('/admin/tech-stack')),
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
  getCertificates: () => certificatesAPI.getCertificates(),
  addCertificate: (certificateData) => certificatesAPI.addCertificate(certificateData),
  updateCertificate: (id, certificateData) => certificatesAPI.updateCertificate(id, certificateData),
  deleteCertificate: (id) => certificatesAPI.deleteCertificate(id),
  uploadCertificateImage: (id, file) => certificatesAPI.uploadCertificateImage(id, file),
  uploadCertificateLogo: (id, file) => certificatesAPI.uploadCertificateLogo(id, file),
  bulkCertificateOperation: (action, ids, data) => certificatesAPI.bulkOperation(action, ids, data),
  exportCertificates: (format) => certificatesAPI.exportCertificates(format),
  getCertificateTags: () => certificatesAPI.getTags(),
  
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

  // SEO Management APIs
  getSEOData: createDebouncedRequest(() => apiClient.get('/seo')),
  updateSEOData: (page, seoData) => apiClient.post('/seo', { page, ...seoData }),
  uploadSEOImage: (page, file) => {
    const formData = new FormData();
    formData.append('ogImage', file);
    return apiClient.post(`/seo/${page}/og-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// FIXED: Add utility to clear request cache when needed
export const clearApiCache = () => {
  pendingRequests.clear();
  window.__rateLimitBackoff = null;
};

// Default export for backwards compatibility
export default {
  publicAPI,
  portfolioAPI,
  contactAPI,
  adminAPI,
  authAPI,
  resumeAPI,
  certificatesAPI,
  clearApiCache
};