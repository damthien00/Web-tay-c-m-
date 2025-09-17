import { NextResponse } from "next/server";
import { getTotalsByDateRange } from "@/actions/analytics/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ data: null, error: "Missing userId" }, { status: 400 });
    }

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const { data, error } = await getTotalsByDateRange({
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    } as any);

    const status = error ? 500 : 200;
    return NextResponse.json({ data, error }, { status });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e?.message || "Internal error" }, { status: 500 });
  }
}
