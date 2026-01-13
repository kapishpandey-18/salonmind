import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";

export interface OwnerPlan {
  code: string;
  name: string;
  description: string;
  price: string;
  validity: string;
  features: string[];
  amount?: number;
  currency?: string;
  billingCycle?: string;
  maxBranches?: number | null;
  maxEmployees?: number | null;
}

export const ownerPlansService = {
  async list(): Promise<OwnerPlan[]> {
    const response = await api.get<{ plans: OwnerPlan[] }>(
      API_ENDPOINTS.OWNER.PLANS
    );
    return response.data?.plans ?? [];
  },
};
