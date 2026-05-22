import { NextResponse } from "next/server";

import {
  getSalesCommandStatus,
} from "@/lib/executive-command-center/sovereignExecutiveCommandCenter";

export async function GET() {
  return NextResponse.json(
    getSalesCommandStatus(),
  );
}
