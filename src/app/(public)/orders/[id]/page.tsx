
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    CheckCircle2,
    Package,
    Truck,
    Clock,
    MapPin,
    Phone,
    User,
    ArrowLeft,
    ShoppingBag,
    Copy,
    Headphones,
    CalendarDays,
    CreditCard,
    Loader2,
    XCircle,
} from "lucide-react";

type OrderItem = {
    productId: string;
    name?: string;
    title?: string;
    image?: string;
    price?: number;
    quantity: number;
};

type ShippingAddress = {
    address?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    province?: string;
};

type Order = {
    id?: string;
    _id?: string;
    orderCode?: string;
    status: string;
    paymentMethod?: string;
    paymentStatus?: string;
    receiverName: string;
    receiverPhone: string;
    shippingAddress: ShippingAddress | string;
    items: OrderItem[];
    subtotal?: number;
    shippingFee?: number;
    discount?: number;
    totalAmount?: number;
    total?: number;
    createdAt?: string;
    note?: string;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

const formatDate = (value?: string) => {
    if (!value) return "Đang cập nhật";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Đang cập nhật";

    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const statusMap: Record<
    string,
    { label: string; color: string }
> = {
    PENDING: {
        label: "Chờ xác nhận",
        color: "bg-amber-100 text-amber-700",
    },
    CONFIRMED: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-700",
    },
    PROCESSING: {
        label: "Đang xử lý",
        color: "bg-indigo-100 text-indigo-700",
    },
    SHIPPING: {
        label: "Đang giao hàng",
        color: "bg-purple-100 text-purple-700",
    },
    SHIPPED: {
        label: "Đang giao hàng",
        color: "bg-purple-100 text-purple-700",
    },
    DELIVERED: {
        label: "Đã giao hàng",
        color: "bg-green-100 text-green-700",
    },
    COMPLETED: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-700",
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-700",
    },
};

function getAddress(address: ShippingAddress | string) {
    if (typeof address === "string") return address;

    return [
        address.address || address.street,
        address.ward,
        address.district,
        address.city || address.province,
    ]
        .filter(Boolean)
        .join(", ");
}

export default function OrderDetailPage() {
    const params = useParams<{ id: string }>();
    const orderId = params.id;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const controller = new AbortController();

        async function fetchOrder() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/orders/${encodeURIComponent(orderId)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                            result.error ||
                            "Không thể tải thông tin đơn hàng."
                    );
                }

                // Hỗ trợ API trả về order hoặc { data: order }
                const data = result.data ?? result.order ?? result;

                if (!data || !Array.isArray(data.items)) {
                    throw new Error(
                        "Dữ liệu đơn hàng không đúng định dạng."
                    );
                }

                setOrder(data as Order);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Đã xảy ra lỗi khi tải đơn hàng."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchOrder();

        return () => controller.abort();
    }, [orderId]);

    const copyOrderCode = async () => {
        const code = order?.orderCode || order?.id || order?._id;

        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setError("Không thể sao chép mã đơn hàng.");
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                    <p className="mt-4 text-sm text-gray-500">
                        Đang tải thông tin đơn hàng...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <XCircle className="mx-auto h-14 w-14 text-red-500" />

                    <h1 className="mt-4 text-xl font-bold text-gray-900">
                        Không tìm thấy đơn hàng
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}
                    </p>

                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        <ArrowLeft size={18} />
                        Về trang chủ
                    </Link>
                </div>
            </main>
        );
    }

    const orderCode =
        order.orderCode || order.id || order._id || orderId;

    const currentStatus = statusMap[order.status?.toUpperCase()] ?? {
        label: order.status || "Đang cập nhật",
        color: "bg-gray-100 text-gray-700",
    };

    const subtotal =
        order.subtotal ??
        order.items.reduce(
            (sum, item) =>
                sum + (Number(item.price) || 0) * item.quantity,
            0
        );

    const shippingFee = order.shippingFee ?? 0;
    const discount = order.discount ?? 0;
    const total =
        order.totalAmount ??
        order.total ??
        Math.max(0, subtotal + shippingFee - discount);

    const address = getAddress(order.shippingAddress);

    const steps = [
        {
            label: "Đặt hàng thành công",
            description: "Đơn hàng đã được ghi nhận",
            icon: CheckCircle2,
        },
        {
            label: "Xác nhận đơn hàng",
            description: "Shop kiểm tra thông tin đơn hàng",
            icon: Package,
        },
        {
            label: "Đang giao hàng",
            description: "Đơn hàng đang trên đường đến bạn",
            icon: Truck,
        },
        {
            label: "Giao hàng thành công",
            description: "Chúc bạn có trải nghiệm mua sắm tốt",
            icon: CheckCircle2,
        },
    ];

    const normalizedStatus = order.status?.toUpperCase();

    const statusStep: Record<string, number> = {
        PENDING: 0,
        CONFIRMED: 1,
        PROCESSING: 1,
        SHIPPING: 2,
        SHIPPED: 2,
        DELIVERED: 3,
        COMPLETED: 3,
    };

    const currentStep = statusStep[normalizedStatus] ?? 0;
    const isCancelled = normalizedStatus === "CANCELLED";

    return (
        <main className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="text-2xl font-extrabold tracking-tight text-blue-700"
                    >
                        TAYCAMGIARE
                    </Link>

                    <Link
                        href="/help"
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
                    >
                        <Headphones size={18} />
                        <span className="hidden sm:inline">
                            Hỗ trợ khách hàng
                        </span>
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Success banner */}
                <section className="rounded-2xl border border-green-100 bg-white p-6 text-center shadow-sm sm:p-9">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle2
                            size={48}
                            className="text-green-500"
                            strokeWidth={1.8}
                        />
                    </div>

                    <h1 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        Đặt hàng thành công!
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                        Cảm ơn bạn đã mua sắm tại TAYCAMGIARE.
                        Chúng tôi sẽ xử lý đơn hàng và cập nhật
                        trạng thái sớm nhất có thể.
                    </p>

                    <div className="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
                        <span className="text-sm text-gray-500">
                            Mã đơn hàng:
                        </span>

                        <span className="break-all font-bold text-gray-900">
                            {orderCode}
                        </span>

                        <button
                            type="button"
                            onClick={copyOrderCode}
                            title="Sao chép mã đơn hàng"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-blue-600"
                        >
                            <Copy size={16} />
                        </button>

                        {copied && (
                            <span className="text-xs font-medium text-green-600">
                                Đã sao chép
                            </span>
                        )}
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                        Ngày đặt hàng: {formatDate(order.createdAt)}
                    </p>
                </section>

                {/* Status */}
                <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Trạng thái đơn hàng
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Theo dõi tiến trình xử lý đơn hàng của bạn
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-4 py-2 text-sm font-semibold ${currentStatus.color}`}
                        >
                            {currentStatus.label}
                        </span>
                    </div>

                    {isCancelled ? (
                        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                            Đơn hàng này đã bị hủy. Vui lòng liên hệ
                            TAYCAMGIARE nếu bạn cần hỗ trợ.
                        </div>
                    ) : (
                        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const active = index <= currentStep;

                                return (
                                    <div
                                        key={step.label}
                                        className="relative text-center"
                                    >
                                        <div
                                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                                                active
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-400"
                                            }`}
                                        >
                                            <Icon size={22} />
                                        </div>

                                        <p
                                            className={`mt-3 text-sm font-bold ${
                                                active
                                                    ? "text-gray-900"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {step.label}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-400">
                                            {step.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Order information */}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Customer information */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <MapPin size={21} />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900">
                                Thông tin giao hàng
                            </h2>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div className="flex gap-3">
                                <User
                                    size={18}
                                    className="mt-0.5 shrink-0 text-gray-400"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Người nhận
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {order.receiverName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Phone
                                    size={18}
                                    className="mt-0.5 shrink-0 text-gray-400"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Số điện thoại
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {order.receiverPhone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <MapPin
                                    size={18}
                                    className="mt-0.5 shrink-0 text-gray-400"
                                />

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Địa chỉ nhận hàng
                                    </p>
                                    <p className="mt-1 break-words font-medium leading-6 text-gray-900">
                                        {address || "Chưa có địa chỉ"}
                                    </p>
                                </div>
                            </div>

                            {order.note && (
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">
                                        Ghi chú đơn hàng
                                    </p>
                                    <p className="mt-1 text-sm text-gray-800">
                                        {order.note}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Payment information */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <CreditCard size={21} />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900">
                                Thông tin thanh toán
                            </h2>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm text-gray-500">
                                    Phương thức
                                </span>
                                <span className="text-right text-sm font-semibold text-gray-900">
                                    {order.paymentMethod || "COD"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm text-gray-500">
                                    Thanh toán
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        order.paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                    {order.paymentStatus === "PAID"
                                        ? "Đã thanh toán"
                                        : order.paymentMethod === "COD"
                                          ? "Thanh toán khi nhận hàng"
                                          : "Chưa thanh toán"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm text-gray-500">
                                    Mã đơn hàng
                                </span>
                                <span className="max-w-[60%] break-all text-right text-sm font-medium text-gray-900">
                                    {orderCode}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm text-gray-500">
                                    Thời gian đặt
                                </span>
                                <span className="text-right text-sm font-medium text-gray-900">
                                    {formatDate(order.createdAt)}
                                </span>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-4">
                                <div className="flex items-start gap-3">
                                    <Clock
                                        size={19}
                                        className="mt-0.5 shrink-0 text-blue-600"
                                    />
                                    <p className="text-sm leading-6 text-blue-800">
                                        TAYCAMGIARE sẽ liên hệ với bạn để
                                        xác nhận thông tin trước khi
                                        giao hàng nếu cần thiết.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Products */}
                <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={22} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">
                            Sản phẩm đã đặt
                        </h2>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                            )}{" "}
                            sản phẩm
                        </span>
                    </div>

                    <div className="mt-6 divide-y divide-gray-100">
                        {order.items.map((item, index) => {
                            const name =
                                item.name ||
                                item.title ||
                                "Sản phẩm";

                            const price = Number(item.price) || 0;

                            return (
                                <div
                                    key={`${item.productId}-${index}`}
                                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                                >
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-24 sm:w-24">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={name}
                                                fill
                                                unoptimized
                                                sizes="96px"
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-300">
                                                <Package size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="line-clamp-2 font-semibold text-gray-900">
                                            {name}
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-500">
                                            Số lượng: {item.quantity}
                                        </p>

                                        <p className="mt-2 text-sm font-bold text-blue-700 sm:hidden">
                                            {formatCurrency(price * item.quantity)}
                                        </p>
                                    </div>

                                    <div className="hidden shrink-0 text-right sm:block">
                                        <p className="font-bold text-gray-900">
                                            {formatCurrency(price * item.quantity)}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-400">
                                            {formatCurrency(price)} / sản phẩm
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total */}
                    <div className="mt-7 border-t border-dashed border-gray-200 pt-5">
                        <div className="ml-auto max-w-md space-y-3">
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Tiền hàng
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">
                                    Phí vận chuyển
                                </span>
                                <span className="font-medium text-gray-900">
                                    {shippingFee === 0
                                        ? "Miễn phí"
                                        : formatCurrency(shippingFee)}
                                </span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">
                                        Giảm giá
                                    </span>
                                    <span className="font-medium text-green-600">
                                        -{formatCurrency(discount)}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                                <span className="font-bold text-gray-900">
                                    Tổng thanh toán
                                </span>
                                <span className="text-xl font-extrabold text-red-600 sm:text-2xl">
                                    {formatCurrency(total)}
                                </span>
                            </div>

                            <p className="text-right text-xs text-gray-400">
                                Đã bao gồm các khoản phí được hiển thị ở trên
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bottom actions */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Về trang chủ
                    </Link>

                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <ShoppingBag size={18} />
                        Tiếp tục mua sắm
                    </Link>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Cần hỗ trợ đơn hàng? Hãy liên hệ bộ phận chăm sóc khách hàng TAYCAMGIARE.
                </p>
            </div>
        </main>
    );
}
