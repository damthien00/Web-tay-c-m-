"use server";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TProjectExpenseCreateSchema,
  TProjectExpenseUpdateSchema,
  TSearchProjectExpenseSchema,
} from "./validations";
import {createTransaction} from "@/actions/transactions/actions";

async function recomputeProjectExpenseTotal(projectId: string) {
  const agg = await prisma.projectExpense.aggregate({
    where: { projectId },
    _sum: { amount: true },
  });
  const total = (agg._sum.amount ?? 0n) as bigint;
  await prisma.project.update({ where: { id: projectId }, data: { totalExpenses: total } });
}

// Create
export async function createProjectExpense(inputs: TProjectExpenseCreateSchema) {
  try {
    const res = await prisma.projectExpense.create({
      data: {
        userId: inputs.userId,
        projectId: inputs.projectId,
        amount: inputs.amount,
        description: inputs.description ?? "",
        category: inputs.category,
        date: new Date(inputs.date),
      },
    });
		await createTransaction({
			userId: inputs.userId,
			projectId: inputs.projectId,
			type: 'expense',
			amount: inputs.amount,
			category: 'kinh-doanh',
			description: `Chi phí dự án: ${inputs.description}`,
			paymentMethod: 'chuyen-khoan',
			tags: [],
      linkedType: 'projectExpense',
      linkedId: res.id,
		})
    await recomputeProjectExpenseTotal(inputs.projectId);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Update
export async function updateProjectExpense(userId: string, id: string, inputs: TProjectExpenseUpdateSchema) {
  try {
    const prev = await prisma.projectExpense.findUnique({ where: { id, userId } });
    if (!prev) return { data: null, error: "Expense not found" } as const;

    const res = await prisma.projectExpense.update({
      where: { id, userId },
      data: {
        projectId: inputs.projectId ?? undefined,
        amount: inputs.amount ?? undefined,
        description: inputs.description ?? undefined,
        category: inputs.category ?? undefined,
        date: inputs.date ? new Date(inputs.date) : undefined,
      },
    });

    const affected = new Set<string>([prev.projectId, inputs.projectId ?? prev.projectId]);
    for (const pid of affected) await recomputeProjectExpenseTotal(pid);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete many
export async function deleteProjectExpenses(userId: string, ids: string[]) {
  try {
    const rows = await prisma.projectExpense.findMany({ where: { id: { in: ids }, userId }, select: { projectId: true } });
    const res = await prisma.projectExpense.deleteMany({ where: { id: { in: ids }, userId } });
    const projects = new Set<string>(rows.map((r) => r.projectId));
    for (const pid of projects) await recomputeProjectExpenseTotal(pid);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete one
export async function deleteProjectExpense(userId: string, id: string) {
  try {
    const prev = await prisma.projectExpense.findUnique({ where: { id, userId } });
    if (!prev) return { data: null, error: "Expense not found" } as const;
    const res = await prisma.projectExpense.delete({ where: { id, userId } });
    await recomputeProjectExpenseTotal(prev.projectId);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Get by id
export async function getProjectExpense(userId: string, id: string) {
  try {
    const res = await prisma.projectExpense.findUnique({ where: { id, userId } });
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// List
export async function listProjectExpenses(filters: TSearchProjectExpenseSchema) {
  const { userId, projectId, category, from, to, page, per_page, sort } = filters;
  const where: any = {
    userId,
    ...(projectId ? { projectId } : {}),
    ...(category ? { category } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const allowedSort = new Set(["date", "amount", "createdAt"]);
  let orderBy: any = { date: "desc" };
  if (sort) {
    const [field, direction] = String(sort).split(".");
    if (field && allowedSort.has(field)) orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
  }

  try {
    const [items, total] = await Promise.all([
      prisma.projectExpense.findMany({ where, orderBy, skip: (page - 1) * per_page, take: per_page }),
      prisma.projectExpense.count({ where }),
    ]);
    return { data: { items: serializeBigInt(items), page, per_page, total }, error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}
