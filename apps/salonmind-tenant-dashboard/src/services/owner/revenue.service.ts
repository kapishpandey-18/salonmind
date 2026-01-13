import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerRevenueSummary } from "../../types/owner";

export const ownerRevenueService = {
  async getSummary(range?: string): Promise<OwnerRevenueSummary> {
    const response = await api.get<OwnerRevenueSummary>(
      API_ENDPOINTS.OWNER.REVENUE_SUMMARY,
      { params: range ? { range } : undefined }
    );
    return response.data as OwnerRevenueSummary;
  },
};
