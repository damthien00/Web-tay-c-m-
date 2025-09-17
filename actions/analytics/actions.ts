"use server";
import prisma from "@/src/lib/prisma";
import { getErrorMessage } from "@/actions/utils/utils";
import { serializeBigInt } from "@/actions/shared/utils";
import { TGetTotalsByDateRangeSchema } from "./validations";

// Current balance: (sum income) - (sum expense)
export async function getCurrentBalance(userId: string): Promise<{ data: any; error: string | null }> {
  try {
    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId, type: "income" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId, type: "expense" }, _sum: { amount: true } }),
    ]);

    const incomeTotal = (inc._sum.amount ?? 0n) as bigint;
    const expenseTotal = (exp._sum.amount ?? 0n) as bigint;
    const balance = incomeTotal - expenseTotal;

    return { data: serializeBigInt({ incomeTotal, expenseTotal, balance }), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) };
  }
}

// Totals by optional date range (createdAt)
export async function getTotalsByDateRange(inputs: TGetTotalsByDateRangeSchema): Promise<{ data: any; error: string | null }> {
  const { userId, from, to } = inputs;
  const dateFilter = from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};
  const baseWhere: any = { userId, ...dateFilter };

  try {
    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({ where: { ...baseWhere, type: "income" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...baseWhere, type: "expense" }, _sum: { amount: true } }),
    ]);

    const incomeTotal = (inc._sum.amount ?? 0n) as bigint;
    const expenseTotal = (exp._sum.amount ?? 0n) as bigint;
    const net = incomeTotal - expenseTotal;

    return { data: serializeBigInt({ range: { from: from ?? undefined, to: to ?? undefined }, incomeTotal, expenseTotal, net }), error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: getErrorMessage(e) };
  }
}
