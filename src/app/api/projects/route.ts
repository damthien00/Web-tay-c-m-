import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/actions/projects/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    const page = Number(searchParams.get("page") || 1);
    const per_page = Number(searchParams.get("per_page") || 50);
    const sort = searchParams.get("sort") || "createdAt.desc";
    const q = searchParams.get("q") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const currency = (searchParams.get("currency") as any) || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const { data, error } = await listProjects({
      userId,
      q,
      status: status || undefined,
      category: category || undefined,
      currency,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      per_page: Number.isFinite(per_page) && per_page > 0 ? per_page : 50,
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
    const { userId, name, description, budget, status, startDate, endDate, category, currency } = body || {};

    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    if (!name) return NextResponse.json({ data: null, error: "Missing name" }, { status: 400 });
    if (budget === undefined || budget === null) return NextResponse.json({ data: null, error: "Missing budget" }, { status: 400 });
    if (!status) return NextResponse.json({ data: null, error: "Missing status" }, { status: 400 });
    if (!startDate) return NextResponse.json({ data: null, error: "Missing startDate" }, { status: 400 });
    if (!category) return NextResponse.json({ data: null, error: "Missing category" }, { status: 400 });

    let budgetBI: bigint;
    try {
      const num = typeof budget === "string" ? Number(budget) : budget;
      if (!Number.isFinite(num)) throw new Error("Invalid budget");
      budgetBI = BigInt(Math.trunc(num));
    } catch (e) {
      return NextResponse.json({ data: null, error: "Invalid budget" }, { status: 400 });
    }

    const sd = new Date(startDate);
    if (Number.isNaN(sd.getTime())) return NextResponse.json({ data: null, error: "Invalid startDate" }, { status: 400 });
    const ed = endDate ? new Date(endDate) : undefined;
    if (endDate && Number.isNaN(ed!.getTime())) return NextResponse.json({ data: null, error: "Invalid endDate" }, { status: 400 });

    const { data, error } = await createProject({
      userId,
      name,
      description,
      budget: budgetBI as any,
      status,
      startDate: sd as any,
      endDate: ed as any,
      category,
      currency: currency || "VND",
    });

    const statusCode = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status: statusCode });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
