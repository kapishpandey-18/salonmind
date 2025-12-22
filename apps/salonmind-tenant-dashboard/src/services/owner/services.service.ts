import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerService, PaginatedResult } from "../../types/owner";

export interface ServiceFilters {
  branchId?: string | null;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServicePayload {
  name: string;
  category?: string;
  duration?: number;
  price?: number;
  description?: string;
  isActive?: boolean;
  branchId?: string;
}

const mapPaginated = (
  response: any,
  key: string
): PaginatedResult<OwnerService> => {
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

export const ownerServicesService = {
  async list(filters: ServiceFilters): Promise<PaginatedResult<OwnerService>> {
    const response = await api.get<{ services: OwnerService[] }>(
      API_ENDPOINTS.OWNER.SERVICES,
      {
        params: {
          ...filters,
          branchId: filters.branchId || undefined,
        },
      }
    );
    return mapPaginated(response, "services");
  },

  async create(payload: ServicePayload): Promise<OwnerService> {
    const response = await api.post<{ service: OwnerService }>(
      API_ENDPOINTS.OWNER.SERVICES,
      payload
    );
    return response.data?.service;
  },

  async update(
    id: string,
    payload: Partial<ServicePayload>
  ): Promise<OwnerService> {
    const response = await api.patch<{ service: OwnerService }>(
      `${API_ENDPOINTS.OWNER.SERVICES}/${id}`,
      payload
    );
    return response.data?.service;
  },

  async updateStatus(
    id: string,
    isActive: boolean
  ): Promise<OwnerService> {
    const response = await api.patch<{ service: OwnerService }>(
      `${API_ENDPOINTS.OWNER.SERVICES}/${id}/status`,
      { isActive }
    );
    return response.data?.service;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.OWNER.SERVICES}/${id}`);
  },
};
