import { NextResponse } from "next/server";
import {
  humanReviewRules,
  researchDisclosure
} from "@/lib/platform-limitations/platform-limitation-controls";

export async function GET() {
  return NextResponse.json(
    {
      phase: "v7.5 Phase 96",
      service: "Research disclosure and human review",
      researchDisclosure,
      humanReviewRules
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
