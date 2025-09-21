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

// Enhanced response interceptor with exponential backoff
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Check if we should retry
    const shouldRetry = 
      config.__retryCount < MAX_RETRIES && 
      (
        !error.response || 
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

// ============= RESUME APIs =============

export const resumeAPI = {
  // Get resume URLs
  getResumes: () => apiClient.get('/resume/urls'),
  
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
  // Get all certificates with retry (multiple function names for compatibility)
  getCertificates: () => apiClient.get('/certificates'),
  getAllCertificates: () => apiClient.get('/certificates'),
  
  // Get certificate stats (fallback to certificates if no stats endpoint)
  getCertificateStats: () => apiClient.get('/certificates/stats').catch(() => 
    ({ data: { success: false, data: {} } })
  ),
  
  // Add certificate with retry
  addCertificate: (certificateData) => apiClient.post('/admin/certificates', certificateData),
  
  // Update certificate with retry
  updateCertificate: (id, certificateData) => apiClient.put(`/admin/certificates/${id}`, certificateData),
  
  // Delete certificate with retry
  deleteCertificate: (id) => apiClient.delete(`/admin/certificates/${id}`),
  
  // Upload certificate image
  uploadCertificateImage: (id, file) => {
    const formData = new FormData();
    formData.append('certificateImage', file);
    return apiClient.post(`/admin/certificates/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload certificate logo
  uploadCertificateLogo: (id, file) => {
    const formData = new FormData();
    formData.append('certificateLogo', file);
    return apiClient.post(`/admin/certificates/${id}/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Bulk operations
  bulkOperation: (action, ids, data = {}) => 
    apiClient.post('/admin/certificates/bulk', { action, ids, data }),
  
  // Export certificates
  exportCertificates: (format = 'json') => apiClient.get('/admin/certificates/export', {
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  }),
  
  // Get available tags
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

// ============= CONTACT APIs =============

export const contactAPI = {
  // Contact form with retry
  submitContact: (messageData) => apiClient.post('/contact', messageData)
};

// ============= PORTFOLIO APIs (alias for PUBLIC) =============

export const portfolioAPI = {
  // Get projects with retry
  getProjects: () => apiClient.get('/portfolio/projects'),
  
  // Get personal info with retry
  getPersonal: () => apiClient.get('/portfolio/personal'),
  
  // Get tech stack with retry
  getTechStack: () => apiClient.get('/portfolio/tech-stack'),
  
  // Get certificates with retry
  getCertificates: () => apiClient.get('/certificates')
};

// ============= PUBLIC APIs =============

export const publicAPI = {
  // Get projects with retry
  getProjects: () => apiClient.get('/portfolio/projects'),
  
  // Get personal info with retry
  getPersonal: () => apiClient.get('/portfolio/personal'),
  
  // Get tech stack with retry
  getTechStack: () => apiClient.get('/portfolio/tech-stack'),
  
  // Get certificates with retry
  getCertificates: () => apiClient.get('/certificates'),
  
  // Contact form with retry
  sendMessage: (messageData) => apiClient.post('/contact', messageData)
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
  }
};

// Default export for backwards compatibility
export default {
  publicAPI,
  portfolioAPI,
  contactAPI,
  adminAPI,
  authAPI,
  resumeAPI,
  certificatesAPI
};