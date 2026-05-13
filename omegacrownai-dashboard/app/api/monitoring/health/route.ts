import { NextResponse } from "next/server";

type HealthCheck = {
  name: string;
  status: "ok" | "warning" | "missing";
  detail: string;
};

function envCheck(name: string, label: string): HealthCheck {
  const value = process.env[name];

  if (!value) {
    return {
      name: label,
      status: "missing",
      detail: `${name} is not configured`
    };
  }

  return {
    name: label,
    status: "ok",
    detail: `${name} is configured`
  };
}

export async function GET() {
  const checks: HealthCheck[] = [
    envCheck("DATABASE_URL", "Database"),
    envCheck("NEXTAUTH_SECRET", "Authentication secret"),
    envCheck("STRIPE_SECRET_KEY", "Stripe billing"),
    envCheck("STRIPE_WEBHOOK_SECRET", "Stripe webhooks"),
    envCheck("OPENAI_API_KEY", "Premium AI provider"),
    envCheck("NEXT_PUBLIC_APP_URL", "Public app URL")
  ];

  const missing = checks.filter((check) => check.status === "missing");

  const body = {
    service: "OmegaCrownAI",
    phase: "v5.7 Phase 78",
    status: missing.length > 0 ? "degraded" : "ok",
    checkedAt: new Date().toISOString(),
    checks,
    incidentPolicy: {
      sev1: "Critical outage, billing failure, data exposure, provider-wide publishing failure, authentication outage",
      sev2: "Major feature degradation, delayed jobs, failed provider subset, elevated error rate",
      sev3: "Minor degradation, isolated customer issue, non-critical alert",
      responseOwner: "OmegaCrownAI operations"
    }
  };

  return NextResponse.json(body, {
    status: missing.length > 0 ? 503 : 200,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
