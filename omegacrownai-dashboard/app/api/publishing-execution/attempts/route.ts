import { NextResponse } from "next/server";
import { createPublishingExecutionAttempt } from "@/lib/sugent/publishing-execution/publishingExecutionEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (!body.organizationId || !body.provider) {
    return NextResponse.json(
      { ok: false, error: "organizationId and provider are required" },
      { status: 400 }
    );
  }

  const result = await createPublishingExecutionAttempt({
    organizationId: String(body.organizationId),
    userId: body.userId ? String(body.userId) : null,
    companyId: body.companyId ? String(body.companyId) : null,
    connectionId: body.connectionId ? String(body.connectionId) : null,
    publishJobId: body.publishJobId ? String(body.publishJobId) : null,
    exportId: body.exportId ? String(body.exportId) : null,
    provider: String(body.provider),
    title: body.title ? String(body.title) : null,
    description: body.description ? String(body.description) : null,
    mediaUrl: body.mediaUrl ? String(body.mediaUrl) : null,
    thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl) : null,
    caption: body.caption ? String(body.caption) : null,
    hashtags: body.hashtags || [],
    createdBy: body.createdBy ? String(body.createdBy) : "system",
    actorType: body.actorType ? String(body.actorType) : "system",
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
