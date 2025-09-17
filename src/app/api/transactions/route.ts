import { NextResponse } from "next/server";
import { createTransaction } from "@/actions/transactions/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      amount,
      category,
      description,
      paymentMethod,
      location,
      tags,
      projectId,
    } = body || {};

    if (!userId) {
      return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    }
    if (!type || (type !== "income" && type !== "expense")) {
      return NextResponse.json({ data: null, error: "Invalid type" }, { status: 400 });
    }
    if (amount === undefined || amount === null) {
      return NextResponse.json({ data: null, error: "Missing amount" }, { status: 400 });
    }

    // Convert amount to BigInt safely (server action expects BigInt)
    let amountBI: bigint;
    try {
      const num = typeof amount === "string" ? Number(amount) : amount;
      if (!Number.isFinite(num)) throw new Error("Invalid amount");
      amountBI = BigInt(Math.trunc(num));
    } catch (e) {
      return NextResponse.json({ data: null, error: "Invalid amount" }, { status: 400 });
    }

    const { data, error } = await createTransaction({
      userId,
      type,
      amount: amountBI as any,
      category,
      description,
      paymentMethod,
      location,
      tags,
      projectId,
    });

    const status = error ? 400 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
