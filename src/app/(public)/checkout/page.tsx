"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Clock,
    CreditCard,
    Gift,
    MapPin,
    Package,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Truck,
    Wallet,
    Banknote,
    UserRound,
    Phone,
    Mail,
    Store,
    LockKeyhole,
    CircleCheck,
    Info,
    X,
} from "lucide-react";
import { useCartStore } from "@/stores/cart";
import PublicLayout from "../public-layout";

import { useOrderStore } from "@/stores/order";
import { useRouter } from "next/navigation";

export type CartProduct = {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant?: string;

    // Các trường bổ sung để tương thích với trang /cart
    slug?: string;
    category?: string;
    originalPrice?: number;
    stock?: number;
    selected?: boolean;
};

type CartItem = CartProduct;

type ShippingMethod = "standard" | "express";
type PaymentMethod = "cod" | "bank" | "ewallet";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);

export default function CheckoutPage() {
    // Đọc dữ liệu và action từ Zustand
    const cart = useCartStore((state) => state.items);
    const updateCartQuantity = useCartStore(
        (state) => state.updateQuantity
    );
    const removeCartProduct = useCartStore(
        (state) => state.removeFromCart
    );

    const [loaded, setLoaded] = useState(false);

    const [shippingMethod, setShippingMethod] =
        useState<ShippingMethod>("standard");

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("cod");

    const [promoInput, setPromoInput] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [promoMessage, setPromoMessage] = useState("");
    const [promoError, setPromoError] = useState(false);

    const [agreed, setAgreed] = useState(true);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        province: "",
        district: "",
        ward: "",
        address: "",
        note: "",
    });

    // Hydrate Zustand sau khi component được mount để tránh
    // lỗi không đồng nhất dữ liệu giữa server và trình duyệt.
    useEffect(() => {
        let mounted = true;

        const hydrateCart = async () => {
            try {
                await useCartStore.persist.rehydrate();
            } catch (error) {
                console.error("Không thể tải giỏ hàng:", error);
            } finally {
                if (mounted) {
                    setLoaded(true);
                }
            }
        };

        void hydrateCart();

        return () => {
            mounted = false;
        };
    }, []);

    const subtotal = useMemo(
        () =>
            cart.reduce(
                (sum, item) =>
                    sum + Number(item.price) * item.quantity,
                0
            ),
        [cart]
    );
    const shippingFee = useMemo(() => {
        if (subtotal === 0 || subtotal >= 1_000_000) return 0;

        return shippingMethod === "express" ? 45_000 : 25_000;
    }, [subtotal, shippingMethod]);

    const discount = useMemo(() => {
        if (promoCode !== "TAYCAMGIARE10") return 0;

        return Math.min(Math.round(subtotal * 0.1), 200_000);
    }, [promoCode, subtotal]);

    const totalQuantity = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const actualDiscount =
        promoCode === "FREESHIP" ? 0 : discount;

    const actualShippingFee =
        promoCode === "FREESHIP" ? 0 : shippingFee;

    const finalTotal = Math.max(
        0,
        subtotal + actualShippingFee - actualDiscount
    );

    const updateField = (
        field: keyof typeof form,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Cập nhật số lượng trực tiếp trong Zustand
        const changeQuantity = (
        id: CartItem["id"],
        quantity: number
    ) => {
        if (quantity < 1) return;

        updateCartQuantity(id, quantity);
    };

    const removeItem = (id: CartItem["id"]) => {
        removeCartProduct(id);
    };

    const applyPromo = () => {
        const code = promoInput.trim().toUpperCase();

        setPromoError(false);

        if (!code) {
            setPromoCode("");
            setPromoMessage("Vui lòng nhập mã giảm giá.");
            setPromoError(true);
            return;
        }

        if (code === "TAYCAMGIARE10") {
            setPromoCode(code);
            setPromoInput(code);
            setPromoMessage(
                "Áp dụng thành công: giảm 10%, tối đa 200.000đ."
            );
            return;
        }

        if (code === "FREESHIP") {
            setPromoCode(code);
            setPromoInput(code);
            setPromoMessage(
                "Áp dụng thành công: miễn phí vận chuyển."
            );
            return;
        }

        setPromoCode("");
        setPromoMessage("Mã giảm giá không hợp lệ.");
        setPromoError(true);
    };
    const router = useRouter();

    const createOrder = useOrderStore(
        (state) => state.createOrder
    );

    const clearCart = useCartStore(
        (state) => state.clearCart
    );
    
const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
) => {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống.");
        return;
    }

    if (!agreed) {
        alert("Vui lòng đồng ý với điều khoản mua hàng.");
        return;
    }

    if (
        !/^(0|\+84)[0-9]{9,10}$/.test(
            form.phone.replace(/\s/g, "")
        )
    ) {
        alert("Vui lòng nhập số điện thoại hợp lệ.");
        return;
    }

    if (
        !form.fullName.trim() ||
        !form.province.trim() ||
        !form.district.trim() ||
        !form.ward.trim() ||
        !form.address.trim()
    ) {
        alert("Vui lòng nhập đầy đủ thông tin nhận hàng.");
        return;
    }

    setLoading(true);

    try {
        // Ghép địa chỉ đầy đủ
        const shippingAddress = [
            form.address.trim(),
            form.ward.trim(),
            form.district.trim(),
            form.province.trim(),
        ].join(", ");

        // Chuyển phương thức thanh toán sang giá trị API
        const apiPaymentMethod =
            paymentMethod === "cod"
                ? "COD"
                : "BANK_TRANSFER";

        // Gọi API tạo đơn hàng thông qua Zustand
        const order = await createOrder({
            items: cart.map((item) => ({
                productId: String(item.id),
                quantity: item.quantity,
            })),

            receiverName: form.fullName.trim(),
            receiverPhone: form.phone.trim(),
            receiverEmail: form.email.trim() || undefined,
            shippingAddress,
            note: form.note.trim() || undefined,

            shippingFee: actualShippingFee,
            discount: actualDiscount,
            paymentMethod: apiPaymentMethod,
        });

        if (!order) {
            const errorMessage =
                useOrderStore.getState().error;

            alert(errorMessage || "Đặt hàng thất bại.");
            return;
        }

        // Xóa các sản phẩm đã đặt khỏi giỏ hàng
        cart.forEach((item) => {
            removeCartProduct(item.id);
        });

        alert(
            `Đặt hàng thành công!\nMã đơn hàng: ${order.orderCode}`
        );

        // Chuyển sang trang chi tiết đơn hàng
        router.push(`/orders/${order.id}`);
    } catch (error) {
        console.error("Lỗi đặt hàng:", error);

        alert(
            error instanceof Error
                ? error.message
                : "Đã xảy ra lỗi khi đặt hàng."
        );
    } finally {
        setLoading(false);
    }
};


    // Phần JSX bên dưới giữ nguyên như file hiện tại.

    if (!loaded) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-4 text-sm text-slate-500">
                        Đang tải giỏ hàng...
                    </p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <ShoppingBag size={36} />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-slate-900">
                        Giỏ hàng đang trống
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        Bạn chưa có sản phẩm nào để thanh toán.
                        Hãy quay lại cửa hàng và chọn sản phẩm yêu thích nhé.
                    </p>

                    <Link
                        href="/products"
                        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Tiếp tục mua sắm
                        <ArrowRight size={18} />
                    </Link>

                    <Link
                        href="/cart"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={16} />
                        Quay lại giỏ hàng
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <PublicLayout>
        <main className="min-h-screen bg-slate-50 text-slate-800">
            {/* Breadcrumb */}
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <Link href="/" className="hover:text-blue-600">
                        Trang chủ
                    </Link>
                    <span>/</span>
                    <Link href="/cart" className="hover:text-blue-600">
                        Giỏ hàng
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-blue-700">
                        Thanh toán
                    </span>
                </nav>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <CreditCard size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Thanh toán đơn hàng
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Hoàn tất thông tin để nhận hàng nhanh chóng.
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 border-b-2 border-emerald-500 pb-3 text-xs font-semibold text-emerald-600 sm:text-sm">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                                <Check size={15} />
                            </span>
                            Giỏ hàng
                        </div>

                        <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-3 text-xs font-semibold text-blue-700 sm:text-sm">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                                2
                            </span>
                            Thanh toán
                        </div>

                        <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-3 text-xs font-medium text-slate-400 sm:text-sm">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200">
                                3
                            </span>
                            Hoàn tất
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]"
                >
                    {/* Left column */}
                    <div className="space-y-6">
                        {/* Customer information */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <UserRound size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Thông tin nhận hàng
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Nhập thông tin để nhân viên giao hàng liên hệ.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="fullName" className="mb-2 block text-sm font-semibold">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        autoComplete="name"
                                        required
                                        maxLength={100}
                                        value={form.fullName}
                                        onChange={(e) => updateField("fullName", e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                        <Phone size={15} className="text-slate-400" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        maxLength={15}
                                        value={form.phone}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        placeholder="0912 345 678"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                        <Mail size={15} className="text-slate-400" />
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Address */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <MapPin size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Địa chỉ giao hàng
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Điền địa chỉ cụ thể để giao hàng chính xác.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="province" className="mb-2 block text-sm font-semibold">
                                        Tỉnh / Thành phố <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="province"
                                        name="province"
                                        autoComplete="address-level1"
                                        required
                                        value={form.province}
                                        onChange={(e) => updateField("province", e.target.value)}
                                        placeholder="Ví dụ: Hà Nội"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="district" className="mb-2 block text-sm font-semibold">
                                        Quận / Huyện <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="district"
                                        name="district"
                                        required
                                        value={form.district}
                                        onChange={(e) => updateField("district", e.target.value)}
                                        placeholder="Quận hoặc huyện"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="ward" className="mb-2 block text-sm font-semibold">
                                        Phường / Xã <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="ward"
                                        name="ward"
                                        required
                                        value={form.ward}
                                        onChange={(e) => updateField("ward", e.target.value)}
                                        placeholder="Phường hoặc xã"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="mb-2 block text-sm font-semibold">
                                        Địa chỉ chi tiết <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="address"
                                        name="address"
                                        autoComplete="street-address"
                                        required
                                        value={form.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        placeholder="Số nhà, tên đường, tòa nhà..."
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="note" className="mb-2 block text-sm font-semibold">
                                        Ghi chú giao hàng
                                        <span className="ml-2 font-normal text-slate-400">
                                            (Không bắt buộc)
                                        </span>
                                    </label>
                                    <textarea
                                        id="note"
                                        name="note"
                                        rows={3}
                                        maxLength={500}
                                        value={form.note}
                                        onChange={(e) => updateField("note", e.target.value)}
                                        placeholder="Ví dụ: Gọi trước khi giao, giao sau 17h..."
                                        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping method */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Truck size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Phương thức vận chuyển
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Chọn hình thức giao hàng phù hợp.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                    shippingMethod === "standard"
                                        ? "border-blue-500 bg-blue-50/60"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}>
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="standard"
                                        checked={shippingMethod === "standard"}
                                        onChange={() => setShippingMethod("standard")}
                                        className="h-4 w-4 accent-blue-600"
                                    />

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                        <Package size={22} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-slate-900">
                                                Giao hàng tiêu chuẩn
                                            </p>
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                                Tiết kiệm
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Dự kiến 3–5 ngày làm việc
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">
                                            {subtotal >= 1000000 || subtotal === 0
                                                ? "Miễn phí"
                                                : "25.000đ"}
                                        </p>
                                    </div>
                                </label>

                                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                    shippingMethod === "express"
                                        ? "border-blue-500 bg-blue-50/60"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}>
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="express"
                                        checked={shippingMethod === "express"}
                                        onChange={() => setShippingMethod("express")}
                                        className="h-4 w-4 accent-blue-600"
                                    />

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                        <Truck size={22} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-900">
                                            Giao hàng nhanh ( Chỉ áp dụng tại Hà Nội)
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Dự kiến 1–2 ngày làm việc
                                        </p>
                                    </div>

                                    <p className="text-right font-bold text-slate-900">
                                        {subtotal >= 100000000 || subtotal === 0
                                            ? "Miễn phí"
                                            : "50.000đ"}
                                    </p>
                                </label>
                            </div>

                            <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                                <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                                Đơn hàng từ 1.000.000đ được miễn phí vận chuyển
                                theo chính sách mẫu của cửa hàng.
                            </div>
                        </section>

                        {/* Payment method */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Wallet size={22} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Phương thức thanh toán
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Chọn cách thanh toán đơn hàng.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                    paymentMethod === "cod"
                                        ? "border-blue-500 bg-blue-50/60"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                        className="h-4 w-4 accent-blue-600"
                                    />

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                        <Banknote size={24} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">
                                            Thanh toán khi nhận hàng (COD)
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Kiểm tra thông tin đơn và thanh toán cho đơn vị giao hàng.
                                        </p>
                                    </div>

                                    {paymentMethod === "cod" && (
                                        <CircleCheck size={20} className="shrink-0 text-blue-600" />
                                    )}
                                </label>

                                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                    paymentMethod === "bank"
                                        ? "border-blue-500 bg-blue-50/60"
                                        : "border-slate-200 hover:border-slate-300"
                                }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank"
                                        checked={paymentMethod === "bank"}
                                        onChange={() => setPaymentMethod("bank")}
                                        className="h-4 w-4 accent-blue-600"
                                    />

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                        <CreditCard size={23} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">
                                            Chuyển khoản ngân hàng
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Chuyển khoản theo hướng dẫn sau khi xác nhận đơn.
                                        </p>
                                    </div>

                                    {paymentMethod === "bank" && (
                                        <CircleCheck size={20} className="shrink-0 text-blue-600" />
                                    )}
                                </label>
                            </div>

                            {paymentMethod !== "cod" && (
                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                                    Đây là lựa chọn thanh toán mẫu. Cần tích hợp
                                    ngân hàng hoặc cổng thanh toán thực tế trước khi
                                    sử dụng trong môi trường bán hàng.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right column */}
                    <aside className="space-y-6 lg:sticky lg:top-24">
                        {/* Order items */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Đơn hàng của bạn
                                </h2>

                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                    {totalQuantity} sản phẩm
                                </span>
                            </div>

                            <div className="mt-5 space-y-5">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3"
                                    >
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="80px"
                                                    unoptimized
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-300">
                                                    <ShoppingBag size={27} />
                                                </div>
                                            )}

                                            <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-800 px-1 text-xs font-bold text-white">
                                                {item.quantity}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                                                {item.name}
                                            </p>

                                            {item.variant && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Phân loại: {item.variant}
                                                </p>
                                            )}

                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <span className="text-xs text-slate-500">
                                                    {formatPrice(item.price)}
                                                </span>

                                                <span className="text-sm font-bold text-blue-700">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() =>
                                                        changeQuantity(
                                                            String(item.id),
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                    aria-label="Giảm số lượng"
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-5 text-center text-xs font-semibold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            String(item.id),
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
                                                    aria-label="Tăng số lượng"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(String(item.id))}
                                                    className="ml-auto flex items-center gap-1 text-xs text-slate-400 transition hover:text-red-500"
                                                >
                                                    <X size={14} />
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/cart"
                                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                            >
                                <ArrowLeft size={16} />
                                Chỉnh sửa giỏ hàng
                            </Link>
                        </section>

                        {/* Promo code */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                    <Gift size={22} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Mã giảm giá
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Nhập mã để nhận ưu đãi.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <input
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            applyPromo();
                                        }
                                    }}
                                    placeholder="Nhập mã giảm giá"
                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                />

                                <button
                                    type="button"
                                    onClick={applyPromo}
                                    className="rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
                                >
                                    Áp dụng
                                </button>
                            </div>

                            {promoMessage && (
                                <p className={`mt-3 text-xs leading-5 ${
                                    promoError ? "text-red-600" : "text-emerald-600"
                                }`}>
                                    {promoMessage}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPromoInput("TAYCAMGIARE10");
                                        setPromoCode("TAYCAMGIARE10");
                                        setPromoMessage("Áp dụng thành công: giảm 10%, tối đa 200.000đ.");
                                        setPromoError(false);
                                    }}
                                    className="flex items-center gap-1 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                                >
                                    <Tag size={13} />
                                    TAYCAMGIARE10
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPromoInput("FREESHIP");
                                        setPromoCode("FREESHIP");
                                        setPromoMessage("Áp dụng thành công: miễn phí vận chuyển.");
                                        setPromoError(false);
                                    }}
                                    className="flex items-center gap-1 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                    <Truck size={13} />
                                    FREESHIP
                                </button>
                            </div>

                            {promoCode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPromoCode("");
                                        setPromoInput("");
                                        setPromoMessage("");
                                        setPromoError(false);
                                    }}
                                    className="mt-3 text-xs font-medium text-red-500 hover:text-red-700"
                                >
                                    Bỏ mã giảm giá
                                </button>
                            )}
                        </section>

                        {/* Order summary */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900">
                                Chi tiết thanh toán
                            </h2>

                            <div className="mt-5 space-y-4 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">
                                        Tiền hàng ({totalQuantity} sản phẩm)
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">
                                        Phí vận chuyển
                                    </span>
                                    <span className={`font-semibold ${
                                        actualShippingFee === 0
                                            ? "text-emerald-600"
                                            : "text-slate-900"
                                    }`}>
                                        {actualShippingFee === 0
                                            ? "Miễn phí"
                                            : formatPrice(actualShippingFee)}
                                    </span>
                                </div>

                                {actualDiscount > 0 && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-slate-500">
                                            Giảm giá
                                        </span>
                                        <span className="font-semibold text-emerald-600">
                                            -{formatPrice(actualDiscount)}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-slate-700">
                                            Tổng thanh toán
                                        </span>
                                        <span className="text-xl font-black text-blue-700">
                                            {formatPrice(finalTotal)}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-right text-xs text-slate-400">
                                        Đã bao gồm các khoản phí hiển thị.
                                    </p>
                                </div>
                            </div>

                            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                />

                                <span className="text-xs leading-5 text-slate-600">
                                    Tôi đồng ý với{" "}
                                    <Link
                                        href="/terms"
                                        className="font-semibold text-blue-600 hover:underline"
                                    >
                                        điều khoản mua hàng
                                    </Link>{" "}
                                    và{" "}
                                    <Link
                                        href="/privacy"
                                        className="font-semibold text-blue-600 hover:underline"
                                    >
                                        chính sách bảo mật
                                    </Link>{" "}
                                    của TAYCAMGIARE.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading || cart.length === 0}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Đặt hàng · {formatPrice(finalTotal)}
                                        <ArrowRight size={19} />
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <LockKeyhole size={15} />
                                Thông tin được sử dụng để xử lý đơn hàng.
                            </div>
                        </section>

                        {/* Service assurances */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="shrink-0 text-emerald-600" size={22} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Mua sắm an tâm
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Chính sách bảo hành theo từng sản phẩm.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="shrink-0 text-blue-600" size={22} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Hỗ trợ khách hàng
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Liên hệ cửa hàng khi cần hỗ trợ đơn hàng.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Store className="shrink-0 text-orange-500" size={22} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            TAYCAMGIARE chính hãng
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Trải nghiệm mua sắm công nghệ tiện lợi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </form>

                <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs leading-6 text-slate-400">
                    © {new Date().getFullYear()} TAYCAMGIARE. Công nghệ mới. Giá tốt hơn.
                </footer>
            </div>
        </main>

        </PublicLayout>
    );
}
