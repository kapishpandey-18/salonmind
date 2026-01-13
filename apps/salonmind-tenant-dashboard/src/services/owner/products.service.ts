import { api } from "../api";
import { API_ENDPOINTS } from "../../constants/api";
import type { OwnerProduct, PaginatedResult } from "../../types/owner";

export interface ProductPayload {
  name: string;
  brand: string;
  category: string;
  price: number;
  usage: string;
  description: string;
  inStock: boolean;
}

export const ownerProductsService = {
  async list(): Promise<PaginatedResult<OwnerProduct>> {
    const response = await api.get<{ products: OwnerProduct[] }>(
      API_ENDPOINTS.OWNER.PRODUCTS
    );
    const items = response.data?.products ?? [];
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

  async create(payload: ProductPayload): Promise<OwnerProduct> {
    const response = await api.post<{ product: OwnerProduct }>(
      API_ENDPOINTS.OWNER.PRODUCTS,
      payload
    );
    return response.data?.product;
  },

  async update(
    id: string,
    payload: Partial<ProductPayload>
  ): Promise<OwnerProduct> {
    const response = await api.patch<{ product: OwnerProduct }>(
      `${API_ENDPOINTS.OWNER.PRODUCTS}/${id}`,
      payload
    );
    return response.data?.product;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.OWNER.PRODUCTS}/${id}`);
  },
};
