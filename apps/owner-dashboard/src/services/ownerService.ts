import { api } from "./api";
import { API_ENDPOINTS } from "../constants/api";

export const ownerService = {
  saveProfile: async (payload: any) => {
    const response = await api.put(API_ENDPOINTS.OWNER.ONBOARDING.PROFILE, payload);
    return response.data;
  },
  saveBusinessHours: async (businessHours: any[]) => {
    const response = await api.put(API_ENDPOINTS.OWNER.ONBOARDING.BUSINESS_HOURS, {
      businessHours,
    });
    return response.data;
  },
  saveServices: async (services: any[]) => {
    const response = await api.put(API_ENDPOINTS.OWNER.ONBOARDING.SERVICES, {
      services,
    });
    return response.data;
  },
  saveStaff: async (staff: any[]) => {
    const response = await api.put(API_ENDPOINTS.OWNER.ONBOARDING.STAFF, {
      staff,
    });
    return response.data;
  },
  checkoutPlan: async (planCode: string) => {
    const response = await api.post(API_ENDPOINTS.OWNER.ONBOARDING.CHECKOUT, {
      planCode,
    });
    return response.data;
  },
  confirmPayment: async (payload: {
    orderId: string;
    paymentId: string;
    signature?: string;
  }) => {
    const response = await api.post(API_ENDPOINTS.OWNER.ONBOARDING.CONFIRM, payload);
    return response.data;
  },
  getTenantContext: async () => {
    const response = await api.get(API_ENDPOINTS.OWNER.CONTEXT);
    return response.data;
  },
  listBranches: async () => {
    const response = await api.get(API_ENDPOINTS.OWNER.BRANCHES);
    return response.data;
  },
  createBranch: async (payload: any) => {
    const response = await api.post(API_ENDPOINTS.OWNER.BRANCHES, payload);
    return response.data;
  },
  updateBranch: async (id: string, payload: any) => {
    const response = await api.patch(`${API_ENDPOINTS.OWNER.BRANCHES}/${id}`, payload);
    return response.data;
  },
  setDefaultBranch: async (id: string) => {
    const response = await api.post(
      `${API_ENDPOINTS.OWNER.BRANCHES}/${id}/set-default`
    );
    return response.data;
  },
  setActiveBranch: async (branchId: string) => {
    const response = await api.post(API_ENDPOINTS.OWNER.ACTIVE_BRANCH, {
      branchId,
    });
    return response.data;
  },
};

export type TenantContextResponse = Awaited<
  ReturnType<typeof ownerService.getTenantContext>
>;
