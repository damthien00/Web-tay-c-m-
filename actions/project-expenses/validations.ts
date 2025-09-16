import { ProjectExpense, Prisma } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";
import {
  bigIntLike,
  pagination,
  userIdString,
} from "@/actions/shared/schemas";

export type TProjectExpense = ProjectExpense;

export const searchProjectExpenseSchema = z
  .object({
    userId: userIdString,
    projectId: z.string().refine(isMongoId).optional(),
    category: z.string().optional(),
    from: z.union([z.string(), z.date()]).optional(), // date from
    to: z.union([z.string(), z.date()]).optional(), // date to
  })
  .merge(pagination);
export type TSearchProjectExpenseSchema = z.infer<typeof searchProjectExpenseSchema>;

export const projectExpenseCreateSchema = z.object({
  userId: userIdString,
  projectId: z.string().refine(isMongoId),
  amount: bigIntLike.refine((v) => v > 0n, { message: "Amount must be > 0" }),
  description: z.string().default(""),
  category: z.string().min(1),
  date: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
});
export type TProjectExpenseCreateSchema = z.infer<typeof projectExpenseCreateSchema>;

export const projectExpenseUpdateSchema = projectExpenseCreateSchema.partial().extend({
  userId: userIdString.optional(),
  projectId: z.string().refine(isMongoId).optional(),
});
export type TProjectExpenseUpdateSchema = z.infer<typeof projectExpenseUpdateSchema>;
