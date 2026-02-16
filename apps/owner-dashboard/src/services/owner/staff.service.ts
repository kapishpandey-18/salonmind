import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerStaff, PaginatedResult } from "../../types/owner";

export interface StaffFilters {
  branchId?: string | null;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StaffPayload {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties?: string[];
  availability?: number;
  rating?: number;
  notes?: string;
  status?: string;
  isActive?: boolean;
  compensation?: {
    monthlySalary?: number;
    commissionPercent?: number;
  };
  branchId?: string;
}

const mapPaginated = (
  response: any,
  key: string
): PaginatedResult<OwnerStaff> => {
  const items = response.data?.[key] ?? [];
  return {
    items,
    pagination:
      response.pagination ?? {
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
  };
};

export const ownerStaffService = {
  async list(filters: StaffFilters): Promise<PaginatedResult<OwnerStaff>> {
    const response = await api.get<{ staff: OwnerStaff[] }>(
      API_ENDPOINTS.OWNER.STAFF,
      {
        params: {
          ...filters,
          branchId: filters.branchId || undefined,
        },
      }
    );
    return mapPaginated(response, "staff");
  },

  async create(payload: StaffPayload): Promise<OwnerStaff> {
    const response = await api.post<{ staff: OwnerStaff }>(
      API_ENDPOINTS.OWNER.STAFF,
      payload
    );
    return response.data?.staff;
  },

  async update(
    id: string,
    payload: Partial<StaffPayload>
  ): Promise<OwnerStaff> {
    const response = await api.patch<{ staff: OwnerStaff }>(
      `${API_ENDPOINTS.OWNER.STAFF}/${id}`,
      payload
    );
    return response.data?.staff;
  },

  async updateStatus(id: string, isActive: boolean): Promise<OwnerStaff> {
    const response = await api.patch<{ staff: OwnerStaff }>(
      `${API_ENDPOINTS.OWNER.STAFF}/${id}/status`,
      { isActive }
    );
    return response.data?.staff;
  },

  async detail(id: string): Promise<OwnerStaff> {
    const response = await api.get<{ staff: OwnerStaff }>(
      `${API_ENDPOINTS.OWNER.STAFF}/${id}`
    );
    return response.data?.staff;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.OWNER.STAFF}/${id}`);
  },
};
