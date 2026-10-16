import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Lấy tham số tìm kiếm
    const q = searchParams.get("q")?.trim() || undefined;
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("per_page") || 10);
    const sort = searchParams.get("sort") || "createdAt.desc";

    // Validate phân trang
    const currentPage =
      Number.isInteger(page) && page > 0 ? page : 1;

    const limit =
      Number.isInteger(perPage) && perPage > 0
        ? Math.min(perPage, 100)
        : 10;

    // Chỉ cho phép sắp xếp theo các trường hợp lệ
    const allowedSort = new Set([
      "name",
      "price",
      "oldPrice",
      "rating",
      "sold",
      "createdAt",
      "updatedAt",
    ]);

    const [field, direction] = sort.split(".");

    const orderBy =
      field && allowedSort.has(field)
        ? {
            [field]: direction === "asc" ? "asc" : "desc",
          }
        : { createdAt: "desc" as const };

    // Điều kiện tìm kiếm
    const where = q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {};

    // Lấy danh sách và tổng số sản phẩm
    const [items, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy,
        skip: (currentPage - 1) * limit,
        take: limit,
      }),
      prisma.products.count({ where }),
    ]);

    return NextResponse.json({
      data: {
        items,
        page: currentPage,
        per_page: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      error: null,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        data: null,
        error: "Không thể lấy danh sách sản phẩm",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      price,
      oldPrice,
      image,
      rating = 0,
      sold = 0,
    } = body ?? {};

    // Validate dữ liệu đầu vào
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { data: null, error: "Tên sản phẩm không hợp lệ" },
        { status: 400 }
      );
    }

    if (
      typeof price !== "number" ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      return NextResponse.json(
        { data: null, error: "Giá sản phẩm phải là số nguyên không âm" },
        { status: 400 }
      );
    }

    if (
      oldPrice !== undefined &&
      oldPrice !== null &&
      (
        typeof oldPrice !== "number" ||
        !Number.isSafeInteger(oldPrice) ||
        oldPrice < 0
      )
    ) {
      return NextResponse.json(
        { data: null, error: "Giá cũ không hợp lệ" },
        { status: 400 }
      );
    }

    if (
      typeof image !== "string" ||
      !image.trim() ||
      !URL.canParse(image) ||
      !["http:", "https:"].includes(new URL(image).protocol)
    ) {
      return NextResponse.json(
        { data: null, error: "URL hình ảnh không hợp lệ" },
        { status: 400 }
      );
    }

    if (
      typeof rating !== "number" ||
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      return NextResponse.json(
        { data: null, error: "Rating phải từ 0 đến 5" },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(sold) ||
      typeof sold !== "number" ||
      sold < 0
    ) {
      return NextResponse.json(
        { data: null, error: "Số lượng đã bán không hợp lệ" },
        { status: 400 }
      );
    }

    // Tạo sản phẩm
    const product = await prisma.products.create({
      data: {
        name: name.trim(),
        price,
        oldPrice: oldPrice ?? null,
        image: image.trim(),
        rating,
        sold,
        description: body.description?.trim() || "", // Mặc định là chuỗi rỗng nếu không có
      },
    });

    return NextResponse.json(
      {
        data: product,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        data: null,
        error: "Không thể tạo sản phẩm",
      },
      { status: 500 }
    );
  }
}