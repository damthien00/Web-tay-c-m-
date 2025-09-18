import { NextResponse } from "next/server";
import { createSavingsContribution } from "@/actions/savings-contributions/actions";

// POST /api/savings-contributions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, goalId, amount, description, title } = body || {};

    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    if (!goalId) return NextResponse.json({ data: null, error: "Missing goalId" }, { status: 400 });
    if (amount === undefined || amount === null) return NextResponse.json({ data: null, error: "Missing amount" }, { status: 400 });

    let amountBI: bigint;
    try {
      const num = typeof amount === "string" ? Number(amount) : amount;
      if (!Number.isFinite(num)) throw new Error("Invalid amount");
      amountBI = BigInt(Math.trunc(num));
    } catch (e) {
      return NextResponse.json({ data: null, error: "Invalid amount" }, { status: 400 });
    }

    const { data, error } = await createSavingsContribution({
      userId,
      goalId,
      amount: amountBI as any,
      description,
      title,
    });

    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
