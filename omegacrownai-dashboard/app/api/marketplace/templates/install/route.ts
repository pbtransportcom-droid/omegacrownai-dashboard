import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function defaultDraftKind(domain: string) {
  if (domain === "trading") return "strategy_draft_v1";
  if (domain === "automation") return "automation_flow_v1";
  return "website_draft_v1";
}

export async function POST(req: Request) {
  const body = await req.json();
  const domain = String(body.domain || "website");
  const draftKind = String(body.draftKind || defaultDraftKind(domain));

  const template = await prisma.marketplaceTemplate.create({
    data: {
      name: String(body.name || "Untitled Template"),
      description: String(body.description || ""),
      domain,
      draftKind,
      draft: body.draft || {},
      status: "active",
    },
  });

  return NextResponse.json({ ok: true, template });
}
