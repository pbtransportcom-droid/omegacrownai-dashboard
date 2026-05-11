import { NextResponse } from "next/server";
import { protectInternalRoute } from "@/lib/security/protectedRoute";
import { processNextAssetGenerationJob } from "@/lib/sugent/video/assetEngine";

export async function POST(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "video-asset-run-one",
    limit: 60,
    action: "video_asset_run_one",
  });
  if (!protection.ok) return protection.response;

  const result = await processNextAssetGenerationJob();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
