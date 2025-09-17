import { NextResponse } from "next/server";
import { createSavingsGoal, listSavingsGoals } from "@/actions/savings-goals/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    }

    const page = Number(searchParams.get("page") || 1);
    const per_page = Number(searchParams.get("per_page") || 50);
    const sort = searchParams.get("sort") || "updatedAt.desc";

    const { data, error } = await listSavingsGoals({
      userId,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      per_page: Number.isFinite(per_page) && per_page > 0 ? per_page : 50,
      sort,
    } as any);

    const status = error ? 500 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, targetAmount, deadline, category } = body || {};

    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    if (!title) return NextResponse.json({ data: null, error: "Missing title" }, { status: 400 });
    if (targetAmount === undefined || targetAmount === null) return NextResponse.json({ data: null, error: "Missing targetAmount" }, { status: 400 });
    if (!deadline) return NextResponse.json({ data: null, error: "Missing deadline" }, { status: 400 });
    if (!category) return NextResponse.json({ data: null, error: "Missing category" }, { status: 400 });

    // Convert targetAmount to BigInt safely
    let targetBI: bigint;
    try {
      const num = typeof targetAmount === "string" ? Number(targetAmount) : targetAmount;
      if (!Number.isFinite(num)) throw new Error("Invalid targetAmount");
      targetBI = BigInt(Math.trunc(num));
    } catch (e) {
      return NextResponse.json({ data: null, error: "Invalid targetAmount" }, { status: 400 });
    }

    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ data: null, error: "Invalid deadline" }, { status: 400 });
    }

    const { data, error } = await createSavingsGoal({
      userId,
      title,
      targetAmount: targetBI as any,
      deadline: d as any,
      category,
    });

    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
