import { NextResponse } from "next/server";

import {
  runGlobalOrchestration,
} from "@/lib/executive-command-center/sovereignExecutiveCommandCenter";

export async function GET() {
  return NextResponse.json(
    runGlobalOrchestration(),
  );
}
