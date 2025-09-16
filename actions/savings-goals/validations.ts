import { Prisma, SavingsGoal } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";
import {
  bigIntLike,
  pagination,
  userIdString,
} from "@/actions/shared/schemas";

export type TSavingsGoal = SavingsGoal;
export type TSavingsGoalWithCounts = Prisma.SavingsGoalGetPayload<{
  include: {
    _count: { select: { contributions: true } };
  };
}>;

export const searchSavingsGoalSchema = z
  .object({
    userId: userIdString,
    q: z.string().optional(),
    category: z.string().optional(),
    isCompleted: z.boolean().optional(),
    from: z.union([z.string(), z.date()]).optional(), // deadline from
    to: z.union([z.string(), z.date()]).optional(), // deadline to
  })
  .merge(pagination);
export type TSearchSavingsGoalSchema = z.infer<typeof searchSavingsGoalSchema>;

export const savingsGoalCreateSchema = z.object({
  userId: userIdString,
  title: z.string().min(1),
  targetAmount: bigIntLike.refine((v) => v > 0n, { message: "Target must be > 0" }),
  deadline: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  category: z.string().min(1),
});
export type TSavingsGoalCreateSchema = z.infer<typeof savingsGoalCreateSchema>;

export const savingsGoalUpdateSchema = savingsGoalCreateSchema.partial().extend({
  userId: userIdString.optional(),
  isCompleted: z.boolean().optional(),
});
export type TSavingsGoalUpdateSchema = z.infer<typeof savingsGoalUpdateSchema>;
