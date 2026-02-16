import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerTopService } from "../../types/owner";

export const ownerReportsService = {
  async getTopServices(range?: string): Promise<OwnerTopService[]> {
    const response = await api.get<{ services: OwnerTopService[] }>(
      API_ENDPOINTS.OWNER.REPORTS_TOP_SERVICES,
      { params: range ? { range } : undefined }
    );
    return response.data?.services ?? [];
  },
};
