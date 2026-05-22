import { NextResponse } from "next/server";

import {
  generateStrategicPlan,
} from "@/lib/executive-command-center/sovereignExecutiveCommandCenter";

export async function GET() {
  return NextResponse.json(
    generateStrategicPlan(),
  );
}
