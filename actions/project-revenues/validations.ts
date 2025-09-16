import { ProjectRevenue } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";
import {
  bigIntLike,
  pagination,
  revenueStatusEnum,
  userIdString,
} from "@/actions/shared/schemas";

export type TProjectRevenue = ProjectRevenue;

export const searchProjectRevenueSchema = z
  .object({
    userId: userIdString,
    projectId: z.string().refine(isMongoId).optional(),
    status: revenueStatusEnum.optional(),
    source: z.string().optional(),
    from: z.union([z.string(), z.date()]).optional(), // date from
    to: z.union([z.string(), z.date()]).optional(), // date to
  })
  .merge(pagination);
export type TSearchProjectRevenueSchema = z.infer<typeof searchProjectRevenueSchema>;

export const projectRevenueCreateSchema = z.object({
  userId: userIdString,
  projectId: z.string().refine(isMongoId),
  amount: bigIntLike.refine((v) => v > 0n, { message: "Amount must be > 0" }),
  description: z.string().default(""),
  source: z.string().min(1),
  status: revenueStatusEnum,
  paidAmount: bigIntLike.refine((v) => v >= 0n, { message: "paidAmount must be >= 0" }).default(0n as any),
  invoiceNumber: z.string().optional(),
  dueDate: z.union([z.string(), z.date()]).optional(),
  date: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
});
export type TProjectRevenueCreateSchema = z.infer<typeof projectRevenueCreateSchema>;

export const projectRevenueUpdateSchema = projectRevenueCreateSchema.partial().extend({
  userId: userIdString.optional(),
  projectId: z.string().refine(isMongoId).optional(),
});
export type TProjectRevenueUpdateSchema = z.infer<typeof projectRevenueUpdateSchema>;
