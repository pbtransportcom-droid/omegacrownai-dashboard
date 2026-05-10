import { NextResponse } from "next/server";
import { getDailyExecutiveReport } from "@/lib/sugent/executive/loop";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getDailyExecutiveReport(id);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
