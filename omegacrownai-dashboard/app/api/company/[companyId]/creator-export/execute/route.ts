import { NextResponse } from "next/server";
import { executeCreatorExport } from "@/lib/sugent/creator-export/creatorExportEngine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!body.projectId) {
    return NextResponse.json(
      { ok: false, error: "projectId is required" },
      { status: 400 }
    );
  }

  const result = await executeCreatorExport({
    companyId,
    workspaceId: body.workspaceId ? String(body.workspaceId) : null,
    projectId: String(body.projectId),
    projectType: body.projectType ? String(body.projectType) : "video",
    actorId: body.actorId ? String(body.actorId) : "system-owner",
    actorType: body.actorType ? String(body.actorType) : "system",
    format: body.format ? String(body.format) : undefined,
    audioStyle: {
      musicMood: body.musicMood ? String(body.musicMood) : "cinematic",
      voiceSpeed: body.voiceSpeed ? Number(body.voiceSpeed) : 145,
      voicePitch: body.voicePitch ? Number(body.voicePitch) : 45,
      introOutro: body.introOutro === false || body.introOutro === "false" ? false : true,
      musicVolume: body.musicVolume ? Number(body.musicVolume) : 1,
      voiceVolume: body.voiceVolume ? Number(body.voiceVolume) : 1,
    },
    brandOverrides: {
      primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
      secondaryColor: body.secondaryColor ? String(body.secondaryColor) : undefined,
      accentColor: body.accentColor ? String(body.accentColor) : undefined,
      backgroundColor: body.backgroundColor ? String(body.backgroundColor) : undefined,
      textColor: body.textColor ? String(body.textColor) : undefined,
      logoUrl: body.logoUrl ? String(body.logoUrl) : undefined,
      logoPlacement: body.logoPlacement ? String(body.logoPlacement) : undefined,
      fontStyle: body.fontStyle ? String(body.fontStyle) : undefined,
      templateStyle: body.templateStyle ? String(body.templateStyle) : undefined,
    },
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 409,
  });
}
