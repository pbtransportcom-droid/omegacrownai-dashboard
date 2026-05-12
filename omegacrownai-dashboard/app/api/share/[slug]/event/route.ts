import { NextResponse } from "next/server";
import { recordSharePortalEvent } from "@/lib/sugent/distribution/creatorDistributionEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || null;

  const result = await recordSharePortalEvent({
    slug,
    eventType: body.eventType ? String(body.eventType) : "view",
    userAgent: req.headers.get("user-agent"),
    ip,
    referrer: req.headers.get("referer"),
    metadata: body.metadata || {},
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 404,
  });
}
