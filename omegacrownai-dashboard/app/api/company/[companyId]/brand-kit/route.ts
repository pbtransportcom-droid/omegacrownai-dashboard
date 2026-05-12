import { NextResponse } from "next/server";
import { getBrandKitDashboard, upsertCompanyBrandKit } from "@/lib/sugent/brand-kit/brandKitEngine";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const result = await getBrandKitDashboard(companyId);

  return NextResponse.json(result);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  const kit = await upsertCompanyBrandKit({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    input: {
      name: body.name ? String(body.name) : undefined,
      primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
      secondaryColor: body.secondaryColor ? String(body.secondaryColor) : undefined,
      accentColor: body.accentColor ? String(body.accentColor) : undefined,
      backgroundColor: body.backgroundColor ? String(body.backgroundColor) : undefined,
      textColor: body.textColor ? String(body.textColor) : undefined,
      logoUrl: body.logoUrl ? String(body.logoUrl) : null,
      logoPlacement: body.logoPlacement ? String(body.logoPlacement) : undefined,
      fontStyle: body.fontStyle ? String(body.fontStyle) : undefined,
      templateStyle: body.templateStyle ? String(body.templateStyle) : undefined,
      createdBy: body.createdBy ? String(body.createdBy) : "system-owner",
    },
  });

  return NextResponse.json({
    ok: true,
    kit,
  });
}
