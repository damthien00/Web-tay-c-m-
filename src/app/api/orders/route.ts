
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createOrderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string().min(1),
            quantity: z.number().int().min(1).max(100),
        })
    ).min(1),
    receiverPhone: z.string().min(1, "Vui lòng nhập số điện thoại").regex(/^\+?\d{10,15}$/, "Số điện thoại không hợp lệ"),
    receiverName: z.string().min(1, "Vui lòng nhập tên người nhận"),
    shippingAddress: z.string().min(1, "Vui lòng nhập địa chỉ giao hàng"),

    paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
    note: z.string().max(500).optional(),
});

async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return session?.user ?? null;
}

// POST /api/orders
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Vui lòng đăng nhập." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const result = createOrderSchema.safeParse(body);

        if (!result.success) {
            console.error("Validation error:", result.error.flatten());
            return NextResponse.json(
                {
                    message: "Dữ liệu đơn hàng không hợp lệ",
                    errors: result.error.flatten(),
                },
                { status: 400 }
            );
        }

        const data = result.data;


        // Gộp sản phẩm trùng ID để tránh tính tiền nhiều lần.
        const quantities = new Map<string, number>();

        for (const item of data.items) {
            const quantity =
                (quantities.get(item.productId) ?? 0) + item.quantity;

            if (quantity > 100) {
                return NextResponse.json(
                    { message: "Số lượng sản phẩm vượt giới hạn." },
                    { status: 400 }
                );
            }

            quantities.set(item.productId, quantity);
        }

        const productIds = [...quantities.keys()];

        // Lấy giá và thông tin sản phẩm từ database.
        const products = await prisma.products.findMany({
            where: {
                id: { in: productIds },
            },
        });

        if (products.length !== productIds.length) {
            return NextResponse.json(
                { message: "Một hoặc nhiều sản phẩm không tồn tại." },
                { status: 400 }
            );
        }

        const orderItems = [];

        for (const product of products) {
            const quantity = quantities.get(product.id)!;

            // Điều chỉnh tên trường nếu schema Product khác.
            if (product.price == null || Number(product.price) < 0) {
                return NextResponse.json(
                    { message: `Giá sản phẩm ${product.name} không hợp lệ.` },
                    { status: 400 }
                );
            }

            if (
                "stock" in product &&
                typeof product.stock === "number" &&
                product.stock < quantity
            ) {
                return NextResponse.json(
                    {
                        message: `Sản phẩm ${product.name} không đủ tồn kho.`,
                    },
                    { status: 400 }
                );
            }

            const price = Number(product.price);

            orderItems.push({
                productId: product.id,
                name: product.name,
                image: product.image ?? null,
                price,
                quantity,
                subtotal: price * quantity,
            });
        }

        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        // Chính sách phí vận chuyển/giảm giá cần được xác định
        // ở server, không nhận tổng tiền từ frontend.
        const shippingFee = 0;
        const discount = 0;
        const total = subtotal + shippingFee - discount;

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                receiverName: data.receiverName,
                receiverPhone: data.receiverPhone,


                items: orderItems,
                subtotal,
                shippingFee,
                discount,
                total,
                shippingAddress: data.shippingAddress,
                paymentMethod: data.paymentMethod,
                paymentStatus: "UNPAID",
                status: "PENDING",
                note: data.note,
            },
        });

        return NextResponse.json(
            {
                message: "Tạo đơn hàng thành công.",
                data: order,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create order error:", error);

        return NextResponse.json(
            { message: "Không thể tạo đơn hàng." },
            { status: 500 }
        );
    }
}

// GET /api/orders?page=1&limit=10
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Vui lòng đăng nhập." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const page = Math.max(
            1,
            Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(
                1,
                Number.parseInt(searchParams.get("limit") ?? "10", 10) || 10
            )
        );

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),

            prisma.order.count({
                where: { userId: user.id },
            }),
        ]);

        return NextResponse.json({
            message: "Lấy danh sách đơn hàng thành công.",
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get orders error:", error);

        return NextResponse.json(
            { message: "Không thể lấy danh sách đơn hàng." },
            { status: 500 }
        );
    }
}
