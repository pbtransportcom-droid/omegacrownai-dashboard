import { NextResponse } from "next/server";
import { getExecutiveHistory } from "@/lib/sugent/executive/scheduler";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const history = await getExecutiveHistory(id);

  return NextResponse.json(history);
}
