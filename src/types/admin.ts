import { ProductSpec } from '../data/products';

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  price?: number;
  imageUrl?: string;
  images?: string[];
  storagePath?: string;
  specs: ProductSpec[];
  published?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  coverImageUrl?: string;
  images?: string[];
  storagePath?: string;
  tags?: string[];
  published: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  storagePath?: string;
  startDate: string;
  endDate?: string;
  location: string;
  contactInstructions: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  learningObjectives?: string;
  imageUrl?: string;
  storagePath?: string;
  venue: string;
  schedule?: string;
  duration?: string;
  requirements?: string;
  contactInstructions: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FishingSpotItem {
  id: string;
  name: string;
  region: string;
  description: string;
  imageUrl?: string;
  storagePath?: string;
  fishingType?: string;
  accessInstructions?: string;
  facilities?: string;
  mapLink?: string;
  safetyGuidance?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: 'admin' | 'superadmin';
  authorized: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  location?: string;
  fishCaught?: string;
  verified?: boolean;
  createdAt: string;
}
