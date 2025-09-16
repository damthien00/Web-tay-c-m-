import { z } from "zod";
import { isMongoId } from "validator";

// Basic primitives
export const objectIdString = z.string().refine(isMongoId, { message: "Invalid ObjectId" });
export const userIdString = z.string().min(1, { message: "userId is required" });

// Numbers as BigInt
export const bigIntLike = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((v) => {
    if (typeof v === "bigint") return v;
    if (typeof v === "number") return BigInt(Math.trunc(v));
    // string
    const trimmed = v.trim();
    // allow decimal strings but truncate toward zero
    const num = Number(trimmed);
    if (!Number.isFinite(num)) throw new Error("Invalid number");
    return BigInt(Math.trunc(num));
  });

// Enums
export const currencyEnum = z.enum(["VND", "USD"]);
export const transactionTypeEnum = z.enum(["income", "expense"]);
export const revenueStatusEnum = z.enum(["pending", "received", "overdue"]);

// Dates
export const dateLike = z
  .union([z.string(), z.date()])
  .transform((v) => (typeof v === "string" ? new Date(v) : v));

export const dateRange = z.object({
  from: dateLike.optional(),
  to: dateLike.optional(),
});

// Pagination & sorting
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});

// Helper type exports
export type TObjectIdString = z.infer<typeof objectIdString>;
export type TUserIdString = z.infer<typeof userIdString>;
export type TBigIntLike = z.infer<typeof bigIntLike>;
export type TDateLike = z.infer<typeof dateLike>;
export type TDateRange = z.infer<typeof dateRange>;
export type TPagination = z.infer<typeof pagination>;
