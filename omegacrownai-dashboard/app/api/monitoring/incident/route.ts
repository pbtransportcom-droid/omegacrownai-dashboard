import { NextResponse } from "next/server";

type IncidentPayload = {
  title?: string;
  severity?: "sev1" | "sev2" | "sev3";
  source?: string;
  service?: string;
  description?: string;
};

const allowedSeverities = new Set(["sev1", "sev2", "sev3"]);

export async function POST(request: Request) {
  let payload: IncidentPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON payload"
      },
      { status: 400 }
    );
  }

  const severity = payload.severity ?? "sev3";

  if (!allowedSeverities.has(severity)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Severity must be sev1, sev2, or sev3"
      },
      { status: 400 }
    );
  }

  const incident = {
    id: `inc_${Date.now()}`,
    title: payload.title ?? "Untitled incident",
    severity,
    source: payload.source ?? "manual",
    service: payload.service ?? "OmegaCrownAI",
    description: payload.description ?? "No description provided",
    status: "triage",
    receivedAt: new Date().toISOString(),
    response: {
      owner: "OmegaCrownAI operations",
      sev1Target: "Immediate triage, customer-impact assessment, rollback or mitigation decision",
      sev2Target: "Same-day triage, mitigation plan, affected workflow review",
      sev3Target: "Queued review, ticket tracking, scheduled remediation"
    }
  };

  return NextResponse.json(
    {
      ok: true,
      incident
    },
    { status: 202 }
  );
}

export async function GET() {
  return NextResponse.json({
    service: "OmegaCrownAI incident intake",
    phase: "v5.7 Phase 78",
    status: "ready",
    supportedSeverities: ["sev1", "sev2", "sev3"],
    requiredPostFields: ["title", "severity", "source", "service", "description"]
  });
}
