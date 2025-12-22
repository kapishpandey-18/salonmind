export interface OwnerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: OwnerPagination;
}

export interface OwnerStaff {
  _id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties?: string[];
  availability?: number;
  rating?: number;
  status?: string;
  joiningDate?: string;
  isActive?: boolean;
  notes?: string;
  branch?: string;
  [key: string]: any;
}

export interface OwnerService {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  branch?: string;
  [key: string]: any;
}

export interface OwnerClient {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  tags?: string[];
  status?: string;
  gender?: string;
  dob?: string;
  notes?: string;
  isActive?: boolean;
  branch?: string;
  [key: string]: any;
}

export interface OwnerAppointmentServiceItem {
  service: OwnerService | string;
  name: string;
  duration?: number;
  price?: number;
}

export interface OwnerAppointment {
  _id: string;
  client: OwnerClient | string;
  staff: OwnerStaff | string;
  services: OwnerAppointmentServiceItem[];
  status: string;
  startAt: string;
  endAt: string;
  duration?: number;
  totalAmount?: number;
  notes?: string;
  branch?: string;
  cancellationReason?: string;
  [key: string]: any;
}
