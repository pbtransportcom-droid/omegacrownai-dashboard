import { NextResponse } from "next/server";
import { MarketplaceRegistry } from "@/lib/sugent/marketplace/registry";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

  const [agents, tools, templates] = await Promise.all([
    MarketplaceRegistry.listAgents(),
    MarketplaceRegistry.listTools(),
    MarketplaceRegistry.listTemplates(domain),
  ]);

  return NextResponse.json({
    ok: true,
    agents,
    tools,
    templates,
  });
}
