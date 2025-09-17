import { NextResponse } from "next/server";
import { createProjectExpense, listProjectExpenses } from "@/actions/project-expenses/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    const projectId = searchParams.get("projectId") || undefined;
    const category = searchParams.get("category") || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Number(searchParams.get("page") || 1);
    const per_page = Number(searchParams.get("per_page") || 100);
    const sort = searchParams.get("sort") || "date.desc";

    const { data, error } = await listProjectExpenses({
      userId,
      projectId: projectId || undefined,
      category: category || undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      per_page: Number.isFinite(per_page) && per_page > 0 ? per_page : 100,
      sort,
    } as any);

    const statusCode = error ? 500 : 200;
    return NextResponse.json({ data, error }, { status: statusCode });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, projectId, amount, description, category, date } = body || {};

    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    if (!projectId) return NextResponse.json({ data: null, error: "Missing projectId" }, { status: 400 });
    if (amount === undefined || amount === null) return NextResponse.json({ data: null, error: "Missing amount" }, { status: 400 });
    if (!category) return NextResponse.json({ data: null, error: "Missing category" }, { status: 400 });
    if (!date) return NextResponse.json({ data: null, error: "Missing date" }, { status: 400 });

    let amountBI: bigint;
    try {
      const num = typeof amount === "string" ? Number(amount) : amount;
      if (!Number.isFinite(num)) throw new Error("Invalid amount");
      amountBI = BigInt(Math.trunc(num));
    } catch (e) {
      return NextResponse.json({ data: null, error: "Invalid amount" }, { status: 400 });
    }

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return NextResponse.json({ data: null, error: "Invalid date" }, { status: 400 });

    const { data, error } = await createProjectExpense({
      userId,
      projectId,
      amount: amountBI as any,
      description,
      category,
      date: d as any,
    });

    const statusCode = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status: statusCode });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
