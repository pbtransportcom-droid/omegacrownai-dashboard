import { NextResponse } from "next/server";
import { queueCustomerPublishingJob } from "@/lib/sugent/customer-publishing/customerPublishingEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await queueCustomerPublishingJob({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    externalAccountId: body.externalAccountId ? String(body.externalAccountId) : null,
    exportId: body.exportId ? String(body.exportId) : null,
    projectId: body.projectId ? String(body.projectId) : null,
    projectType: body.projectType ? String(body.projectType) : null,
    provider: body.provider ? String(body.provider) : "webhook",
    title: body.title ? String(body.title) : null,
    description: body.description ? String(body.description) : null,
    caption: body.caption ? String(body.caption) : null,
    mediaUrl: body.mediaUrl ? String(body.mediaUrl) : null,
    destinationUrl: body.destinationUrl ? String(body.destinationUrl) : null,
    createdByUserId: body.createdByUserId ? String(body.createdByUserId) : null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
