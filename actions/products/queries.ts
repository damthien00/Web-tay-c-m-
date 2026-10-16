"use server";

import { Products, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";

type ProductWhereInput = Prisma.ProductsWhereInput;

export type TSearchProductSchema = {
  search?: string;
  page: number;
  per_page: number;
  sort?: string;
  from?: string;
  to?: string;
  operator?: "and" | "or";
};

export type TProduct = Products;

export const getProductById = async (
  id: string
): Promise<{
  data: TProduct | null;
  error: string | null;
}> => {
  try {
    const res = await prisma.products.findUnique({
      where: { id },
    });

    return {
      data: res,
      error: null,
    };
  } catch (e) {
    console.error("getProductById error:", e);

    return {
      data: null,
      error: getErrorMessage(e),
    };
  }
};

export const getProducts = async (
  inputs: TSearchProductSchema
): Promise<{
  data: TProduct[];
  curPage: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
  error: string | null;
}> => {
  try {
    const {
      search,
      page,
      per_page,
      sort,
      from,
      to,
      operator = "and",
    } = inputs;

    // Chuẩn hóa phân trang
    const curPage =
      Number.isInteger(page) && page > 0 ? page : 1;

    const perPage =
      Number.isInteger(per_page) && per_page > 0
        ? Math.min(per_page, 100)
        : 10;

    // Chỉ cho phép sắp xếp theo các trường hợp lệ
    const allowedColumns = [
      "name",
      "price",
      "oldPrice",
      "rating",
      "sold",
      "createdAt",
      "updatedAt",
    ] as const;

    type SortColumn = (typeof allowedColumns)[number];

    const sortParts = sort?.split(".");
    const requestedColumn = sortParts?.[0];
    const requestedOrder = sortParts?.[1];

    const column: SortColumn =
      allowedColumns.includes(requestedColumn as SortColumn)
        ? (requestedColumn as SortColumn)
        : "createdAt";

    const order: Prisma.SortOrder =
      requestedOrder === "asc" ? "asc" : "desc";

    // Tạo điều kiện lọc
    const expressions: ProductWhereInput[] = [];

    if (search?.trim()) {
      expressions.push({
        name: {
          contains: search.trim(),
          mode: "insensitive",
        },
      });
    }

    if (from) {
      const fromDate = new Date(from);

      if (!Number.isNaN(fromDate.getTime())) {
        expressions.push({
          createdAt: { gte: fromDate },
        });
      }
    }

    if (to) {
      const toDate = new Date(to);

      if (!Number.isNaN(toDate.getTime())) {
        expressions.push({
          createdAt: { lte: toDate },
        });
      }
    }

    const where: ProductWhereInput =
      expressions.length === 0
        ? {}
        : operator === "or"
          ? { OR: expressions }
          : { AND: expressions };

    // Truy vấn tổng số và danh sách sản phẩm
    const [total, data] = await prisma.$transaction([
      prisma.products.count({ where }),

      prisma.products.findMany({
        where,
        skip: (curPage - 1) * perPage,
        take: perPage,
        orderBy: {
          [column]: order,
        },
      }),
    ]);

    return {
      data,
      curPage,
      perPage,
      pageCount: Math.ceil(total / perPage),
      totalCount: total,
      error: null,
    };
  } catch (e) {
    console.error("getProducts error:", e);

    return {
      data: [],
      curPage: 1,
      perPage: 10,
      pageCount: 0,
      totalCount: 0,
      error: getErrorMessage(e),
    };
  }
};