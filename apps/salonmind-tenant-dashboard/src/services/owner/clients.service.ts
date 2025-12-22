import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerClient, PaginatedResult } from "../../types/owner";

export interface ClientFilters {
  branchId?: string | null;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClientPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  status?: string;
  gender?: string;
  dob?: string;
  notes?: string;
  tags?: string[];
  branchId?: string;
}

const mapPaginated = (
  response: any,
  key: string
): PaginatedResult<OwnerClient> => {
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

export const ownerClientsService = {
  async list(filters: ClientFilters): Promise<PaginatedResult<OwnerClient>> {
    const response = await api.get<{ clients: OwnerClient[] }>(
      API_ENDPOINTS.OWNER.CLIENTS,
      {
        params: {
          ...filters,
          branchId: filters.branchId || undefined,
        },
      }
    );
    return mapPaginated(response, "clients");
  },

  async create(payload: ClientPayload): Promise<OwnerClient> {
    const response = await api.post<{ client: OwnerClient }>(
      API_ENDPOINTS.OWNER.CLIENTS,
      payload
    );
    return response.data?.client;
  },

  async update(
    id: string,
    payload: Partial<ClientPayload>
  ): Promise<OwnerClient> {
    const response = await api.patch<{ client: OwnerClient }>(
      `${API_ENDPOINTS.OWNER.CLIENTS}/${id}`,
      payload
    );
    return response.data?.client;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.OWNER.CLIENTS}/${id}`);
  },
};
