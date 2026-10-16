
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    CreditCard,
    Gift,
    Minus,
    Package,
    Plus,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Tag,
    Trash2,
    Truck,
    X,
    Zap,
} from "lucide-react";
import PublicLayout from "../public-layout";
import { useCartStore } from "@/stores/cart";

type CartProduct = {
    id: number;
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

const INITIAL_PRODUCTS: CartProduct[] = [
    {
        id: 1,
        name: "Tay cầm chơi game GameSir Cyclone 2",
        slug: "gamesir-cyclone-2",
        image: "https://placehold.co/300x300/eef2ff/1d4ed8?text=GameSir+Cyclone+2",
        category: "Tay cầm chơi game",
        variant: "Màu trắng",
        price: 1190000,
        originalPrice: 1490000,
        quantity: 1,
        stock: 10,
        selected: true,
    },
    {
        id: 2,
        name: "Tay cầm Flydigi Vader 4 Pro",
        slug: "flydigi-vader-4-pro",
        image: "https://placehold.co/300x300/f3f4f6/374151?text=Flydigi+Vader+4+Pro",
        category: "Tay cầm chơi game",
        variant: "Màu đen",
        price: 1690000,
        originalPrice: 1990000,
        quantity: 1,
        stock: 8,
        selected: true,
    },
    {
        id: 3,
        name: "Chuột gaming không dây Logitech G304",
        slug: "logitech-g304",
        image: "https://placehold.co/300x300/f0fdf4/15803d?text=Logitech+G304",
        category: "Chuột máy tính",
        variant: "Màu đen",
        price: 590000,
        originalPrice: 790000,
        quantity: 1,
        stock: 15,
        selected: false,
    },
];

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);

const CART_KEY = "TAYCAMGIARE-cart";

export default function CartPage() {
      const [ready, setReady] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [coupon, setCoupon] = useState("");
    const [couponMessage, setCouponMessage] = useState("");

    const [shipping, setShipping] = useState<"standard" | "express">(
        "standard"
    );

    // Lấy state và actions từ Zustand
    const products = useCartStore((state) => state.items);

    const updateCartQuantity = useCartStore(
        (state) => state.updateQuantity
    );

    const toggleSelected = useCartStore(
        (state) => state.toggleSelected
    );

    const setAllSelected = useCartStore(
        (state) => state.setAllSelected
    );

    const removeFromCart = useCartStore(
        (state) => state.removeFromCart
    );

    // Chờ Zustand khôi phục dữ liệu từ localStorage
    useEffect(() => {
        if (useCartStore.persist.hasHydrated()) {
            setReady(true);
        }

        const unsubscribe =
            useCartStore.persist.onFinishHydration(() => {
                setReady(true);
            });

        return unsubscribe;
    }, []);

    // Sản phẩm đã chọn
    const selectedProducts = useMemo(
        () => products.filter((product) => product.selected),
        [products]
    );

    const selectedQuantity = selectedProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
    );

    const subtotal = selectedProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
    );

    const originalTotal = selectedProducts.reduce(
        (sum, product) =>
            sum + (product?.originalPrice || 0) * product.quantity,
        0
    );

    const productSavings = originalTotal - subtotal;

    const shippingFee =
        subtotal === 0
            ? 0
            : shipping === "express"
              ? 50000
              : subtotal >= 1000000
                ? 0
                : 30000;

    const discount =
        coupon === "TAYCAMGIARE10"
            ? Math.min(Math.round(subtotal * 0.1), 200000)
            : 0;

    const total = Math.max(
        0,
        subtotal + shippingFee - discount
    );

    const allSelected =
        products.length > 0 &&
        products.every((product) => product.selected);

    // Cập nhật số lượng
    const updateQuantity = (id: string, amount: number) => {
        const product = useCartStore
            .getState()
            .items.find((item) => item.id === id);

        if (!product) return;

        const newQuantity = Math.max(
            1,
            Math.min(product.stock, product.quantity + amount)
        );

        updateCartQuantity(id, newQuantity);
    };

    // Nhập số lượng trực tiếp
    const setProductQuantity = (id: string, quantity: number) => {
        const product = useCartStore
            .getState()
            .items.find((item) => item.id === id);

        if (!product) return;

        const newQuantity = Math.max(
            1,
            Math.min(product.stock, quantity)
        );

        updateCartQuantity(id, newQuantity);
    };

    // Chọn hoặc bỏ chọn sản phẩm
    const toggleProduct = (id: string) => {
        toggleSelected(id);
    };

    // Chọn hoặc bỏ chọn tất cả
    const toggleAll = () => {
        setAllSelected(!allSelected);
    };

    // Xóa một sản phẩm
    const removeProduct = (id: string) => {
        removeFromCart(id);
    };

    // Xóa những sản phẩm đã chọn
    const removeSelected = () => {
        const selectedIds = useCartStore
            .getState()
            .items.filter((item) => item.selected)
            .map((item) => item.id);

        selectedIds.forEach((id) => {
            removeFromCart(id);
        });
    };

    // Áp dụng mã giảm giá
    const applyCoupon = () => {
        const normalized = couponInput.trim().toUpperCase();

        if (normalized === "TAYCAMGIARE10") {
            setCoupon(normalized);
            setCouponMessage("Áp dụng mã giảm giá thành công!");
        } else {
            setCoupon("");
            setCouponMessage(
                "Mã không hợp lệ. Hãy thử mã TAYCAMGIARE10."
            );
        }
    };

    // Gỡ mã giảm giá
    const removeCoupon = () => {
        setCoupon("");
        setCouponInput("");
        setCouponMessage("");
    };

    if (!ready) {
        return (
            <PublicLayout>
                <main className="min-h-screen bg-gray-50 px-4 py-20">
                    <div className="mx-auto max-w-7xl animate-pulse">
                        <div className="mb-8 h-8 w-56 rounded bg-gray-200" />
                        <div className="h-80 rounded-2xl bg-gray-200" />
                    </div>
                </main>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
        <main className="min-h-screen bg-[#f6f8fc] pb-16 text-gray-900">
            {/* =====================================================
                BREADCRUMB
            ====================================================== */}

            <div>
                <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-sm">

                    <a
                        href="/"
                        className="text-gray-500 transition hover:text-blue-600"
                    >
                        Trang chủ
                    </a>

                    <ChevronRight
                        size={15}
                        className="text-gray-400"
                    />

                    <a
                        href="/products"
                        className="text-gray-500 transition hover:text-blue-600"
                    >
                        Sản phẩm
                    </a>

                    <ChevronRight
                        size={15}
                        className="text-gray-400"
                    />

                    <span className="truncate font-medium text-gray-900">
                        Giỏ hàng
                    </span>

                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-8 md:pb-10">
                {products.length === 0 ? (
                    /* Empty cart */
                    <div className="rounded-3xl border border-gray-100 bg-white px-5 py-16 text-center sm:py-24">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                            <ShoppingBag size={42} strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl font-bold sm:text-2xl">
                            Giỏ hàng đang trống
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                            Bạn chưa có sản phẩm nào trong giỏ hàng.
                            Hãy khám phá các sản phẩm công nghệ nổi bật
                            của TAYCAMGIARE nhé!
                        </p>

                        <Link
                            href="/products"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            Khám phá sản phẩm
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
                        {/* Product list */}
                        <section className="min-w-0 space-y-5">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                {/* Select all */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="h-4 w-4 cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-sm font-bold">
                                            Chọn tất cả
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            ({products.length} sản phẩm)
                                        </span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={removeSelected}
                                        disabled={selectedProducts.length === 0}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Trash2 size={16} />
                                        Xóa đã chọn
                                    </button>
                                </div>

                                {/* Desktop labels */}
                                <div className="hidden grid-cols-[minmax(0,1fr)_110px_130px_110px_30px] gap-4 bg-gray-50/80 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
                                    <span>Sản phẩm</span>
                                    <span className="text-center">Đơn giá</span>
                                    <span className="text-center">Số lượng</span>
                                    <span className="text-right">Thành tiền</span>
                                    <span />
                                </div>

                                {/* Products */}
                                <div className="divide-y divide-gray-100">
                                    {products.map((product,index) => {
                                        const lineTotal =
                                            product.price * product.quantity;
                                        const saving =
                                            (product.originalPrice -
                                                product.price) *
                                            product.quantity;

                                        return (
                                            <div
                                                key={product.id}
                                                className={`p-4 transition sm:px-6 ${
                                                    product.selected
                                                        ? "bg-white"
                                                        : "bg-gray-50/50"
                                                }`}
                                            >
                                                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_110px_130px_110px_30px] md:items-center md:gap-4">
                                                    {/* Product info */}
                                                    <div className="flex min-w-0 gap-3 sm:gap-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                product.selected
                                                            }
                                                            onChange={() =>
                                                                toggleProduct(
                                                                    product.id
                                                                )
                                                            }
                                                            aria-label={`Chọn ${product.name}`}
                                                            className="mt-3 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                                                        />

                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-28 sm:w-28"
                                                        >
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                                            />
                                                            {product.originalPrice >
                                                                product.price && (
                                                                <span className="absolute left-1 top-1 rounded-md bg-red-500 px-1.5 py-1 text-[10px] font-bold text-white">
                                                                    -
                                                                    {Math.round(
                                                                        (1 -
                                                                            product.price /
                                                                                product.originalPrice) *
                                                                            100
                                                                    )}
                                                                    %
                                                                </span>
                                                            )}
                                                        </Link>

                                                        <div className="min-w-0 flex-1">
                                                            <Link
                                                                href={`/products/${product.slug}`}
                                                                className="line-clamp-2 text-sm font-bold leading-5 transition hover:text-blue-600 sm:text-base sm:leading-6"
                                                            >
                                                                {product.name}
                                                            </Link>

                                                            <p className="mt-1.5 text-xs text-gray-500">
                                                                {product.category}
                                                            </p>

                                                            <div className="mt-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                                {product.variant}
                                                                <ChevronDown
                                                                    size={13}
                                                                    className="ml-1"
                                                                />
                                                            </div>

                                                            <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                                                                <span className="text-sm font-extrabold text-red-500">
                                                                    {formatPrice(
                                                                        product.price
                                                                    )}
                                                                </span>
                                                                {product.originalPrice >
                                                                    product.price && (
                                                                    <span className="text-xs text-gray-400 line-through">
                                                                        {formatPrice(
                                                                            product.originalPrice
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-2 hidden text-xs text-green-600 md:block">
                                                                <Check
                                                                    size={13}
                                                                    className="mr-1 inline"
                                                                />
                                                                Còn{" "}
                                                                {product.stock}{" "}
                                                                sản phẩm
                                                            </p>

                                                            {saving > 0 && (
                                                                <p className="mt-1 hidden text-xs text-orange-600 md:block">
                                                                    Tiết kiệm{" "}
                                                                    {formatPrice(
                                                                        saving
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Unit price */}
                                                    <div className="hidden text-center md:block">
                                                        <p className="text-sm font-bold">
                                                            {formatPrice(
                                                                product.price
                                                            )}
                                                        </p>
                                                        {product.originalPrice >
                                                            product.price && (
                                                            <p className="mt-1 text-xs text-gray-400 line-through">
                                                                {formatPrice(
                                                                    product.originalPrice
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="flex items-center justify-between gap-3 md:justify-center">
                                                        <span className="text-xs text-gray-500 md:hidden">
                                                            Số lượng
                                                        </span>

                                                        <div className="flex h-9 items-center overflow-hidden rounded-lg border border-gray-200">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        product.id,
                                                                        -1
                                                                    )
                                                                }
                                                                disabled={
                                                                    product.quantity <=
                                                                    1
                                                                }
                                                                aria-label="Giảm số lượng"
                                                                className="flex h-full w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
                                                            >
                                                                <Minus
                                                                    size={14}
                                                                />
                                                            </button>

                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={
                                                                    product.stock
                                                                }
                                                                value={
                                                                    product.quantity
                                                                }
                                                                onChange={(e) =>
                                                                    setProductQuantity(
                                                                        product.id,
                                                                        Number(
                                                                            e.target
                                                                                .value
                                                                        ) || 1
                                                                    )
                                                                }
                                                                aria-label="Số lượng sản phẩm"
                                                                className="h-full w-10 border-x border-gray-200 text-center text-sm font-semibold outline-none"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        product.id,
                                                                        1
                                                                    )
                                                                }
                                                                disabled={
                                                                    product.quantity >=
                                                                    product.stock
                                                                }
                                                                aria-label="Tăng số lượng"
                                                                className="flex h-full w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
                                                            >
                                                                <Plus
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Line total */}
                                                    <div className="flex items-center justify-between md:block md:text-right">
                                                        <span className="text-xs text-gray-500 md:hidden">
                                                            Thành tiền
                                                        </span>
                                                        <p className="text-sm font-extrabold text-red-500 sm:text-base">
                                                            {formatPrice(
                                                                lineTotal
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Remove */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeProduct(
                                                                product.id
                                                            )
                                                        }
                                                        aria-label={`Xóa ${product.name}`}
                                                        title="Xóa sản phẩm"
                                                        className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 md:flex"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeProduct(
                                                                product.id
                                                            )
                                                        }
                                                        className="flex w-fit items-center gap-1 text-xs text-gray-400 transition hover:text-red-500 md:hidden"
                                                    >
                                                        <Trash2 size={14} />
                                                        Xóa sản phẩm
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Cart footer */}
                                <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <p className="text-sm text-gray-500">
                                        Đã chọn{" "}
                                        <span className="font-bold text-gray-900">
                                            {selectedQuantity}
                                        </span>{" "}
                                        sản phẩm
                                    </p>

                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <span className="text-sm text-gray-500">
                                            Tổng tiền hàng
                                        </span>
                                        <span className="text-lg font-extrabold text-red-500">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Promo section */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                        <Gift size={21} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold">
                                            Ưu đãi dành cho bạn
                                        </h2>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Nhập mã để tiết kiệm hơn khi mua
                                            hàng.
                                        </p>
                                    </div>
                                </div>

                                {coupon ? (
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <Tag
                                                size={20}
                                                className="text-green-600"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-green-700">
                                                    {coupon}
                                                </p>
                                                <p className="mt-1 text-xs text-green-600">
                                                    Giảm {formatPrice(discount)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeCoupon}
                                            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500"
                                        >
                                            Gỡ mã <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <div className="relative flex-1">
                                            <Tag
                                                size={18}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                type="text"
                                                value={couponInput}
                                                onChange={(e) =>
                                                    setCouponInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        applyCoupon();
                                                    }
                                                }}
                                                placeholder="Nhập mã giảm giá"
                                                className="h-12 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm uppercase outline-none transition placeholder:normal-case focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            className="h-12 rounded-xl border border-blue-600 px-6 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                                        >
                                            Áp dụng mã
                                        </button>
                                    </div>
                                )}

                                {couponMessage && (
                                    <p
                                        className={`mt-3 text-sm ${
                                            coupon
                                                ? "text-green-600"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {couponMessage}
                                    </p>
                                )}

                                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-orange-50/70 p-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Gift
                                            size={17}
                                            className="text-orange-500"
                                        />
                                        Mã ưu đãi
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-orange-600">
                                            TAYCAMGIARE10
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Giảm 10%, tối đa 200.000đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Order summary */}
                        <aside className="min-w-0 lg:sticky lg:top-24">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                                    <h2 className="text-lg font-extrabold">
                                        Tóm tắt đơn hàng
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedQuantity} sản phẩm được chọn
                                    </p>
                                </div>

                                <div className="space-y-4 p-5 sm:p-6">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-gray-500">
                                            Tổng tiền hàng
                                        </span>
                                        <span className="font-semibold">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-gray-500">
                                            Giảm giá sản phẩm
                                        </span>
                                        <span className="font-semibold text-green-600">
                                            -{formatPrice(productSavings)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="text-gray-500">
                                            Phí vận chuyển
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                shippingFee === 0
                                                    ? "text-green-600"
                                                    : ""
                                            }`}
                                        >
                                            {shippingFee === 0
                                                ? "Miễn phí"
                                                : formatPrice(shippingFee)}
                                        </span>
                                    </div>

                                    {coupon && (
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-gray-500">
                                                Mã {coupon}
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                -{formatPrice(discount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-dashed border-gray-200 pt-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-bold">
                                                Tổng thanh toán
                                            </span>
                                            <span className="text-xl font-extrabold text-red-500">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-right text-xs text-gray-400">
                                            Đã bao gồm các ưu đãi áp dụng
                                        </p>
                                    </div>

                                    {subtotal < 1000000 && subtotal > 0 && (
                                        <div className="rounded-xl bg-blue-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <Truck
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-blue-600"
                                                />
                                                <p className="text-xs leading-5 text-blue-700">
                                                    Mua thêm{" "}
                                                    <span className="font-extrabold">
                                                        {formatPrice(
                                                            1000000 - subtotal
                                                        )}
                                                    </span>{" "}
                                                    để được miễn phí giao hàng
                                                    tiêu chuẩn.
                                                </p>
                                            </div>
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100">
                                                <div
                                                    className="h-full rounded-full bg-blue-600 transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            (subtotal / 1000000) *
                                                                100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={selectedProducts.length === 0}
                                        onClick={() => {
                                            window.location.href =
                                                "/checkout";
                                        }}
                                        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                                    >
                                        Tiến hành thanh toán
                                        <ArrowRight size={19} />
                                    </button>

                                    <div className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-gray-400">
                                        <ShieldCheck
                                            size={15}
                                            className="mt-0.5 shrink-0"
                                        />
                                        Thông tin của bạn được bảo mật khi
                                        thanh toán.
                                    </div>
                                </div>

                                {/* Payment methods */}
                                <div className="border-t border-gray-100 bg-gray-50/70 p-5 sm:px-6">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Phương thức thanh toán
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">
                                            COD
                                        </span>
                                        <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-blue-600">
                                            ATM
                                        </span>
                                        <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">
                                            VISA
                                        </span>
                                        <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">
                                            MASTERCARD
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Support card */}
                            <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Package size={21} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">
                                            Bạn cần hỗ trợ?
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            Liên hệ đội ngũ TAYCAMGIARE nếu bạn
                                            cần tư vấn về sản phẩm hoặc đơn
                                            hàng.
                                        </p>
                                        <Link
                                            href="/contact"
                                            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
                                        >
                                            Liên hệ ngay
                                            <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Continue shopping footer */}
                {products.length > 0 && (
                    <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <p className="font-bold">
                                Khám phá thêm sản phẩm công nghệ
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Tìm thiết bị phù hợp với nhu cầu của bạn.
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                        >
                            Xem tất cả sản phẩm
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                )}
            </div>
        </main>
        </PublicLayout>
    );
}
