
"use client";

import { useState } from "react";

import {
    ChevronRight,
    Heart,
    Minus,
    Plus,
    ShoppingCart,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Check,
    Share2,
    Zap,
    MessageCircle,
} from "lucide-react";
import Header from "@/components/app/Header";
import PublicLayout from "../../public-layout";


/* =========================================================
   PRODUCT DATA
========================================================= */

const product = {
    id: "iphone-16-pro-max",

    name: "iPhone 16 Pro Max 256GB",
    brand: "Apple",
    sku: "APL-IP16PM-256",

    price: 29990000,
    oldPrice: 34990000,

    discount: 14,

    rating: 4.8,
    reviews: 326,
    sold: 1250,

    images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200",
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200",
        "https://images.unsplash.com/photo-1592286927505-2fd1f2e8f4d8?w=1200",
    ],

    colors: [
        {
            name: "Titan Tự Nhiên",
            value: "#c4b8a5",
        },
        {
            name: "Titan Đen",
            value: "#222222",
        },
        {
            name: "Titan Trắng",
            value: "#eeeeee",
        },
        {
            name: "Titan Sa Mạc",
            value: "#d6b18a",
        },
    ],

    storage: [
        "256GB",
        "512GB",
        "1TB",
    ],
};


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}


/* =========================================================
   PAGE
========================================================= */

export default function ProductDetailPage() {

    const [selectedImage, setSelectedImage] = useState(
        product.images[0]
    );

    const [selectedColor, setSelectedColor] = useState(
        product.colors[0].name
    );

    const [selectedStorage, setSelectedStorage] = useState(
        product.storage[0]
    );

    const [quantity, setQuantity] = useState(1);

    const [liked, setLiked] = useState(false);


    return (
        <>
            <PublicLayout>
                <main className="min-h-screen bg-gray-50">


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
                                {product.name}
                            </span>

                        </div>

                    </div>


                    {/* =====================================================
                        MAIN PRODUCT SECTION
                    ====================================================== */}

                    <section className="mx-auto max-w-7xl px-4 pb-4">
                        <div className="rounded-2xl border bg-white px-5 py-5 shadow-sm md:p-7">
                            <div className="flex gap-8 lg:flex-row lg:gap-12">
                                {/* =================================================
                                    PRODUCT GALLERY
                                ================================================== */}

                                <div className="flex-1">
                                    <div className="grid gap-4">
                                    


                                        {/* MAIN IMAGE */}

                                        <div className="order-1 aspect-square overflow-hidden rounded-xl bg-gray-100 sm:order-1">

                                            <img
                                                src={selectedImage}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                            />

                                        </div>
        {/* THUMBNAILS */}
                                        <div className="order-2 flex gap-3 overflow-x-auto flex-row sm:order-2">

                                            {product.images.map(
                                                (image, index) => (
                                                    <button
                                                        key={image}
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                image
                                                            )
                                                        }
                                                        className={`
                                                            h-[76px] 
                                                            w-[76px]
                                                            shrink-0
                                                            overflow-hidden
                                                            rounded-lg
                                                            border-2
                                                            bg-white
                                                            transition

                                                            ${
                                                                selectedImage ===
                                                                image
                                                                    ? "border-blue-600"
                                                                    : "border-gray-200 hover:border-gray-400"
                                                            }
                                                        `}
                                                    >

                                                        <img
                                                            src={image}
                                                            alt={`${product.name} ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />

                                                    </button>

                                                )
                                            )}

                                        </div>
                                    </div>


                                    {/* SHARE */}

                                    <div className="mt-4 flex items-center justify-center gap-6">

                                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                                            <Share2 size={17} />
                                            Chia sẻ
                                        </button>

                                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                                            <MessageCircle size={17} />
                                            Hỏi đáp
                                        </button>

                                    </div>

                                </div>


                                {/* =================================================
                                    PRODUCT INFORMATION
                                ================================================== */}

                                <div>


                                    {/* BRAND */}

                                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                                        {product.brand}
                                    </p>


                                    {/* NAME */}

                                    <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 md:text-3xl">
                                        {product.name}
                                    </h1>


                                    {/* RATING */}

                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">

                                        <div className="flex items-center gap-1">

                                            <span className="font-bold">
                                                {product.rating}
                                            </span>

                                            <Star
                                                size={16}
                                                className="fill-yellow-400 text-yellow-400"
                                            />

                                        </div>

                                        <span className="text-gray-300">
                                            |
                                        </span>

                                        <a
                                            href="#reviews"
                                            className="underline hover:text-blue-600"
                                        >
                                            {product.reviews} đánh giá
                                        </a>

                                        <span className="text-gray-300">
                                            |
                                        </span>

                                        <span className="text-gray-500">
                                            Đã bán {product.sold}
                                        </span>

                                    </div>


                                    {/* SKU */}

                                    <div className="mt-3 text-xs text-gray-400">
                                        Mã sản phẩm: {product.sku}
                                    </div>


                                    {/* PRICE */}

                                    <div className="mt-6 rounded-xl bg-gray-50 p-5">

                                        <div className="flex flex-wrap items-center gap-3">

                                            <span className="text-3xl font-black text-red-600">
                                                {formatPrice(product.price)}
                                            </span>

                                            <span className="text-sm text-gray-400 line-through">
                                                {formatPrice(product.oldPrice)}
                                            </span>

                                            <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                                                -{product.discount}%
                                            </span>

                                        </div>

                                        <p className="mt-2 text-xs text-gray-500">
                                            Giá đã bao gồm VAT
                                        </p>

                                    </div>


                                    {/* =================================================
                                        PROMOTION
                                    ================================================== */}

                                    <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">

                                        <div className="flex items-center gap-2 font-bold text-orange-600">

                                            <Zap
                                                size={18}
                                                className="fill-orange-500"
                                            />

                                            Ưu đãi dành cho bạn
                                        </div>

                                        <div className="mt-3 space-y-2 text-sm">

                                            <div className="flex gap-2">

                                                <Check
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-green-600"
                                                />

                                                <span>
                                                    Giảm thêm 500.000₫ khi thanh toán online
                                                </span>

                                            </div>

                                            <div className="flex gap-2">

                                                <Check
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-green-600"
                                                />

                                                <span>
                                                    Miễn phí vận chuyển toàn quốc
                                                </span>

                                            </div>

                                            <div className="flex gap-2">

                                                <Check
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-green-600"
                                                />

                                                <span>
                                                    Tặng voucher 200.000₫ cho khách hàng mới
                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        COLOR
                                    ================================================== */}

                                    <div className="mt-6">

                                        <div className="flex items-center gap-2">

                                            <span className="text-sm font-semibold">
                                                Màu sắc:
                                            </span>

                                            <span className="text-sm text-gray-500">
                                                {selectedColor}
                                            </span>

                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">

                                            {product.colors.map((color) => (

                                                <button
                                                    key={color.name}
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            color.name
                                                        )
                                                    }
                                                    className={`
                                                        flex
                                                        items-center
                                                        gap-2
                                                        rounded-lg
                                                        border
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        transition

                                                        ${
                                                            selectedColor ===
                                                            color.name
                                                                ? "border-blue-600 bg-blue-50 text-blue-600"
                                                                : "border-gray-300 hover:border-blue-400"
                                                        }
                                                    `}
                                                >

                                                    <span
                                                        className="h-5 w-5 rounded-full border border-gray-300"
                                                        style={{
                                                            backgroundColor:
                                                                color.value,
                                                        }}
                                                    />

                                                    {color.name}

                                                    {selectedColor ===
                                                        color.name && (
                                                        <Check size={15} />
                                                    )}

                                                </button>

                                            ))}

                                        </div>

                                    </div>


                                    {/* =================================================
                                        STORAGE
                                    ================================================== */}

                                    <div className="mt-6">

                                        <span className="text-sm font-semibold">
                                            Dung lượng:
                                        </span>

                                        <div className="mt-3 flex gap-2">

                                            {product.storage.map(
                                                (storage) => (

                                                    <button
                                                        key={storage}
                                                        onClick={() =>
                                                            setSelectedStorage(
                                                                storage
                                                            )
                                                        }
                                                        className={`
                                                            rounded-lg
                                                            border
                                                            px-5
                                                            py-2.5
                                                            text-sm
                                                            font-medium
                                                            transition

                                                            ${
                                                                selectedStorage ===
                                                                storage
                                                                    ? "border-blue-600 bg-blue-50 text-blue-600"
                                                                    : "border-gray-300 hover:border-blue-400"
                                                            }
                                                        `}
                                                    >
                                                        {storage}
                                                    </button>

                                                )
                                            )}

                                        </div>

                                    </div>


                                    {/* =================================================
                                        QUANTITY
                                    ================================================== */}

                                    <div className="mt-6">

                                        <span className="text-sm font-semibold">
                                            Số lượng:
                                        </span>

                                        <div className="mt-3 flex items-center">

                                            <button
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            quantity - 1
                                                        )
                                                    )
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-l-lg border hover:bg-gray-100"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <div className="flex h-10 w-14 items-center justify-center border-y text-sm font-semibold">
                                                {quantity}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    setQuantity(
                                                        quantity + 1
                                                    )
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-r-lg border hover:bg-gray-100"
                                            >
                                                <Plus size={16} />
                                            </button>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        BUY BUTTONS
                                    ================================================== */}

                                    <div className="mt-7 flex gap-3">

                                        <button
                                            className="
                                                flex
                                                h-12
                                                flex-1
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-lg
                                                border-2
                                                border-blue-600
                                                bg-blue-50
                                                font-bold
                                                text-blue-600
                                                transition
                                                hover:bg-blue-100
                                            "
                                        >

                                            <ShoppingCart size={20} />

                                            Thêm vào giỏ

                                        </button>


                                        <button
                                            className="
                                                flex
                                                h-12
                                                flex-1
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-lg
                                                bg-blue-600
                                                font-bold
                                                text-white
                                                transition
                                                hover:bg-blue-700
                                            "
                                        >

                                            <Zap
                                                size={19}
                                                className="fill-current"
                                            />

                                            Mua ngay

                                        </button>


                                        <button
                                            onClick={() =>
                                                setLiked(!liked)
                                            }
                                            className={`
                                                flex
                                                h-12
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                border
                                                transition

                                                ${
                                                    liked
                                                        ? "border-red-500 bg-red-50 text-red-500"
                                                        : "hover:bg-gray-100"
                                                }
                                            `}
                                        >

                                            <Heart
                                                size={21}
                                                className={
                                                    liked
                                                        ? "fill-red-500"
                                                        : ""
                                                }
                                            />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        SHOP POLICIES
                    ====================================================== */}

                    <section className="mx-auto max-w-7xl px-4 pb-8">

                        <div className="grid overflow-hidden rounded-xl border bg-white md:grid-cols-3">

                            <Policy
                                icon={<Truck size={24} />}
                                title="Miễn phí vận chuyển"
                                description="Cho đơn hàng từ 500.000₫"
                            />

                            <Policy
                                icon={<ShieldCheck size={24} />}
                                title="Bảo hành chính hãng"
                                description="Cam kết sản phẩm chính hãng"
                            />

                            <Policy
                                icon={<RotateCcw size={24} />}
                                title="Đổi trả trong 30 ngày"
                                description="Hỗ trợ đổi trả nhanh chóng"
                            />

                        </div>

                    </section>


                    {/* =====================================================
                        DESCRIPTION & SPECIFICATION
                    ====================================================== */}

                    <section className="mx-auto max-w-7xl px-4 pb-12">

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">


                            {/* DESCRIPTION */}

                            <div className="rounded-xl border bg-white p-6">

                                <h2 className="border-b pb-4 text-xl font-bold">
                                    Mô tả sản phẩm
                                </h2>

                                <div className="mt-6 space-y-5 text-sm leading-7 text-gray-600">

                                    <p>
                                        iPhone 16 Pro Max mang đến thiết kế cao cấp,
                                        hiệu năng mạnh mẽ và trải nghiệm sử dụng
                                        mượt mà trong mọi tác vụ.
                                    </p>

                                    <p>
                                        Sản phẩm được trang bị hệ thống camera
                                        chuyên nghiệp, màn hình lớn với chất lượng
                                        hiển thị sắc nét cùng thời lượng pin được
                                        tối ưu.
                                    </p>

                                    <p>
                                        Đây là lựa chọn phù hợp cho người dùng cần
                                        một thiết bị cao cấp phục vụ công việc,
                                        giải trí, chụp ảnh và chơi game.
                                    </p>


                                    {/* IMAGE */}

                                    <div className="overflow-hidden rounded-xl bg-gray-100">

                                        <img
                                            src={product.images[1]}
                                            alt="Product detail"
                                            className="w-full object-cover"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* SPECIFICATION */}

                            <div className="h-fit rounded-xl border bg-white p-6">

                                <h2 className="border-b pb-4 text-xl font-bold">
                                    Thông số kỹ thuật
                                </h2>

                                <div className="divide-y">

                                    <Spec
                                        label="Màn hình"
                                        value="6.9 inch"
                                    />

                                    <Spec
                                        label="Chip"
                                        value="Apple A18 Pro"
                                    />

                                    <Spec
                                        label="RAM"
                                        value="8GB"
                                    />

                                    <Spec
                                        label="Bộ nhớ"
                                        value={selectedStorage}
                                    />

                                    <Spec
                                        label="Camera"
                                        value="48MP + 48MP + 12MP"
                                    />

                                    <Spec
                                        label="Pin"
                                        value="4685 mAh"
                                    />

                                    <Spec
                                        label="Hệ điều hành"
                                        value="iOS"
                                    />

                                    <Spec
                                        label="SIM"
                                        value="Nano SIM + eSIM"
                                    />

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        REVIEWS
                    ====================================================== */}

                    <section
                        id="reviews"
                        className="border-y bg-white py-12"
                    >

                        <div className="mx-auto max-w-7xl px-4">

                            <h2 className="text-2xl font-bold">
                                Đánh giá sản phẩm
                            </h2>


                            <div className="mt-7 grid gap-8 md:grid-cols-[240px_1fr]">


                                {/* RATING */}

                                <div className="rounded-xl bg-gray-50 p-6 text-center">

                                    <div className="text-5xl font-black">
                                        {product.rating}
                                    </div>

                                    <div className="mt-2 flex justify-center">

                                        {Array.from({
                                            length: 5,
                                        }).map((_, index) => (

                                            <Star
                                                key={index}
                                                size={18}
                                                className="fill-yellow-400 text-yellow-400"
                                            />

                                        ))}

                                    </div>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {product.reviews} đánh giá
                                    </p>

                                </div>


                                {/* REVIEWS */}

                                <div className="divide-y">

                                    <Review
                                        name="Nguyễn Văn A"
                                        date="02/10/2026"
                                        content="Sản phẩm rất đẹp, đóng gói kỹ và giao hàng nhanh. Máy dùng cực kỳ mượt."
                                    />

                                    <Review
                                        name="Trần Minh"
                                        date="28/09/2026"
                                        content="Nhân viên tư vấn nhiệt tình, sản phẩm đúng mô tả."
                                    />

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        RELATED PRODUCTS
                    ====================================================== */}

                    <section className="bg-gray-50 py-12">

                        <div className="mx-auto max-w-7xl px-4">

                            <div className="flex items-center justify-between">

                                <h2 className="text-2xl font-bold">
                                    Sản phẩm liên quan
                                </h2>

                                <a
                                    href="/products"
                                    className="text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    Xem tất cả
                                </a>

                            </div>


                            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

                                <RelatedProduct
                                    image={product.images[0]}
                                    name="iPhone 16 Pro 256GB"
                                    price="26.990.000₫"
                                />

                                <RelatedProduct
                                    image={product.images[1]}
                                    name="Samsung Galaxy S25 Ultra"
                                    price="27.990.000₫"
                                />

                                <RelatedProduct
                                    image={product.images[2]}
                                    name="Google Pixel 9 Pro"
                                    price="22.990.000₫"
                                />

                                <RelatedProduct
                                    image={product.images[3]}
                                    name="iPhone 15 Pro Max"
                                    price="24.990.000₫"
                                />

                            </div>

                        </div>

                    </section>

                </main>
            </PublicLayout>
        </>
    );
}


/* =========================================================
   POLICY
========================================================= */

function Policy({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {

    return (
        <div className="flex items-center gap-4 border-b p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                {icon}
            </div>

            <div>

                <p className="text-sm font-bold">
                    {title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    {description}
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   SPEC
========================================================= */

function Spec({
    label,
    value,
}: {
    label: string;
    value: string;
}) {

    return (
        <div className="flex justify-between gap-4 py-3 text-sm">

            <span className="text-gray-500">
                {label}
            </span>

            <span className="text-right font-medium text-gray-900">
                {value}
            </span>

        </div>
    );
}


/* =========================================================
   REVIEW
========================================================= */

function Review({
    name,
    date,
    content,
}: {
    name: string;
    date: string;
    content: string;
}) {

    return (
        <div className="py-5">

            <div className="flex items-center justify-between">

                <div>

                    <p className="font-semibold">
                        {name}
                    </p>

                    <div className="mt-1 flex">

                        {Array.from({
                            length: 5,
                        }).map((_, index) => (

                            <Star
                                key={index}
                                size={14}
                                className="fill-yellow-400 text-yellow-400"
                            />

                        ))}

                    </div>

                </div>

                <span className="text-xs text-gray-400">
                    {date}
                </span>

            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
                {content}
            </p>

        </div>
    );
}


/* =========================================================
   RELATED PRODUCT
========================================================= */

function RelatedProduct({
    image,
    name,
    price,
}: {
    image: string;
    name: string;
    price: string;
}) {

    return (
        <a
            href="#"
            className="group overflow-hidden rounded-xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
        >

            <div className="aspect-square overflow-hidden bg-gray-100">

                <img
                    src={image}
                    alt={name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

            </div>

            <div className="p-4">

                <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold group-hover:text-blue-600">
                    {name}
                </h3>

                <div className="mt-3 flex items-center justify-between">

                    <span className="font-bold text-red-600">
                        {price}
                    </span>

                    <ShoppingCart
                        size={18}
                        className="text-gray-400"
                    />

                </div>

            </div>

        </a>
    );
}

