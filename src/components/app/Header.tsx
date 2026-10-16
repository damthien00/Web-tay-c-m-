"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Search,
    ShoppingCart,
    User,
    Package,
    Menu,
    X,
    ChevronDown,
    Heart,
    Phone,
    Truck,
    ShieldCheck,
    Percent,
    Headphones,
} from "lucide-react";

import CategoryMegaMenu from "./CategoryMegaMenu";
import { useCartStore } from "@/stores/cart";

export default function Header() {
    const [hideHeader, setHideHeader] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const pathname = usePathname();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Ẩn Top Bar khi cuộn xuống, giới hạn cập nhật state
    useEffect(() => {
        let ticking = false;

        const updateScrollState = () => {
            const shouldHide = window.scrollY > 40;

            setHideHeader((previous) =>
                previous === shouldHide ? previous : shouldHide
            );
        };

        const handleScroll = () => {
            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(() => {
                updateScrollState();
                ticking = false;
            });
        };

        // Đồng bộ trạng thái khi tải trang hoặc refresh
        updateScrollState();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    
    const cartCount = useCartStore((state) =>
    state.items.reduce(
        (total, item) => total + item.quantity,
        0
    )
);

    return (
        <header className="sticky top-0 z-[100] w-full bg-white shadow-sm">
            {/* =====================================================
                TOP BAR: Chỉ ẩn phần này khi cuộn trang
            ====================================================== */}
            <div
                aria-hidden={hideHeader}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    hideHeader
                        ? "grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100"
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="hidden bg-gray-950 text-white md:block">
                        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
                            {/* Left */}
                            <div className="flex items-center gap-5">
                                <span className="flex items-center gap-1.5">
                                    <Truck size={14} />
                                    Miễn phí vận chuyển đơn từ 500K
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck size={14} />
                                    Chính hãng 100%
                                </span>
                            </div>

                            {/* Right */}
                            <div className="flex items-center gap-5">
                                <Link
                                    href="/order-tracking"
                                    className="transition hover:text-blue-400"
                                >
                                    Theo dõi đơn hàng
                                </Link>

                                <Link
                                    href="/contact"
                                    className="transition hover:text-blue-400"
                                >
                                    Hỗ trợ
                                </Link>

                                <Link
                                    href="/promotions"
                                    className="flex items-center gap-1 transition hover:text-blue-400"
                                >
                                    <Percent size={14} />
                                    Khuyến mãi
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MAIN HEADER: Luôn hiển thị
            ====================================================== */}
            <div className="border-b">
                <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-5 px-4">
                    {/* Mobile Menu */}
                    <button
                        type="button"
                        aria-label="Mở menu"
                        className="flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo */}
                    <Link
                        href="/"
                        aria-label="TAYCAMGIARE - Trang chủ"
                        className="flex h-12 shrink-0 items-center justify-center"
                    >
                        <img
                            src="/logo.png"
                            alt="TAYCAMGIARE"
                            className="block h-20 w-auto max-w-[160px] object-contain"
                        />
                    </Link>

                    {/* Search */}
                    <div
                        ref={wrapperRef}
                        className="relative hidden min-w-0 flex-1 md:block"
                    >
                        <form
                            action="/products"
                            method="GET"
                            onSubmit={() => setIsOpen(false)}
                            className="relative z-10"
                        >
                            <div className="flex h-11 overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                                <div className="flex shrink-0 items-center pl-4">
                                    <Search
                                        size={19}
                                        className="text-gray-400"
                                    />
                                </div>

                                <input
                                    type="search"
                                    name="q"
                                    autoComplete="off"
                                    placeholder="Bạn đang tìm kiếm sản phẩm gì?"
                                    onFocus={() => setIsOpen(true)}
                                    onClick={() => setIsOpen(true)}
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                />

                                <button
                                    type="submit"
                                    aria-label="Tìm kiếm sản phẩm"
                                    className="m-1 flex shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 text-white transition hover:bg-blue-700 active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-2 sm:gap-4">
                        {/* Account */}
                        <Link
                            href="/account"
                            className="group hidden items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-50 sm:flex"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition group-hover:border-blue-500 group-hover:text-blue-600">
                                <User size={19} />
                            </div>

                            <div className="hidden lg:block">
                                <p className="text-xs text-gray-500">
                                    Xin chào
                                </p>

                                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                                    Tài khoản
                                </p>
                            </div>
                        </Link>

                        {/* Orders */}
                        <Link
                            href="/orders"
                            className="group hidden items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-50 lg:flex"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 transition group-hover:border-blue-500 group-hover:text-blue-600">
                                <Package size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Đơn hàng
                                </p>

                                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                                    Của tôi
                                </p>
                            </div>
                        </Link>

                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            aria-label="Sản phẩm yêu thích"
                            className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-50 hover:text-red-500 sm:flex"
                        >
                            <Heart size={22} />
                        </Link>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            aria-label="Giỏ hàng"
                            className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                        >
                            <ShoppingCart size={23} />

                            {cartCount >= 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MOBILE SEARCH
            ====================================================== */}
            <div className="border-b px-4 py-3 md:hidden">
                <form
                    action="/products"
                    method="GET"
                    className="flex h-10 overflow-hidden rounded-lg border border-gray-300 bg-gray-50"
                >
                    <div className="flex items-center pl-3">
                        <Search
                            size={18}
                            className="text-gray-400"
                        />
                    </div>

                    <input
                        type="text"
                        name="q"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    />

                    <button
                        type="submit"
                        className="flex items-center justify-center bg-blue-600 px-4 text-white transition hover:bg-blue-700"
                        aria-label="Tìm kiếm"
                    >
                        <Search size={18} />
                    </button>
                </form>
            </div>

            {/* =====================================================
                NAVIGATION
            ====================================================== */}
            <nav className="hidden border-b bg-white md:block">
                <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
                    {/* Category */}
                    <div className="group flex h-full items-center gap-2 border-r pr-6 text-sm font-semibold text-gray-800 transition hover:text-blue-600">
                        <Menu size={19} />

                        <CategoryMegaMenu />

                        <ChevronDown
                            size={16}
                            className="transition-transform duration-200 group-hover:rotate-180"
                        />
                    </div>

                    {/* Menu */}
                    <div className="flex h-full items-center gap-7 pl-6 text-sm font-medium">
                        {/* Trang chủ */}
                        <Link
                            href="/"
                            className={`relative flex h-full items-center transition-colors duration-200 ${
                                pathname === "/"
                                    ? "text-blue-600"
                                    : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                            Trang chủ

                            {pathname === "/" && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                            )}
                        </Link>

                        {/* Cửa hàng */}
                        <Link
                            href="/products"
                            className={`relative flex h-full items-center transition-colors duration-200 ${
                                pathname === "/products" ||
                                pathname.startsWith("/products/")
                                    ? "text-blue-600"
                                    : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                            Cửa hàng

                            {(pathname === "/products" ||
                                pathname.startsWith("/products/")) && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                            )}
                        </Link>

                        {/* Hỗ trợ */}
                        <Link
                            href="/help"
                            className={`relative flex h-full items-center transition-colors duration-200 ${
                                pathname === "/help" ||
                                pathname.startsWith("/help/")
                                    ? "text-blue-600"
                                    : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                            Hỗ trợ

                            {(pathname === "/help" ||
                                pathname.startsWith("/help/")) && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                            )}
                        </Link>

                        {/* Blog */}
                        <Link
                            href="/blog"
                            className={`relative flex h-full items-center transition-colors duration-200 ${
                                pathname === "/blog" ||
                                pathname.startsWith("/blog/")
                                    ? "text-blue-600"
                                    : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                            Blog

                            {(pathname === "/blog" ||
                                pathname.startsWith("/blog/")) && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600" />
                            )}
                        </Link>
                    </div>

                    {/* Hotline */}
                    <div className="ml-auto flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Phone
                                size={20}
                                className="text-blue-600"
                            />

                            <div>
                                <p className="text-[11px] text-gray-500">
                                    Hotline
                                </p>

                                <a
                                    href="tel:0385244720"
                                    className="font-bold text-gray-800 transition hover:text-blue-600"
                                >
                                    0385244720
                                </a>
                            </div>
                        </div>

                        {/* Hỗ trợ 24/7 */}
                        <Link
                            href="/help"
                            className="flex items-center gap-2 border-l border-gray-200 pl-6"
                        >
                            <Headphones
                                size={22}
                                className="text-blue-600"
                            />

                            <div>
                                <p className="text-[11px] text-gray-500">
                                    Hỗ trợ khách hàng
                                </p>

                                <p className="font-bold text-gray-800 transition hover:text-blue-600">
                                    Hỗ trợ 24/7
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* =====================================================
                MOBILE MENU PLACEHOLDER
            ====================================================== */}
            <div className="hidden">
                <div className="fixed inset-0 z-[60] bg-black/40">
                    <div className="h-full w-[300px] bg-white">
                        <div className="flex h-16 items-center justify-between border-b px-4">
                            <span className="text-xl font-bold">
                                TAYCAMGIARE
                            </span>
                            <button
                                type="button"
                                aria-label="Đóng menu"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}