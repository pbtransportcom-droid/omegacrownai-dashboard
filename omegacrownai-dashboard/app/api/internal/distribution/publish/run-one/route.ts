import { NextResponse } from "next/server";
import { protectInternalRoute } from "@/lib/security/protectedRoute";
import { processNextPublishJob } from "@/lib/sugent/distribution/distributionEngine";

export async function POST(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "publish-run-one",
    limit: 60,
    action: "publish_run_one",
  });
  if (!protection.ok) return protection.response;

  const result = await processNextPublishJob();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
