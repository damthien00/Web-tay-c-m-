"use server";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TSavingsContributionCreateSchema,
  TSavingsContributionUpdateSchema,
  TSearchSavingsContributionSchema,
} from "./validations";

function revalidateSavings() {
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

async function recomputeGoalTotals(goalId: string) {
  const agg = await prisma.savingsContribution.aggregate({
    where: { goalId },
    _sum: { amount: true },
  });
  const total = (agg._sum.amount ?? 0n) as bigint;
  const goal = await prisma.savingsGoal.update({
    where: { id: goalId },
    data: { currentAmount: total },
  });
  const shouldBeCompleted = goal.currentAmount >= goal.targetAmount;
  if (goal.isCompleted !== shouldBeCompleted) {
    await prisma.savingsGoal.update({ where: { id: goalId }, data: { isCompleted: shouldBeCompleted } });
  }
}

// Create
export async function createSavingsContribution(inputs: TSavingsContributionCreateSchema) {
  try {
    const res = await prisma.savingsContribution.create({
      data: {
        userId: inputs.userId,
        goalId: inputs.goalId,
        amount: inputs.amount,
        description: inputs.description ?? undefined,
      },
    });
    await recomputeGoalTotals(inputs.goalId);
    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Update
export async function updateSavingsContribution(
  userId: string,
  id: string,
  inputs: TSavingsContributionUpdateSchema
) {
  try {
    const prev = await prisma.savingsContribution.findUnique({ where: { id, userId } });
    if (!prev) return { data: null, error: "Contribution not found" } as const;

    const res = await prisma.savingsContribution.update({
      where: { id, userId },
      data: {
        goalId: inputs.goalId ?? undefined,
        amount: inputs.amount ?? undefined,
        description: inputs.description ?? undefined,
      },
    });

    const affected = new Set<string>([prev.goalId, inputs.goalId ?? prev.goalId]);
    for (const gid of affected) await recomputeGoalTotals(gid);

    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete many
export async function deleteSavingsContributions(userId: string, ids: string[]) {
  try {
    const rows = await prisma.savingsContribution.findMany({
      where: { id: { in: ids }, userId },
      select: { goalId: true },
    });
    const res = await prisma.savingsContribution.deleteMany({ where: { id: { in: ids }, userId } });
    const goals = new Set<string>(rows.map((r) => r.goalId));
    for (const gid of goals) await recomputeGoalTotals(gid);

    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete one
export async function deleteSavingsContribution(userId: string, id: string) {
  try {
    const prev = await prisma.savingsContribution.findUnique({ where: { id, userId } });
    if (!prev) return { data: null, error: "Contribution not found" } as const;
    const res = await prisma.savingsContribution.delete({ where: { id, userId } });
    await recomputeGoalTotals(prev.goalId);

    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// List
export async function listSavingsContributions(filters: TSearchSavingsContributionSchema) {
  const { userId, goalId, page, per_page, sort } = filters;

  const where: any = {
    userId,
    ...(goalId ? { goalId } : {}),
  };

  const allowedSort = new Set(["createdAt", "amount"]);
  let orderBy: any = { createdAt: "desc" };
  if (sort) {
    const [field, direction] = String(sort).split(".");
    if (field && allowedSort.has(field)) orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
  }

  try {
    const [items, total] = await Promise.all([
      prisma.savingsContribution.findMany({ where, orderBy, skip: (page - 1) * per_page, take: per_page }),
      prisma.savingsContribution.count({ where }),
    ]);
    return { data: { items: serializeBigInt(items), page, per_page, total }, error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}
