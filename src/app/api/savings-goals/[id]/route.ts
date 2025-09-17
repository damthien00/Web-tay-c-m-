import { NextResponse } from "next/server";
import { deleteSavingsGoal, updateSavingsGoal } from "@/actions/savings-goals/actions";

// PATCH /api/savings-goals/:id
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, title, targetAmount, deadline, category, isCompleted } = body || {};

    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    let targetBI: bigint | undefined = undefined;
    if (targetAmount !== undefined) {
      try {
        const num = typeof targetAmount === "string" ? Number(targetAmount) : targetAmount;
        if (!Number.isFinite(num)) throw new Error("Invalid targetAmount");
        targetBI = BigInt(Math.trunc(num));
      } catch (e) {
        return NextResponse.json({ data: null, error: "Invalid targetAmount" }, { status: 400 });
      }
    }

    const d = deadline ? new Date(deadline) : undefined;
    if (deadline && Number.isNaN(d!.getTime())) {
      return NextResponse.json({ data: null, error: "Invalid deadline" }, { status: 400 });
    }

    const { data, error } = await updateSavingsGoal(userId, id, {
      ...(title !== undefined ? { title } : {}),
      ...(targetBI !== undefined ? { targetAmount: targetBI as any } : {}),
      ...(d ? { deadline: d as any } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(isCompleted !== undefined ? { isCompleted } : {}),
    } as any);

    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}

// DELETE /api/savings-goals/:id?userId=...
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    const { data, error } = await deleteSavingsGoal(userId, id);
    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
