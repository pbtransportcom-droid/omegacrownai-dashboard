import { NextResponse } from "next/server";

import {
  getSovereignExecutiveCommandCenterStatus,
} from "@/lib/executive-command-center/sovereignExecutiveCommandCenter";

export async function GET() {
  return NextResponse.json(
    getSovereignExecutiveCommandCenterStatus(),
  );
}
