import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerSettings } from "../../types/owner";

export const ownerSettingsService = {
  async get(): Promise<OwnerSettings> {
    const response = await api.get<OwnerSettings>(API_ENDPOINTS.OWNER.SETTINGS);
    return response.data as OwnerSettings;
  },

  async update(payload: Partial<OwnerSettings>): Promise<OwnerSettings> {
    const response = await api.patch<OwnerSettings>(
      API_ENDPOINTS.OWNER.SETTINGS,
      payload
    );
    return response.data as OwnerSettings;
  },
};
