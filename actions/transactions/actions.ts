"use server";
import { Transaction } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { revalidatePath } from "next/cache";
import { serializeBigInt } from "@/actions/shared/utils";
import {
  TSearchTransactionSchema,
  TTransactionCreateSchema,
  TTransactionUpdateSchema,
} from "./validations";

// Create
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
      },
      include: {
        project: { select: { id: true, name: true } },
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
    const res = await prisma.transaction.update({
      where: { id, userId },
      data: {
        // do not allow changing userId here by default
        type: inputs.type ?? undefined,
        amount: inputs.amount ?? undefined,
        category: inputs.category ?? undefined,
        description: inputs.description ?? undefined,
        paymentMethod: inputs.paymentMethod ?? undefined,
        location: inputs.location ?? undefined,
        tags: inputs.tags ?? undefined,
        projectId: inputs.projectId ?? undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
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

// Delete many
export async function deleteTransactions(userId: string, ids: string[]) {
  try {
    const res = await prisma.transaction.deleteMany({
      where: { id: { in: ids }, userId },
    });
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
    const res = await prisma.transaction.delete({ where: { id, userId } });
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
