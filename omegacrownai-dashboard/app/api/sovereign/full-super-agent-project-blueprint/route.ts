import { NextResponse } from "next/server";
import { getFullSuperAgentProjectBlueprint } from "@/lib/sovereign/full-super-agent-project-blueprint";

export async function GET() {
  return NextResponse.json(getFullSuperAgentProjectBlueprint());
}
