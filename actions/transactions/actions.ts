"use server";
import { Transaction, LinkedEntityType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TSearchTransactionSchema,
  TTransactionCreateSchema,
  TTransactionUpdateSchema,
} from "./validations";
import {recomputeProjectExpenseTotal} from "@/actions/project-expenses/actions";
import {recomputeProjectRevenueTotal} from "@/actions/project-revenues/actions";
import {recomputeGoalTotals} from "@/actions/savings-contributions/actions";

// Helpers for recomputing aggregates used during cascades\nasync function recomputeProjectExpenseTotal(projectId: string) {\n  const agg = await prisma.projectExpense.aggregate({\n    where: { projectId },\n    _sum: { amount: true },\n  });\n  const total = (agg._sum.amount ?? 0n) as bigint;\n  await prisma.project.update({ where: { id: projectId }, data: { totalExpenses: total } });\n}\n\nasync function recomputeProjectRevenueTotal(projectId: string) {\n  const agg = await prisma.projectRevenue.aggregate({\n    where: { projectId },\n    _sum: { paidAmount: true },\n  });\n  const total = (agg._sum.paidAmount ?? 0n) as bigint;\n  await prisma.project.update({ where: { id: projectId }, data: { totalRevenue: total } });\n}\n\nasync function recomputeGoalTotals(goalId: string) {\n  const agg = await prisma.savingsContribution.aggregate({\n    where: { goalId },\n    _sum: { amount: true },\n  });\n  const total = (agg._sum.amount ?? 0n) as bigint;\n  const goal = await prisma.savingsGoal.update({ where: { id: goalId }, data: { currentAmount: total } });\n  const shouldBeCompleted = goal.currentAmount >= goal.targetAmount;\n  if (goal.isCompleted !== shouldBeCompleted) {\n    await prisma.savingsGoal.update({ where: { id: goalId }, data: { isCompleted: shouldBeCompleted } });\n  }\n}\n\n// Create
export async function createTransaction(
  inputs: TTransactionCreateSchema
): Promise<{ data: any; error: string | null }> {
  try {
    const res = await prisma.transaction.create({
      data: {
        userId: inputs.userId,
        type: inputs.type,
        amount: inputs.amount,
        category: inputs.category,
        description: inputs.description ?? "",
        paymentMethod: inputs.paymentMethod,
        location: inputs.location,
        tags: inputs.tags ?? [],
        projectId: inputs.projectId ?? undefined,
        goalId: inputs.goalId ?? undefined,
        linkedType: inputs.linkedType ?? undefined,
        linkedId: inputs.linkedId ?? undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        goal: { select: { id: true, title: true } },
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) };
  }
}

// Update
export async function updateTransaction(
  userId: string,
  id: string,
  inputs: TTransactionUpdateSchema
): Promise<{ data: any; error: string | null }> {
  try {
    const prevTx = await prisma.transaction.findUnique({ where: { id, userId } });
    if (!prevTx) return { data: null, error: "Transaction not found" };

    const res = await prisma.transaction.update({
      where: { id, userId },
      data: {
        type: inputs.type ?? undefined,
        amount: inputs.amount ?? undefined,
        category: inputs.category ?? undefined,
        description: inputs.description ?? undefined,
        paymentMethod: inputs.paymentMethod ?? undefined,
        location: inputs.location ?? undefined,
        tags: inputs.tags ?? undefined,
        projectId: inputs.projectId ?? undefined,
        goalId: inputs.goalId ?? undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    // Cascade to linked entities per rules
    if (prevTx.linkedType && prevTx.linkedId) {
      if (prevTx.linkedType === "projectExpense") {
        const exp = await prisma.projectExpense.findUnique({ where: { id: prevTx.linkedId, userId } });
        if (exp) {
          const prevPid = exp.projectId;
          const updated = await prisma.projectExpense.update({
            where: { id: prevTx.linkedId, userId },
            data: {
              amount: res.amount,
              projectId: res.projectId ?? undefined,
            },
          });
          const affected = new Set<string>([prevPid, updated.projectId]);
          for (const pid of affected) await recomputeProjectExpenseTotal(pid);
          revalidatePath("/projects");
        }
      } else if (prevTx.linkedType === "projectRevenue") {
        const rev = await prisma.projectRevenue.findUnique({ where: { id: prevTx.linkedId, userId } });
        if (rev) {
          const prevPid = rev.projectId;
          const updated = await prisma.projectRevenue.update({
            where: { id: prevTx.linkedId, userId },
            data: {
              paidAmount: res.amount,
              projectId: res.projectId ?? undefined,
            },
          });
          const affected = new Set<string>([prevPid, updated.projectId]);
          for (const pid of affected) await recomputeProjectRevenueTotal(pid);
          revalidatePath("/projects");
        }
      } else if (prevTx.linkedType === "savingsContribution") {
        const con = await prisma.savingsContribution.findUnique({ where: { id: prevTx.linkedId, userId } });
        if (con) {
          const prevGid = con.goalId;
          const updated = await prisma.savingsContribution.update({
            where: { id: prevTx.linkedId, userId },
            data: {
              amount: res.amount,
              goalId: res.goalId ?? undefined,
            },
          });
          const goals = new Set<string>([prevGid, updated.goalId]);
          for (const gid of goals) await recomputeGoalTotals(gid);
          revalidatePath("/savings");
        }
      }
    }

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) };
  }
}

// Delete many
export async function deleteTransactions(userId: string, ids: string[]) {
  try {
    const txs = await prisma.transaction.findMany({ where: { id: { in: ids }, userId } });
    const projects = new Set<string>();
    const goals = new Set<string>();

    for (const tx of txs) {
      if (tx.linkedType && tx.linkedId) {
        if (tx.linkedType === "projectExpense") {
          const exp = await prisma.projectExpense.findUnique({ where: { id: tx.linkedId, userId } });
          if (exp) {
            projects.add(exp.projectId);
            await prisma.projectExpense.delete({ where: { id: tx.linkedId, userId } });
          }
        } else if (tx.linkedType === "projectRevenue") {
          const rev = await prisma.projectRevenue.findUnique({ where: { id: tx.linkedId, userId } });
          if (rev) {
            projects.add(rev.projectId);
            await prisma.projectRevenue.delete({ where: { id: tx.linkedId, userId } });
          }
        } else if (tx.linkedType === "savingsContribution") {
          const con = await prisma.savingsContribution.findUnique({ where: { id: tx.linkedId, userId } });
          if (con) {
            goals.add(con.goalId);
            await prisma.savingsContribution.delete({ where: { id: tx.linkedId, userId } });
          }
        }
      }
    }

    const res = await prisma.transaction.deleteMany({
      where: { id: { in: ids }, userId },
    });

    for (const pid of projects) {
      await recomputeProjectExpenseTotal(pid);
      await recomputeProjectRevenueTotal(pid);
    }
    for (const gid of goals) await recomputeGoalTotals(gid);

    revalidatePath("/projects");
    revalidatePath("/savings");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete one
export async function deleteTransaction(userId: string, id: string) {
  try {
    const tx = await prisma.transaction.findUnique({ where: { id, userId } });
    if (!tx) return { data: null, error: "Transaction not found" } as const;

    const projects = new Set<string>();
    const goals = new Set<string>();

    if (tx.linkedType && tx.linkedId) {
      if (tx.linkedType === "projectExpense") {
        const exp = await prisma.projectExpense.findUnique({ where: { id: tx.linkedId, userId } });
        if (exp) {
          projects.add(exp.projectId);
          await prisma.projectExpense.delete({ where: { id: tx.linkedId, userId } });
        }
        revalidatePath("/projects");
      } else if (tx.linkedType === "projectRevenue") {
        const rev = await prisma.projectRevenue.findUnique({ where: { id: tx.linkedId, userId } });
        if (rev) {
          projects.add(rev.projectId);
          await prisma.projectRevenue.delete({ where: { id: tx.linkedId, userId } });
        }
        revalidatePath("/projects");
      } else if (tx.linkedType === "savingsContribution") {
        const con = await prisma.savingsContribution.findUnique({ where: { id: tx.linkedId, userId } });
        if (con) {
          goals.add(con.goalId);
          await prisma.savingsContribution.delete({ where: { id: tx.linkedId, userId } });
        }
        revalidatePath("/savings");
      }
    }

    const res = await prisma.transaction.delete({ where: { id, userId } });

    for (const pid of projects) await recomputeProjectExpenseTotal(pid);
    for (const pid of projects) await recomputeProjectRevenueTotal(pid);
    for (const gid of goals) await recomputeGoalTotals(gid);

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Get by id
export async function getTransaction(userId: string, id: string) {
  try {
    const res = await prisma.transaction.findUnique({
      where: { id, userId },
      include: { project: { select: { id: true, name: true } } },
    });
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// List with filters + simple pagination
export async function listTransactions(filters: TSearchTransactionSchema) {
  const { userId, q, category, type, projectId, from, to, page, per_page, sort } = filters;

  const where: any = {
    userId,
    ...(category ? { category } : {}),
    ...(type ? { type } : {}),
    ...(projectId ? { projectId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { paymentMethod: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  // sorting whitelist
  const allowedSortFields = new Set(["createdAt", "amount", "category", "type"]);
  let orderBy: any = { createdAt: "desc" };
  if (sort) {
    const [field, direction] = String(sort).split(".");
    if (field && allowedSortFields.has(field)) {
      orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
    }
  }

  try {
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { project: { select: { id: true, name: true } } },
        orderBy,
        skip: (page - 1) * per_page,
        take: per_page,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: { items: serializeBigInt(items), page, per_page, total },
      error: null,
    } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Recent transactions for dashboard
export async function recentTransactions(userId: string, limit = 10) {
  try {
    const data = await prisma.transaction.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return { data: serializeBigInt(data), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}
