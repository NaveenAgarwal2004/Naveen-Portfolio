// ================= DATA TRANSFER OBJECTS (DTOs) =================

// Project DTOs
export interface CreateProjectDTO {
  title: string;
  description: string;
  detailedDescription?: string;
  category: 'AI' | 'Web';
  featured?: boolean;
  order?: number;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  problem?: string;
  solution?: string;
  outcome?: string;
  image: string;
  imagePublicId?: string;
  demoCredentials?: {
    username: string;
    password: string;
  };
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export interface ProjectFiltersDTO {
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  skip?: number;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

// Contact Form DTO
export interface ContactFormDTO {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Personal Update DTO
export interface UpdatePersonalDTO {
  name?: string;
  title?: string;
  tagline?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: Array<{
    name: string;
    level: number;
  }>;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
    portfolio?: string;
    instagram?: string;
  };
  availability?: {
    status: 'available' | 'busy' | 'unavailable';
    message?: string;
  };
}

// Certificate DTO
export interface CreateCertificateDTO {
  title: string;
  issuer: string;
  dateIssued: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  tags: string[];
  priority?: number;
  isActive?: boolean;
}

export interface UpdateCertificateDTO extends Partial<CreateCertificateDTO> {}

// Tech Stack DTO
export interface CreateTechStackDTO {
  name: string;
  category: string;
  icon?: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description?: string;
  order?: number;
}

export interface UpdateTechStackDTO extends Partial<CreateTechStackDTO> {}
