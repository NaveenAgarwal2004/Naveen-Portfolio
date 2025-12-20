import { Document, Types } from 'mongoose';

// ================= PROJECT TYPES =================
export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  detailedDescription?: string;
  category: 'AI' | 'Web';
  featured: boolean;
  order?: number;
  image: string;
  imagePublicId?: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  problem?: string;
  solution?: string;
  outcome?: string;
  demoCredentials?: {
    username: string;
    password: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ================= PERSONAL TYPES =================
export interface IPersonal extends Document {
  _id: Types.ObjectId;
  name: string;
  title: string;
  tagline?: string;
  bio?: string;
  email: string;
  phone?: string;
  location?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  skills: Array<{
    name: string;
    level: number;
  }>;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
    portfolio?: string;
    instagram?: string;
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    message?: string;
  };
  frontendResume?: {
    public_id: string;
    url: string;
  };
  backendResume?: {
    public_id: string;
    url: string;
  };
  generalResume?: {
    public_id: string;
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ================= TECH STACK TYPES =================
export interface ITechStack extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  icon?: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ================= CERTIFICATE TYPES =================
export interface ICertificate extends Document {
  _id: Types.ObjectId;
  title: string;
  issuer: string;
  dateIssued: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  certificateImage?: {
    public_id: string;
    url: string;
  };
  tags: string[];
  priority?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ================= USER TYPES =================
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ================= CONTACT TYPES =================
export interface IContact extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  repliedAt?: Date;
  metadata: {
    ip?: string;
    userAgent?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
