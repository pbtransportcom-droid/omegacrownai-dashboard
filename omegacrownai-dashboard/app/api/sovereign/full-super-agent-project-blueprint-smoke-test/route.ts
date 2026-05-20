import { NextResponse } from "next/server";
import { getFullSuperAgentProjectBlueprint } from "@/lib/sovereign/full-super-agent-project-blueprint";

export async function GET() {
  const blueprint = getFullSuperAgentProjectBlueprint();

  return NextResponse.json({
    ok: Boolean(
      blueprint.ok &&
        blueprint.version &&
        blueprint.superAgentCapabilities &&
        blueprint.productionRules.length > 0
    ),
    version: blueprint.version,
    checks: {
      hasCapabilities: Boolean(blueprint.superAgentCapabilities),
      hasProductionRules: blueprint.productionRules.length > 0,
      hasOperatingModes: blueprint.operatingModes.length > 0,
    },
  });
}
