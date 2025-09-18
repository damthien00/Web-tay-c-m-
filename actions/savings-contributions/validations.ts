import { SavingsContribution } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";
import { bigIntLike, pagination, userIdString } from "@/actions/shared/schemas";

export type TSavingsContribution = SavingsContribution;

export const searchSavingsContributionSchema = z
  .object({
    userId: userIdString,
    goalId: z.string().refine(isMongoId).optional(),
  })
  .merge(pagination);
export type TSearchSavingsContributionSchema = z.infer<typeof searchSavingsContributionSchema>;

export const savingsContributionCreateSchema = z.object({
  userId: userIdString,
  goalId: z.string().refine(isMongoId),
  amount: bigIntLike.refine((v) => v > 0n, { message: "Amount must be > 0" }),
  description: z.string().optional(),
  title: z.string().optional().nullable(),
});
export type TSavingsContributionCreateSchema = z.infer<typeof savingsContributionCreateSchema>;

export const savingsContributionUpdateSchema = savingsContributionCreateSchema.partial().extend({
  userId: userIdString.optional(),
  goalId: z.string().refine(isMongoId).optional(),
});
export type TSavingsContributionUpdateSchema = z.infer<typeof savingsContributionUpdateSchema>;
