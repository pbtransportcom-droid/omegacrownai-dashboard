import { NextResponse } from "next/server";
import { getGitHubConnectorBlueprint } from "@/lib/sovereign/github-connector-blueprint";

export async function GET() {
  const github = getGitHubConnectorBlueprint();

  return NextResponse.json({
    ok: true,
    phase: "v17.9 Phase 199",
    service: "GitHub Connector Blueprint",
    github,
  });
}
