export interface OrderItem {
    id: string;
    orderId: string;
    productId: string | number;
    productName: string;
    price: number;
    quantity: number;
    lineTotal: number;
}

export interface Order {
    id: string;
    userId: string;
    orderCode: string;

    receiverName: string;
    receiverPhone: string;
    receiverEmail: string | null;
    shippingAddress: string;
    note: string | null;

    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;

    paymentMethod: string;
    paymentStatus: string;
    status: string;

    items: OrderItem[];

    createdAt: string;
    updatedAt: string;
}

export interface OrderListResponse {
    data: Order[] | null;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

export interface OrderDetailResponse {
    data: Order | null;
    message?: string;
}



export interface CreateOrderRequest {
    items: {
        productId: string | number;
        quantity: number;
    }[];

    receiverName: string;
    receiverPhone: string;
    receiverEmail?: string;
    shippingAddress: string;
    note?: string;

    shippingFee?: number;
    discount?: number;
    paymentMethod?: string;
}

export interface CreateOrderResponse {
    data: Order | null;
    message?: string;
}


import { create } from "zustand";

// import type {
//     Order,
//     OrderListResponse,
//     OrderDetailResponse,
//     CreateOrderRequest,
//     CreateOrderResponse,
// } from "@/types/order";

interface OrderStore {
    orders: Order[];
    currentOrder: Order | null;

    loading: boolean;
    error: string | null;

    page: number;
    limit: number;
    total: number;
    totalPages: number;

    fetchOrders: (params?: {
        page?: number;
        limit?: number;
    }) => Promise<void>;

    fetchOrderById: (id: string) => Promise<void>;

    createOrder: (
        data: CreateOrderRequest
    ) => Promise<Order | null>;

    cancelOrder: (id: string) => Promise<boolean>;

    clearCurrentOrder: () => void;
    clearError: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
    orders: [],
    currentOrder: null,

    loading: false,
    error: null,

    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,

    // GET /api/orders?page=1&limit=10
    fetchOrders: async (params = {}) => {
        set({ loading: true, error: null });

        try {
            const searchParams = new URLSearchParams();

            searchParams.set("page", String(params.page ?? 1));
            searchParams.set("limit", String(params.limit ?? 10));

            const response = await fetch(
                `/api/orders?${searchParams.toString()}`
            );

            const result: OrderListResponse =
                await response.json();

            if (!response.ok || !result.data) {
                throw new Error(
                    result.message || "Không thể tải đơn hàng"
                );
            }

            set({
                orders: result.data,
                page: result.pagination?.page ?? 1,
                limit: result.pagination?.limit ?? 10,
                total: result.pagination?.total ?? 0,
                totalPages: result.pagination?.totalPages ?? 0,
                loading: false,
                error: null,
            });
        } catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi tải đơn hàng",
            });
        }
    },

    // GET /api/orders/:id
    fetchOrderById: async (id) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(
                `/api/orders/${encodeURIComponent(id)}`
            );

            const result: OrderDetailResponse =
                await response.json();

            if (!response.ok || !result.data) {
                throw new Error(
                    result.message || "Không tìm thấy đơn hàng"
                );
            }

            set({
                currentOrder: result.data,
                loading: false,
                error: null,
            });
        } catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải chi tiết đơn hàng",
            });
        }
    },

    // POST /api/orders
    createOrder: async (data) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result: CreateOrderResponse =
                await response.json();

            if (!response.ok || !result.data) {
                throw new Error(
                    result.message || "Đặt hàng thất bại"
                );
            }

            set((state) => ({
                orders: [
                    result.data!,
                    ...state.orders,
                ],
                currentOrder: result.data,
                loading: false,
                error: null,
            }));

            return result.data;
        } catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi đặt hàng",
            });

            return null;
        }
    },

    // PATCH /api/orders/:id
    cancelOrder: async (id) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(
                `/api/orders/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: "CANCELLED",
                    }),
                }
            );

            const result: OrderDetailResponse =
                await response.json();

            if (!response.ok || !result.data) {
                throw new Error(
                    result.message || "Hủy đơn hàng thất bại"
                );
            }

            const updatedOrder = result.data;

            set((state) => ({
                orders: state.orders.map((order) =>
                    order.id === updatedOrder.id
                        ? updatedOrder
                        : order
                ),
                currentOrder:
                    state.currentOrder?.id === updatedOrder.id
                        ? updatedOrder
                        : state.currentOrder,
                loading: false,
                error: null,
            }));

            return true;
        } catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi hủy đơn hàng",
            });

            return false;
        }
    },

    clearCurrentOrder: () => {
        set({ currentOrder: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));
