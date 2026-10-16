
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
    id: string ;
    name: string;
    slug: string;
    image: string;
    category: string;
    variant: string;
    price: number;
    originalPrice: number;
    quantity: number;
    stock: number;
    selected: boolean;
};

type CartStore = {
    items: CartItem[];

    addToCart: (product: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    toggleSelected: (id: string) => void;
    setAllSelected: (selected: boolean) => void;
    clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addToCart: (product) =>
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === product.id
                    );

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? {
                                          ...item,
                                          quantity: Math.min(
                                              item.quantity + product.quantity,
                                              item.stock
                                          ),
                                      }
                                    : item
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                ...product,
                                quantity: Math.min(
                                    product.quantity,
                                    product.stock
                                ),
                            },
                        ],
                    };
                }),

            removeFromCart: (id: string) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),

            updateQuantity: (id: string, quantity: number) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id
                            ? {
                                  ...item,
                                  quantity: Math.max(
                                      1,
                                      Math.min(quantity, item.stock)
                                  ),
                              }
                            : item
                    ),
                })),

            toggleSelected: (id) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id
                            ? { ...item, selected: !item.selected }
                            : item
                    ),
                })),

            setAllSelected: (selected) =>
                set((state) => ({
                    items: state.items.map((item) => ({
                        ...item,
                        selected,
                    })),
                })),

            clearCart: () => set({ items: [] }),
        }),
        {
            name: "TAYCAMGIARE-cart",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
