import { Prisma, Transaction } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";
import {
  bigIntLike,
  dateRange,
  pagination,
  transactionTypeEnum,
  userIdString,
} from "@/actions/shared/schemas";

export type TTransaction = Transaction;
export type TTransactionWithProject = Prisma.TransactionGetPayload<{
  include: { project: { select: { id: true; name: true } } };
}>;

export const searchTransactionSchema = z
  .object({
    userId: userIdString,
    q: z.string().optional(),
    category: z.string().optional(),
    type: transactionTypeEnum.optional(),
    projectId: z.string().refine(isMongoId).optional(),
  })
  .merge(dateRange)
  .merge(pagination);
export type TSearchTransactionSchema = z.infer<typeof searchTransactionSchema>;

export const transactionCreateSchema = z.object({
  userId: userIdString,
  type: transactionTypeEnum,
  amount: bigIntLike.refine((v) => v > 0n, { message: "Amount must be > 0" }),
  category: z.string().min(1),
  description: z.string().default(""),
  paymentMethod: z.string().min(1),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  projectId: z.string().refine(isMongoId).optional(),
  goalId: z.string().refine(isMongoId).optional(),
});
export type TTransactionCreateSchema = z.infer<typeof transactionCreateSchema>;

export const transactionUpdateSchema = transactionCreateSchema.partial().extend({
  userId: userIdString.optional(), // userId generally immutable, but allow if policy changes
});
export type TTransactionUpdateSchema = z.infer<typeof transactionUpdateSchema>;
