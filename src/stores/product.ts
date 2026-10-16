export interface Product {
  id: string | number;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string;
  rating: number;
  sold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  data: {
    items: Product[];
    page: number;
    per_page: number;
    total: number;
    totalPages: number;
  } | null;
  error: string | null;
}

import { create } from "zustand";

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: (params?: {
    page?: number;
    per_page?: number;
    q?: string;
    sort?: string;
  }) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });

    try {
      const searchParams = new URLSearchParams();

      searchParams.set("page", String(params.page ?? 1));
      searchParams.set("per_page", String(params.per_page ?? 10));

      if (params.q?.trim()) {
        searchParams.set("q", params.q.trim());
      }

      if (params.sort) {
        searchParams.set("sort", params.sort);
      }

      const response = await fetch(
        `/api/products?${searchParams.toString()}`
      );

      const result: ProductListResponse = await response.json();

      if (!response.ok || result.error || !result.data) {
        throw new Error(result.error || "Không thể tải sản phẩm");
      }

      set({
        products: result.data.items,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi tải sản phẩm",
      });
    }
  },
}));