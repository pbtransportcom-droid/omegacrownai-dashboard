import { NextResponse } from "next/server";
import { getPublicShareBySlug, recordSharePortalEvent } from "@/lib/sugent/distribution/creatorDistributionEngine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const record = await getPublicShareBySlug(slug);

  if (!record?.mediaUrl) {
    return NextResponse.redirect(new URL(`/share/${slug}`, req.url));
  }

  await recordSharePortalEvent({
    slug,
    eventType: "download",
    userAgent: req.headers.get("user-agent"),
    referrer: req.headers.get("referer"),
    metadata: {
      source: "tracked_download_route",
    },
  });

  return NextResponse.redirect(new URL(record.mediaUrl, req.url));
}
