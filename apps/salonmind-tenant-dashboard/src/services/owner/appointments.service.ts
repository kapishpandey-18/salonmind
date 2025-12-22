import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type {
  OwnerAppointment,
  PaginatedResult,
} from "../../types/owner";

export interface AppointmentFilters {
  branchId?: string | null;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentPayload {
  clientId: string;
  staffId: string;
  serviceIds: string[];
  status?: string;
  startAt?: string;
  endAt?: string;
  duration?: number;
  notes?: string;
  totalAmount?: number;
  branchId?: string;
}

const mapPaginated = (
  response: any,
  key: string
): PaginatedResult<OwnerAppointment> => {
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

export const ownerAppointmentsService = {
  async list(filters: AppointmentFilters): Promise<
    PaginatedResult<OwnerAppointment>
  > {
    const response = await api.get<{ appointments: OwnerAppointment[] }>(
      API_ENDPOINTS.OWNER.APPOINTMENTS,
      {
        params: {
          ...filters,
          branchId: filters.branchId || undefined,
        },
      }
    );
    return mapPaginated(response, "appointments");
  },

  async create(payload: AppointmentPayload): Promise<OwnerAppointment> {
    const response = await api.post<{ appointment: OwnerAppointment }>(
      API_ENDPOINTS.OWNER.APPOINTMENTS,
      payload
    );
    return response.data?.appointment;
  },

  async update(
    id: string,
    payload: Partial<AppointmentPayload>
  ): Promise<OwnerAppointment> {
    const response = await api.patch<{ appointment: OwnerAppointment }>(
      `${API_ENDPOINTS.OWNER.APPOINTMENTS}/${id}`,
      payload
    );
    return response.data?.appointment;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.OWNER.APPOINTMENTS}/${id}`);
  },

  async cancel(id: string, reason?: string): Promise<OwnerAppointment> {
    const response = await api.post<{ appointment: OwnerAppointment }>(
      `${API_ENDPOINTS.OWNER.APPOINTMENTS}/${id}/cancel`,
      { reason }
    );
    return response.data?.appointment;
  },
};
