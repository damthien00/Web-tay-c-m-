"use server";
import prisma from "@/src/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TSavingsGoalCreateSchema,
  TSavingsGoalUpdateSchema,
  TSearchSavingsGoalSchema,
} from "./validations";

function revalidateSavings() {
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

// Create
export async function createSavingsGoal(inputs: TSavingsGoalCreateSchema) {
  try {
    const res = await prisma.savingsGoal.create({
      data: {
        userId: inputs.userId,
        title: inputs.title,
        targetAmount: inputs.targetAmount,
        // currentAmount starts at 0 by default
        deadline: new Date(inputs.deadline),
        category: inputs.category,
      },
    });
    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Update
export async function updateSavingsGoal(
  userId: string,
  id: string,
  inputs: TSavingsGoalUpdateSchema
) {
  try {
    const res = await prisma.savingsGoal.update({
      where: { id, userId },
      data: {
        title: inputs.title ?? undefined,
        targetAmount: inputs.targetAmount ?? undefined,
        deadline: inputs.deadline ? new Date(inputs.deadline) : undefined,
        category: inputs.category ?? undefined,
        isCompleted: inputs.isCompleted ?? undefined,
      },
    });

    // Auto-toggle completion if target changed
    const goal = await prisma.savingsGoal.findUnique({ where: { id, userId } });
    if (goal) {
      const shouldBeCompleted = goal.currentAmount >= goal.targetAmount;
      if (goal.isCompleted !== shouldBeCompleted) {
        await prisma.savingsGoal.update({ where: { id, userId }, data: { isCompleted: shouldBeCompleted } });
      }
    }

    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete many
export async function deleteSavingsGoals(userId: string, ids: string[]) {
  try {
    const res = await prisma.savingsGoal.deleteMany({ where: { id: { in: ids }, userId } });
    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete one
export async function deleteSavingsGoal(userId: string, id: string) {
  try {
    const res = await prisma.savingsGoal.delete({ where: { id, userId } });
    revalidateSavings();
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Get by id (with contributions count)
export async function getSavingsGoal(userId: string, id: string) {
  try {
    const res = await prisma.savingsGoal.findUnique({
      where: { id, userId },
      include: { _count: { select: { contributions: true } } },
    });
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// List
export async function listSavingsGoals(filters: TSearchSavingsGoalSchema) {
  const { userId, q, category, isCompleted, from, to, page, per_page, sort } = filters;

  const where: any = {
    userId,
    ...(category ? { category } : {}),
    ...(isCompleted !== undefined ? { isCompleted } : {}),
    ...(from || to
      ? {
          deadline: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const allowedSort = new Set(["updatedAt", "deadline", "createdAt", "targetAmount", "currentAmount"]);
  let orderBy: any = { updatedAt: "desc" };
  if (sort) {
    const [field, direction] = String(sort).split(".");
    if (field && allowedSort.has(field)) orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
  }

  try {
    const [items, total] = await Promise.all([
      prisma.savingsGoal.findMany({ where, orderBy, skip: (page - 1) * per_page, take: per_page }),
      prisma.savingsGoal.count({ where }),
    ]);
    return { data: { items: serializeBigInt(items), page, per_page, total }, error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}
