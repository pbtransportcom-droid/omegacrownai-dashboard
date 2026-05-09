import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const settings = await prisma.projectSafetySettings.upsert({
    where: { projectId: id },
    update: {},
    create: {
      projectId: id,
    },
  });

  return NextResponse.json({
    ok: true,
    settings,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await req.formData();

  const tradingMaxLeverage = Math.max(
    1,
    Math.min(100, Number(form.get("tradingMaxLeverage") || 5))
  );

  const automationAllowExternal = form.get("automationAllowExternal") === "on";
  const websiteAllowCustomScripts = form.get("websiteAllowCustomScripts") === "on";
  const requireReviewBeforePublish = form.get("requireReviewBeforePublish") === "on";

  const settings = await prisma.projectSafetySettings.upsert({
    where: { projectId: id },
    update: {
      tradingMaxLeverage,
      automationAllowExternal,
      websiteAllowCustomScripts,
      requireReviewBeforePublish,
    },
    create: {
      projectId: id,
      tradingMaxLeverage,
      automationAllowExternal,
      websiteAllowCustomScripts,
      requireReviewBeforePublish,
    },
  });

  await AuditLogger.log({
    projectId: id,
    actorType: "user",
    action: "SAFETY_CHECKED",
    metadata: {
      action: "safety_settings_updated",
      settings,
    },
  });

  return NextResponse.redirect(new URL(`/projects/${id}/settings/safety`, req.url));
}
