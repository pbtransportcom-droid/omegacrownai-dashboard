import { NextResponse } from "next/server";

import {
  openExecutiveDecisionRoom,
} from "@/lib/executive-command-center/sovereignExecutiveCommandCenter";

export async function GET() {
  return NextResponse.json(
    openExecutiveDecisionRoom(),
  );
}
