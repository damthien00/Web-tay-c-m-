import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/orders/:id
export async function GET(
    _request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { message: "Vui lòng đăng nhập" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
            
            include: {
                items: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { message: "Không tìm thấy đơn hàng" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Lấy chi tiết đơn hàng thành công",
            data: order,
        });
    } catch (error) {
        console.error("GET /api/orders/[id]:", error);

        return NextResponse.json(
            { message: "Không thể lấy chi tiết đơn hàng" },
            { status: 500 }
        );
    }
}

// PATCH /api/orders/:id
// Người dùng chỉ được hủy đơn hàng đang chờ xác nhận.
export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { message: "Vui lòng đăng nhập" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        if (body.status !== "CANCELLED") {
            return NextResponse.json(
                {
                    message:
                        "Bạn chỉ được phép hủy đơn hàng qua API này",
                },
                { status: 400 }
            );
        }

        // Chỉ hủy đơn của chính người dùng đang đăng nhập.
        const result = await prisma.order.updateMany({
            where: {
                id,
                userId: session.user.id,
                status: "PENDING",
            },
            data: {
                status: "CANCELLED",
            },
        });

        if (result.count === 0) {
            return NextResponse.json(
                {
                    message:
                        "Đơn hàng không tồn tại hoặc không thể hủy",
                },
                { status: 400 }
            );
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                items: true,
            },
        });

        return NextResponse.json({
            message: "Hủy đơn hàng thành công",
            data: order,
        });
    } catch (error) {
        console.error("PATCH /api/orders/[id]:", error);

        return NextResponse.json(
            { message: "Không thể hủy đơn hàng" },
            { status: 500 }
        );
    }
}