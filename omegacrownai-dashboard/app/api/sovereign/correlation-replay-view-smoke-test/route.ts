import { NextResponse } from "next/server";
import { getCorrelationReplayViewBlueprint } from "@/lib/sovereign/correlation-replay-view";

const requiredPanels = [
  "Replay Header",
  "Event Sequence Timeline",
  "Evidence Chain",
  "Approval / Blocked Markers",
  "Recovery / Rollback",
  "Redacted Export",
];

const requiredEventTypes = [
  "connector_permission_decision",
  "connector_install",
  "connector_disconnect",
  "execution_action_run",
  "memory_write",
  "deployment",
  "incident",
  "governance_decision",
];

const requiredReplayRules = [
  "Replay must be grouped by correlationId.",
  "Replay events must be ordered by createdAt and sequence.",
  "Replay must show redacted records only.",
  "Replay must never show raw secrets, tokens, passwords, API keys, authorization headers, or private keys.",
  "Blocked and approval-required events must be visually marked.",
];

export async function GET() {
  const replay = getCorrelationReplayViewBlueprint();

  const panelNames = replay.replayPanels.map((panel) => panel.panel);
  const missingPanels = requiredPanels.filter((panel) => !panelNames.includes(panel));
  const missingEventTypes = requiredEventTypes.filter((eventType) => !replay.eventTypes.includes(eventType));
  const missingReplayRules = requiredReplayRules.filter((rule) => !replay.replayRules.includes(rule));

  const checks = [
    {
      name: "Correlation replay blueprint is ready",
      passed: replay.status === "correlation_replay_blueprint_ready",
      detail: replay.status,
    },
    {
      name: "Required replay panels present",
      passed: missingPanels.length === 0,
      detail: missingPanels.length ? `Missing: ${missingPanels.join(", ")}` : "All panels present.",
    },
    {
      name: "Required event types present",
      passed: missingEventTypes.length === 0,
      detail: missingEventTypes.length ? `Missing: ${missingEventTypes.join(", ")}` : "All event types present.",
    },
    {
      name: "Replay event shape present",
      passed: Boolean(
        replay.replayEventShape.sequence &&
          replay.replayEventShape.auditId &&
          replay.replayEventShape.metadataRef &&
          replay.replayEventShape.redacted
      ),
      detail: "Replay event shape defined.",
    },
    {
      name: "Sample replay events present",
      passed:
        replay.sampleReplay.events.length >= 3 &&
        replay.sampleReplay.events.every((event) => event.redacted === true),
      detail: `${replay.sampleReplay.events.length} sample events`,
    },
    {
      name: "Replay rules present",
      passed: missingReplayRules.length === 0,
      detail: missingReplayRules.length ? `Missing: ${missingReplayRules.join(", ")}` : "Core replay rules present.",
    },
    {
      name: "Export package excludes secrets",
      passed:
        replay.exportPackageShape.excludedSensitiveData.includes("raw OAuth tokens") &&
        replay.exportPackageShape.excludedSensitiveData.includes("API keys") &&
        replay.exportPackageShape.excludedSensitiveData.includes("authorization headers"),
      detail: "Sensitive exclusions present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.8 Phase 208",
    service: "Correlation Replay View Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    replayPanelCount: replay.replayPanels.length,
    eventTypeCount: replay.eventTypes.length,
    sampleReplayEventCount: replay.sampleReplay.events.length,
    replayRuleCount: replay.replayRules.length,
    exportSensitiveExclusionCount: replay.exportPackageShape.excludedSensitiveData.length,
    checks,
  });
}
