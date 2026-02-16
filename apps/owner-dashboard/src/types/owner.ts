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
  compensation?: {
    monthlySalary?: number;
    commissionPercent?: number;
  };
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

export interface OwnerProduct {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  usage?: string;
  description?: string;
  inStock?: boolean;
}

export interface OwnerInventoryItem {
  id: string;
  name: string;
  category?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit?: string;
  price?: number;
  supplier?: string;
  lastRestocked?: string;
}

export interface OwnerRevenueSummary {
  summary: {
    totalRevenue: number;
    netProfit: number;
    avgTicket: number;
    outstanding: number;
    pendingPayments: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    appointments: number;
  }>;
  dailyRevenue: Array<{
    day: string;
    revenue: number;
  }>;
  appointmentData: Array<{
    day: string;
    scheduled: number;
    completed: number;
  }>;
  overviewStats: {
    todayRevenue: number;
    appointmentsToday: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    activeClients: number;
    avgRating: number;
    reviewCount: number;
  };
  upcomingAppointments: Array<{
    id: string;
    client: string;
    service: string;
    time: string;
    stylist: string;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
  topStaff: Array<{
    name: string;
    revenue: number;
    appointments: number;
    avgTicket: number;
  }>;
}

export interface OwnerTopService {
  service: string;
  revenue: number;
  percentage: number;
}

export interface OwnerSettingsProfile {
  name: string;
  email: string;
  phone: string;
  salonName: string;
  salonAddress: string;
  salonCity: string;
  salonState: string;
  salonPincode: string;
  salonPhone: string;
  salonEmail: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface OwnerSettings {
  profileData: OwnerSettingsProfile;
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    dailyReports: boolean;
    lowStockAlerts: boolean;
  };
  businessHours: Record<
    string,
    { open: string; close: string; closed: boolean }
  >;
}
