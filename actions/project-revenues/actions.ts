"use server";
import prisma from "@/src/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TProjectRevenueCreateSchema,
  TProjectRevenueUpdateSchema,
  TSearchProjectRevenueSchema,
} from "./validations";

async function recomputeProjectRevenueTotal(projectId: string) {
  const agg = await prisma.projectRevenue.aggregate({
    where: { projectId },
    _sum: { paidAmount: true },
  });
  const total = (agg._sum.paidAmount ?? 0n) as bigint;
  await prisma.project.update({ where: { id: projectId }, data: { totalRevenue: total } });
}

// Create
export async function createProjectRevenue(inputs: TProjectRevenueCreateSchema) {
  try {
    const res = await prisma.projectRevenue.create({
      data: {
        userId: inputs.userId,
        projectId: inputs.projectId,
        amount: inputs.amount,
        description: inputs.description ?? "",
        source: inputs.source,
        status: inputs.status,
        paidAmount: inputs.paidAmount ?? 0n,
        invoiceNumber: inputs.invoiceNumber ?? undefined,
        dueDate: inputs.dueDate ? new Date(inputs.dueDate) : undefined,
        date: new Date(inputs.date),
      },
    });
    await recomputeProjectRevenueTotal(inputs.projectId);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Update
export async function updateProjectRevenue(userId: string, id: string, inputs: TProjectRevenueUpdateSchema) {
  try {
    const prev = await prisma.projectRevenue.findUnique({ where: { id, userId } });
    if (!prev) return { data: null, error: "Revenue not found" } as const;

    const res = await prisma.projectRevenue.update({
      where: { id, userId },
      data: {
        projectId: inputs.projectId ?? undefined,
        amount: inputs.amount ?? undefined,
        description: inputs.description ?? undefined,
        source: inputs.source ?? undefined,
        status: inputs.status ?? undefined,
        paidAmount: inputs.paidAmount ?? undefined,
        invoiceNumber: inputs.invoiceNumber ?? undefined,
        dueDate: inputs.dueDate ? new Date(inputs.dueDate) : undefined,
        date: inputs.date ? new Date(inputs.date) : undefined,
      },
    });

    const affected = new Set<string>([prev.projectId, inputs.projectId ?? prev.projectId]);
    for (const pid of affected) await recomputeProjectRevenueTotal(pid);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete many
export async function deleteProjectRevenues(userId: string, ids: string[]) {
  try {
    const rows = await prisma.projectRevenue.findMany({ where: { id: { in: ids }, userId }, select: { projectId: true } });
    const res = await prisma.projectRevenue.deleteMany({ where: { id: { in: ids }, userId } });
    const projects = new Set<string>(rows.map((r) => r.projectId));
    for (const pid of projects) await recomputeProjectRevenueTotal(pid);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete one
export async function deleteProjectRevenue(userId: string, id: string) {
  try {
    const prev = await prisma.projectRevenue.findUnique({ where: { id, userId } });
    if (!prev) return { data: null, error: "Revenue not found" } as const;
    const res = await prisma.projectRevenue.delete({ where: { id, userId } });
    await recomputeProjectRevenueTotal(prev.projectId);

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Get by id
export async function getProjectRevenue(userId: string, id: string) {
  try {
    const res = await prisma.projectRevenue.findUnique({ where: { id, userId } });
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// List
export async function listProjectRevenues(filters: TSearchProjectRevenueSchema) {
  const { userId, projectId, status, source, from, to, page, per_page, sort } = filters;
  const where: any = {
    userId,
    ...(projectId ? { projectId } : {}),
    ...(status ? { status } : {}),
    ...(source ? { source: { contains: source, mode: "insensitive" } } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const allowedSort = new Set(["date", "amount", "paidAmount", "createdAt"]);
  let orderBy: any = { date: "desc" };
  if (sort) {
    const [field, direction] = String(sort).split(".");
    if (field && allowedSort.has(field)) orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
  }

  try {
    const [items, total] = await Promise.all([
      prisma.projectRevenue.findMany({ where, orderBy, skip: (page - 1) * per_page, take: per_page }),
      prisma.projectRevenue.count({ where }),
    ]);
    return { data: { items: serializeBigInt(items), page, per_page, total }, error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}
