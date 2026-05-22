import { NextResponse } from "next/server";

import {
  getMarketingWarRoomStatus,
} from "@/lib/executive-command-center/sovereignExecutiveCommandCenter";

export async function GET() {
  return NextResponse.json(
    getMarketingWarRoomStatus(),
  );
}
