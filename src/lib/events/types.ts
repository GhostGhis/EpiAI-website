// Catégorie d'événement
export interface ICategory {
  id: string;
  slug: string;
  name: {
    en: string;
    fr: string;
  };
  icon: string;
  color: string;
  bgColor: string;
}

// Événement (Document MongoDB)
export interface IEvent {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  date: Date;
  endDate?: Date;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  gallery: string[];
  videoUrls: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdBy: string;
  linkedActivityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inscription à un événement
export interface IEventRegistration {
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'registered' | 'cancelled' | 'attended';
  registeredAt: Date;
}

// Types pour les API responses
export interface EventWithDetails {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  capacity: number;
  registeredCount: number;
  spotsLeft: number;
  imageUrl?: string;
  gallery: string[];
  videoUrls: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isRegistered?: boolean;
  isPast: boolean;
  linkedActivityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationWithUser {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'registered' | 'cancelled' | 'attended';
  registeredAt: string;
}

// Pour les paramètres d'API
export interface CreateEventInput {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  capacity: number;
  imageUrl?: string;
  gallery?: string[];
  videoUrls?: string[];
}

export interface EventFilters {
  categoryId?: string;
  upcoming?: boolean;
  past?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
