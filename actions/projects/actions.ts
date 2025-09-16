"use server";
import prisma from "@/src/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TProjectCreateSchema,
  TProjectUpdateSchema,
  TSearchProjectSchema,
} from "./validations";

// Create
export async function createProject(inputs: TProjectCreateSchema) {
  try {
    const res = await prisma.project.create({
      data: {
        userId: inputs.userId,
        name: inputs.name,
        description: inputs.description ?? "",
        budget: inputs.budget,
        status: inputs.status,
        startDate: new Date(inputs.startDate),
        endDate: inputs.endDate ? new Date(inputs.endDate) : undefined,
        category: inputs.category,
        currency: inputs.currency ?? "VND",
      },
    });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Update
export async function updateProject(userId: string, id: string, inputs: TProjectUpdateSchema) {
  try {
    const res = await prisma.project.update({
      where: { id, userId },
      data: {
        name: inputs.name ?? undefined,
        description: inputs.description ?? undefined,
        budget: inputs.budget ?? undefined,
        status: inputs.status ?? undefined,
        startDate: inputs.startDate ? new Date(inputs.startDate) : undefined,
        endDate: inputs.endDate === undefined ? undefined : (inputs.endDate ? new Date(inputs.endDate) : null),
        category: inputs.category ?? undefined,
        currency: inputs.currency ?? undefined,
      },
    });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete many
export async function deleteProjects(userId: string, ids: string[]) {
  try {
    const res = await prisma.project.deleteMany({ where: { id: { in: ids }, userId } });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Delete one
export async function deleteProject(userId: string, id: string) {
  try {
    const res = await prisma.project.delete({ where: { id, userId } });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// Get by id (with counts to give a quick summary)
export async function getProject(userId: string, id: string) {
  try {
    const res = await prisma.project.findUnique({
      where: { id, userId },
      include: {
        _count: { select: { expenses: true, revenues: true, transactions: true } },
      },
    });
    return { data: serializeBigInt(res), error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}

// List with filters + pagination
export async function listProjects(filters: TSearchProjectSchema) {
  const { userId, q, status, category, currency, from, to, page, per_page, sort } = filters;

  const where: any = {
    userId,
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(currency ? { currency } : {}),
    ...(from || to
      ? {
          startDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const allowedSort = new Set([
    "createdAt",
    "name",
    "budget",
    "totalExpenses",
    "totalRevenue",
    "status",
    "startDate",
  ]);
  let orderBy: any = { createdAt: "desc" };
  if (sort) {
    const [field, direction] = String(sort).split(".");
    if (field && allowedSort.has(field)) {
      orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
    }
  }

  try {
    const [items, total] = await Promise.all([
      prisma.project.findMany({ where, orderBy, skip: (page - 1) * per_page, take: per_page }),
      prisma.project.count({ where }),
    ]);
    return { data: { items: serializeBigInt(items), page, per_page, total }, error: null } as const;
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) } as const;
  }
}
