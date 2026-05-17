import { NextResponse } from "next/server";
import { getEnterpriseReliabilityObservabilityLayer } from "@/lib/sovereign/enterprise-reliability-observability";

const requiredHealthCategories = [
  "application",
  "api",
  "artifact_generation",
  "deployment",
  "security_governance",
  "customer_experience",
];

const requiredSeverityLevels = ["SEV0", "SEV1", "SEV2", "SEV3"];

const requiredErrorClasses = [
  "build_error",
  "runtime_error",
  "api_contract_error",
  "artifact_validation_error",
  "security_or_governance_error",
  "deployment_error",
];

const requiredOperationalChecks = [
  "npm run build passes",
  ".next production build exists",
  "PM2 process is online",
  "/build returns 200",
  "core smoke-test APIs return 200",
  "smoke-test JSON returns ok true",
  "PM2 error logs are clean",
];

export async function GET() {
  const reliability = getEnterpriseReliabilityObservabilityLayer();

  const categoryNames = reliability.serviceHealthCategories.map((item) => item.category);
  const severityNames = reliability.incidentSeverityLevels.map((item) => item.level);
  const errorClassNames = reliability.errorClasses.map((item) => item.class);

  const missingCategories = requiredHealthCategories.filter((item) => !categoryNames.includes(item));
  const missingSeverityLevels = requiredSeverityLevels.filter((item) => !severityNames.includes(item));
  const missingErrorClasses = requiredErrorClasses.filter((item) => !errorClassNames.includes(item));
  const missingOperationalChecks = requiredOperationalChecks.filter(
    (item) => !reliability.requiredOperationalChecks.includes(item)
  );

  const checks = [
    {
      name: "Reliability layer is ready",
      passed: reliability.status === "observability_ready",
      detail: reliability.status,
    },
    {
      name: "Service health categories present",
      passed: missingCategories.length === 0,
      detail: missingCategories.length
        ? `Missing: ${missingCategories.join(", ")}`
        : "All service health categories present.",
    },
    {
      name: "Incident severity levels present",
      passed: missingSeverityLevels.length === 0,
      detail: missingSeverityLevels.length
        ? `Missing: ${missingSeverityLevels.join(", ")}`
        : "All incident severity levels present.",
    },
    {
      name: "Error classes present",
      passed: missingErrorClasses.length === 0,
      detail: missingErrorClasses.length
        ? `Missing: ${missingErrorClasses.join(", ")}`
        : "All error classes present.",
    },
    {
      name: "Metrics registry present",
      passed: reliability.metricsRegistry.length >= 7,
      detail: `${reliability.metricsRegistry.length} metrics`,
    },
    {
      name: "Structured log shape present",
      passed: Boolean(
        reliability.structuredLogShape.logId &&
          reliability.structuredLogShape.correlationId &&
          reliability.structuredLogShape.evidence.length >= 5
      ),
      detail: "Structured log schema defined.",
    },
    {
      name: "Alerting rules present",
      passed: reliability.alertingRules.length >= 7,
      detail: `${reliability.alertingRules.length} alert rules`,
    },
    {
      name: "Reliability scorecard present",
      passed: reliability.reliabilityScorecard.length >= 6,
      detail: `${reliability.reliabilityScorecard.length} scorecard areas`,
    },
    {
      name: "Operational checks present",
      passed: missingOperationalChecks.length === 0,
      detail: missingOperationalChecks.length
        ? `Missing: ${missingOperationalChecks.join(", ")}`
        : "Core operational checks present.",
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.3 Phase 193",
    service: "Enterprise Reliability & Observability Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    serviceHealthCategoryCount: reliability.serviceHealthCategories.length,
    severityLevelCount: reliability.incidentSeverityLevels.length,
    errorClassCount: reliability.errorClasses.length,
    metricCount: reliability.metricsRegistry.length,
    alertRuleCount: reliability.alertingRules.length,
    scorecardAreaCount: reliability.reliabilityScorecard.length,
    operationalCheckCount: reliability.requiredOperationalChecks.length,
    checks,
  });
}
