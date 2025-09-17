import { NextResponse } from "next/server";
import {recentTransactions} from "@/actions/transactions/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    }
    const limit = Number(searchParams.get("limit") || 5);

    const { data, error } = await recentTransactions(userId, Number.isFinite(limit) ? limit : 5);
    const status = error ? 500 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
