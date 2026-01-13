import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type {
  OwnerInventoryItem,
  OwnerProduct,
  PaginatedResult,
} from "../../types/owner";

export interface InventoryFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface InventoryPayload {
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  supplier: string;
}

export const ownerInventoryService = {
  async list(
    filters?: InventoryFilters
  ): Promise<PaginatedResult<OwnerInventoryItem>> {
    const response = await api.get<{ inventory: OwnerInventoryItem[] }>(
      API_ENDPOINTS.OWNER.INVENTORY,
      { params: filters }
    );
    const items = response.data?.inventory ?? [];
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
  },

  async update(
    id: string,
    payload: Partial<InventoryPayload>
  ): Promise<OwnerInventoryItem> {
    const response = await api.patch<{ inventory: OwnerInventoryItem }>(
      `${API_ENDPOINTS.OWNER.INVENTORY}/${id}`,
      payload
    );
    return response.data?.inventory;
  },

  async create(payload: InventoryPayload): Promise<OwnerProduct> {
    const response = await api.post<{ product: OwnerProduct }>(
      API_ENDPOINTS.OWNER.PRODUCTS,
      payload
    );
    return response.data?.product;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.OWNER.PRODUCTS}/${id}`);
  },
};
