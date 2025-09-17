import { z } from "zod";
import { dateLike, userIdString } from "@/actions/shared/schemas";

export const getCurrentBalanceSchema = z.object({
  userId: userIdString,
});
export type TGetCurrentBalanceSchema = z.infer<typeof getCurrentBalanceSchema>;

export const getTotalsByDateRangeSchema = z.object({
  userId: userIdString,
  from: dateLike.optional(),
  to: dateLike.optional(),
});
export type TGetTotalsByDateRangeSchema = z.infer<typeof getTotalsByDateRangeSchema>;

export const getRecentTransactionsSchema = z.object({
  userId: userIdString,
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type TGetRecentTransactionsSchema = z.infer<typeof getRecentTransactionsSchema>;
