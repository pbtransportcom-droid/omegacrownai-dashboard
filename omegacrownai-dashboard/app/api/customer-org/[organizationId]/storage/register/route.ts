import { NextResponse } from "next/server";
import { registerCustomerStorageAsset } from "@/lib/sugent/customer-storage/customerStorageEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.fileName) {
    return NextResponse.json({ ok: false, error: "fileName is required" }, { status: 400 });
  }

  const result = await registerCustomerStorageAsset({
    organizationId,
    companyId: body.companyId ? String(body.companyId) : null,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    assetType: body.assetType ? String(body.assetType) : null,
    fileName: String(body.fileName),
    localPath: body.localPath ? String(body.localPath) : null,
    publicUrl: body.publicUrl ? String(body.publicUrl) : null,
    storageProvider: body.storageProvider ? String(body.storageProvider) : "local",
    bucket: body.bucket ? String(body.bucket) : null,
    objectKey: body.objectKey ? String(body.objectKey) : null,
    mimeType: body.mimeType ? String(body.mimeType) : null,
    visibility: body.visibility ? String(body.visibility) : "public",
    metadata: body.metadata || {},
  });

  return NextResponse.json(result);
}
