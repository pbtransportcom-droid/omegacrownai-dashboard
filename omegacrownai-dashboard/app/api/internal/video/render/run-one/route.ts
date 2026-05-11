import { NextResponse } from "next/server";
import { protectInternalRoute } from "@/lib/security/protectedRoute";
import { processNextRenderJob } from "@/lib/sugent/video/render";

export async function POST(req: Request) {
  const protection = await protectInternalRoute(req, {
    rateLimitPrefix: "video-render-run-one",
    limit: 30,
    action: "video_render_run_one",
  });
  if (!protection.ok) return protection.response;

  const result = await processNextRenderJob();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
