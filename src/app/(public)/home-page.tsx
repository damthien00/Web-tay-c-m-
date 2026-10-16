
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ShoppingCart,
    ChevronRight,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Check,
    X,
} from "lucide-react";

import { useCartStore } from "@/stores/cart";
import { useProductStore } from "@/stores/product";
import { formatPrice } from "@/utils/currency";

const products = [
    {
        id: 1,
        name: "iPhone 16 Pro Max",
        price: "29.990.000₫",
        oldPrice: "34.990.000₫",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
        rating: 5,
        sold: 128,
    },
    {
        id: 2,
        name: "MacBook Pro M4",
        price: "39.990.000₫",
        oldPrice: "44.990.000₫",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        rating: 5,
        sold: 86,
    },
    {
        id: 3,
        name: "Sony WH-1000XM5",
        price: "7.490.000₫",
        oldPrice: "9.990.000₫",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
        rating: 4,
        sold: 215,
    },
    {
        id: 4,
        name: "Logitech G Pro X Superlight",
        price: "2.690.000₫",
        oldPrice: "3.490.000₫",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
        rating: 5,
        sold: 174,
    },
];

function parsePrice(price: string): number {
    return Number(price.replace(/[^\d]/g, ""));
}

export default function HomePage() {
    const [toast, setToast] = useState("");

    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = (product: (typeof products)[number]) => {
        addToCart({
            id: String(product.id),
            name: product.name,
            slug: `product-${product.id}`,
            image: product.image,
            category: "Sản phẩm công nghệ",
            variant: "Mặc định",
            price: product.price,
            originalPrice: product?.oldPrice ? parsePrice(String(product.oldPrice)) : 0,
            quantity: 1,
            stock: 99,
            selected: true,
        });

        setToast(`Đã thêm "${product.name}" vào giỏ hàng`);
    };

    const products = useProductStore((state) => state.products);
    const loading = useProductStore((state) => state.loading);
    const error = useProductStore((state) => state.error);
    const fetchProducts = useProductStore((state) => state.fetchProducts);

    useEffect(() => {
    void fetchProducts({
        page: 1,
        per_page: 10,
        sort: "createdAt.desc",
    });
    }, [fetchProducts]);
    
    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">
            {/* TOAST */}
            {toast && (
                <div
                    role="status"
                    className="fixed bottom-6 right-6 z-[100] flex max-w-[calc(100%-3rem)] items-center gap-3 rounded-xl bg-gray-900 px-5 py-4 text-sm font-medium text-white shadow-2xl"
                >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <Check size={17} />
                    </span>

                    <span>{toast}</span>

                    <button
                        type="button"
                        onClick={() => setToast("")}
                        aria-label="Đóng thông báo"
                        className="ml-2 text-gray-400 hover:text-white"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* HERO */}
            <section className="relative bg-gray-900">
                <img
                    src="/banner.jpg"
                    alt="Banner khuyến mãi"
                    className="h-full min-h-[420px] w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute inset-0 mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
                    <div className="text-white">
                        <h1 className="text-4xl font-black leading-tight md:text-6xl">
                            Chơi game.
                            <br />
                            Bứt phá giới hạn.
                        </h1>

                        <p className="mt-5 max-w-lg text-lg text-gray-200">
                            Khám phá các dòng tay cầm chơi game chính hãng,
                            thiết kế công thái học, phản hồi nhanh và trải nghiệm
                            gaming tuyệt vời.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/products"
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
                            >
                                Khám phá ngay
                            </Link>

                            <Link
                                href="/categories"
                                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition hover:bg-gray-800"
                            >
                                Xem tay cầm
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="border-b bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y px-4 md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="flex items-center gap-4 py-6 md:px-8">
                        <Truck className="text-blue-600" size={32} />
                        <div>
                            <h3 className="font-bold">
                                Miễn phí vận chuyển
                            </h3>
                            <p className="text-sm text-gray-500">
                                Đơn hàng từ 500.000₫
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-6 md:px-8">
                        <ShieldCheck className="text-blue-600" size={32} />
                        <div>
                            <h3 className="font-bold">Hàng chính hãng</h3>
                            <p className="text-sm text-gray-500">
                                Cam kết 100% chính hãng
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-6 md:px-8">
                        <RotateCcw className="text-blue-600" size={32} />
                        <div>
                            <h3 className="font-bold">Đổi trả dễ dàng</h3>
                            <p className="text-sm text-gray-500">
                                Đổi trả trong 30 ngày
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCTS */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
                                Sản phẩm nổi bật
                            </span>

                            <h2 className="mt-2 text-3xl font-bold">
                                Sản phẩm bán chạy
                            </h2>
                        </div>

                        <Link
                            href="/products"
                            className="hidden items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 md:flex"
                        >
                            Xem tất cả
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group overflow-hidden rounded-xl border bg-white transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <span className="absolute left-3 top-3 z-10 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                        -20%
                                    </span>

                                    <Link
                                        href={`/products/${product.id}`}
                                        className="block h-full w-full"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(product)}
                                        aria-label={`Thêm ${product.name} vào giỏ hàng`}
                                        className="absolute bottom-3 right-3 rounded-full bg-white p-3 shadow-md transition hover:bg-blue-600 hover:text-white"
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>

                                <div className="p-4">
                                    <h3 className="line-clamp-2 min-h-[48px] font-semibold">
                                        {product.name}
                                    </h3>

                                    <div className="mt-2 flex items-center gap-1">
                                        {Array.from({ length: 5 }).map(
                                            (_, index) => (
                                                <Star
                                                    key={index}
                                                    size={14}
                                                    className={
                                                        index < product.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            )
                                        )}

                                        <span className="ml-2 text-xs text-gray-400">
                                            Đã bán {product.sold}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="text-xl font-bold text-red-600">
                                            {formatPrice(product.price)}
                                        </span>

                                        <span className="text-sm text-gray-400 line-through">
                                            {formatPrice(product.oldPrice)}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(product)}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.98]"
                                    >
                                        <ShoppingCart size={17} />
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROMOTION */}
            <section className="mx-auto max-w-7xl px-4 py-16">
                <div className="overflow-hidden rounded-2xl bg-blue-600">
                    <div className="grid items-center md:grid-cols-2">
                        <div className="p-8 text-white md:p-14">
                            <span className="text-sm font-bold uppercase tracking-widest">
                                Ưu đãi đặc biệt
                            </span>

                            <h2 className="mt-3 text-3xl font-black md:text-5xl">
                                Giảm đến 50%
                            </h2>

                            <p className="mt-4 text-blue-100">
                                Săn ngay những sản phẩm công nghệ yêu thích
                                với mức giá cực kỳ hấp dẫn.
                            </p>

                            <Link
                                href="/products"
                                className="mt-7 inline-block rounded-lg bg-white px-6 py-3 font-bold text-blue-600 transition hover:bg-gray-100"
                            >
                                Khám phá ngay
                            </Link>
                        </div>

                        <img
                            src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1000"
                            alt="Ưu đãi sản phẩm công nghệ"
                            className="h-72 w-full object-cover md:h-full"
                        />
                    </div>
                </div>
            </section>

            {/* NEWSLETTER */}
            <section className="bg-gray-100 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <h2 className="text-3xl font-bold">
                        Nhận thông báo khuyến mãi
                    </h2>

                    <p className="mt-3 text-gray-500">
                        Đăng ký email để không bỏ lỡ các chương trình ưu đãi mới nhất.
                    </p>

                    <div className="mt-6 flex overflow-hidden rounded-lg border bg-white p-1">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn..."
                            aria-label="Email đăng ký nhận khuyến mãi"
                            className="min-w-0 flex-1 px-4 outline-none"
                        />

                        <button
                            type="button"
                            className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            Đăng ký
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
