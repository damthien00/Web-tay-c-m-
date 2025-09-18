import { NextResponse } from "next/server";
import { updateTransaction, deleteTransaction } from "@/actions/transactions/actions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ data: null, error: "Missing id" }, { status: 400 });

    const body = await request.json();
    const { userId, type, amount, category, description, paymentMethod, location, tags, projectId } = body || {};

    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    let amountBI: bigint | undefined = undefined;
    if (amount !== undefined) {
      try {
        const num = typeof amount === "string" ? Number(amount) : amount;
        if (!Number.isFinite(num)) throw new Error("Invalid amount");
        amountBI = BigInt(Math.trunc(num));
      } catch (e) {
        return NextResponse.json({ data: null, error: "Invalid amount" }, { status: 400 });
      }
    }

    const { data, error } = await updateTransaction(userId, id, {
      ...(type ? { type } : {}),
      ...(amountBI !== undefined ? { amount: amountBI as any } : {}),
      ...(category ? { category } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(Array.isArray(tags) ? { tags } : {}),
      ...(projectId ? { projectId } : {}),
    } as any);

    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ data: null, error: "Missing id" }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });

    const { data, error } = await deleteTransaction(userId, id);
    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
