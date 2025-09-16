import { Prisma, Project } from "@prisma/client";
import { z } from "zod";
import { isMongoId } from "validator";
import {
  bigIntLike,
  currencyEnum,
  dateRange,
  pagination,
  userIdString,
} from "@/actions/shared/schemas";

export type TProject = Project;
export type TProjectWithCounts = Prisma.ProjectGetPayload<{
  include: {
    _count: { select: { expenses: true; revenues: true; transactions: true } };
  };
}>;

export const searchProjectSchema = z
  .object({
    userId: userIdString,
    q: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    currency: currencyEnum.optional(),
  })
  .merge(
    z.object({
      from: z.union([z.string(), z.date()]).optional(), // startDate from
      to: z.union([z.string(), z.date()]).optional(), // startDate to
    })
  )
  .merge(pagination);
export type TSearchProjectSchema = z.infer<typeof searchProjectSchema>;

export const projectCreateSchema = z.object({
  userId: userIdString,
  name: z.string().min(1),
  description: z.string().default(""),
  budget: bigIntLike.refine((v) => v > 0n, { message: "Budget must be > 0" }),
  status: z.string().min(1),
  startDate: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  endDate: z.union([z.string(), z.date()]).optional().transform((v) => (v ? new Date(v) : undefined)),
  category: z.string().min(1),
  currency: currencyEnum.default("VND"),
});
export type TProjectCreateSchema = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  userId: userIdString.optional(), // usually immutable
});
export type TProjectUpdateSchema = z.infer<typeof projectUpdateSchema>;
