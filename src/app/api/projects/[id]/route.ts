import { NextResponse } from "next/server";
import { deleteProject, updateProject } from "@/actions/projects/actions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, name, description, budget, status, startDate, endDate, category, currency } = body || {};
    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    let budgetBI: bigint | undefined = undefined;
    if (budget !== undefined) {
      try {
        const num = typeof budget === "string" ? Number(budget) : budget;
        if (!Number.isFinite(num)) throw new Error("Invalid budget");
        budgetBI = BigInt(Math.trunc(num));
      } catch (e) {
        return NextResponse.json({ data: null, error: "Invalid budget" }, { status: 400 });
      }
    }

    const sd = startDate ? new Date(startDate) : undefined;
    if (startDate && Number.isNaN(sd!.getTime())) return NextResponse.json({ data: null, error: "Invalid startDate" }, { status: 400 });
    const ed = endDate ? new Date(endDate) : undefined;
    if (endDate && Number.isNaN(ed!.getTime())) return NextResponse.json({ data: null, error: "Invalid endDate" }, { status: 400 });

    const { data, error } = await updateProject(userId, id, {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(budgetBI !== undefined ? { budget: budgetBI as any } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(sd ? { startDate: sd as any } : {}),
      ...(ed !== undefined ? { endDate: ed as any } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(currency !== undefined ? { currency } : {}),
    } as any);

    const statusCode = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status: statusCode });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    const { data, error } = await deleteProject(userId, id);
    const statusCode = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status: statusCode });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
