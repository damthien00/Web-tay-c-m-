
import { Products } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";

export type TProduct = Products;

// Validate ObjectId của MongoDB
const mongoIdSchema = z.string().refine(isMongoId, {
  message: "ID sản phẩm không hợp lệ",
});

// Schema tìm kiếm và phân trang sản phẩm
export const searchProductSchema = z.object({
  search: z.string().optional(),

  page: z.coerce.number().int().min(1).default(1),

  per_page: z.coerce.number().int().min(1).max(100).default(10),

  sort: z
    .enum([
      "name.asc",
      "name.desc",
      "price.asc",
      "price.desc",
      "oldPrice.asc",
      "oldPrice.desc",
      "rating.asc",
      "rating.desc",
      "sold.asc",
      "sold.desc",
      "createdAt.asc",
      "createdAt.desc",
      "updatedAt.asc",
      "updatedAt.desc",
    ])
    .optional()
    .default("createdAt.desc"),

  from: z.string().optional(),
  to: z.string().optional(),

  operator: z.enum(["and", "or"]).optional().default("and"),
});

export type TSearchProductSchema = z.infer<
  typeof searchProductSchema
>;

// Giá trị mặc định khi tạo sản phẩm
export const defaultProduct: TProductCreateSchema = {
  name: "",
  price: 0,
  oldPrice: null,
  image: "",
  images: [],
  rating: 0,
  sold: 0,
  description: "",
};

// Schema tạo sản phẩm

const productImageSchema = z
    .string()
    .min(1, "Đường dẫn ảnh không được để trống")
    .refine((value) => {
        // Ảnh upload vào thư mục public/uploads
        if (value.startsWith("/uploads/")) {
            return !value.includes("..");
        }

        // URL ảnh bên ngoài
        try {
            const url = new URL(value);
            return (
                (url.protocol === "http:" ||
                    url.protocol === "https:") &&
                Boolean(url.hostname)
            );
        } catch {
            return false;
        }
    }, "Đường dẫn ảnh không hợp lệ");


export const productCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên sản phẩm không được để trống")
    .max(200, "Tên sản phẩm không được vượt quá 200 ký tự"),

  price: z.coerce
    .number()
    .int("Giá sản phẩm phải là số nguyên")
    .min(0, "Giá sản phẩm không được âm")
    .max(Number.MAX_SAFE_INTEGER),

  oldPrice: z
    .union([
      z.coerce
        .number()
        .int("Giá cũ phải là số nguyên")
        .min(0, "Giá cũ không được âm")
        .max(Number.MAX_SAFE_INTEGER),
      z.null(),
    ])
    .optional()
    .default(null),

 image: z
    .string()
    .trim()
    .min(1, "Ảnh sản phẩm không được để trống")
    .refine(
        (value) => {
            // Cho phép ảnh upload trong public/uploads
            if (value.startsWith("/uploads/")) {
                return !value.includes("..");
            }

            // Cho phép URL ảnh bên ngoài
            try {
                const url = new URL(value);

                return (
                    ["http:", "https:"].includes(url.protocol) &&
                    Boolean(url.hostname)
                );
            } catch {
                return false;
            }
        },
        "Đường dẫn ảnh không hợp lệ",
    ),
  images: z.array(productImageSchema).min(1, "Vui lòng chọn ít nhất một ảnh").max(10),
  rating: z.coerce
    .number()
    .min(0, "Đánh giá thấp nhất là 0")
    .max(5, "Đánh giá cao nhất là 5")
    .default(0),

  sold: z.coerce
    .number()
    .int("Số lượng đã bán phải là số nguyên")
    .min(0, "Số lượng đã bán không được âm")
    .default(0),
  description : z.string().optional().default(""),
    
});

export type TProductCreateSchema = z.infer<
  typeof productCreateSchema
>;

// Schema cập nhật sản phẩm
export const productUpdateSchema = productCreateSchema.partial();

export type TProductUpdateSchema = z.infer<
  typeof productUpdateSchema
>;

// Schema lấy sản phẩm theo ID
export const productIdSchema = z.object({
  id: mongoIdSchema,
});

