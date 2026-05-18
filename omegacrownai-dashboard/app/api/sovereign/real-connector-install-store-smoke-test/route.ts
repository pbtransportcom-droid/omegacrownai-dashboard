import { NextResponse } from "next/server";
import { getRealConnectorInstallStore } from "@/lib/sovereign/real-connector-install-store";

const requiredTables = [
  "connector_installs",
  "connector_permission_grants",
  "connector_healthchecks",
  "connector_disconnect_events",
];

const requiredStatuses = [
  "ready_for_review",
  "validation_failed",
  "approval_required",
  "approved_for_install",
  "installed_limited",
  "installed_active",
  "healthcheck_failed",
  "disconnected",
  "blocked",
];

const requiredCredentialRules = [
  "Do not store raw OAuth tokens in connector install records.",
  "Do not store API keys, passwords, webhook secrets, or private credentials in app tables.",
  "Store credential_ref pointing to a server-side secret manager or encrypted vault.",
  "Disconnect must revoke provider access where possible.",
];

export async function GET() {
  const store = getRealConnectorInstallStore();

  const tableNames = store.tables.map((table) => table.name);
  const missingTables = requiredTables.filter((table) => !tableNames.includes(table));
  const missingStatuses = requiredStatuses.filter((status) => !store.installStatuses.includes(status));
  const missingCredentialRules = requiredCredentialRules.filter(
    (rule) => !store.credentialStorageRules.includes(rule)
  );

  const checks = [
    {
      name: "Install store blueprint is ready",
      passed: store.status === "install_store_blueprint_ready",
      detail: store.status,
    },
    {
      name: "Required install tables present",
      passed: missingTables.length === 0,
      detail: missingTables.length ? `Missing: ${missingTables.join(", ")}` : "All required tables present.",
    },
    {
      name: "Install statuses present",
      passed: missingStatuses.length === 0,
      detail: missingStatuses.length ? `Missing: ${missingStatuses.join(", ")}` : "All statuses present.",
    },
    {
      name: "Credential storage rules present",
      passed: missingCredentialRules.length === 0,
      detail: missingCredentialRules.length
        ? `Missing: ${missingCredentialRules.join(", ")}`
        : "Core credential safety rules present.",
    },
    {
      name: "Install record shape present",
      passed: Boolean(
        store.installRecordShape.installId &&
          store.installRecordShape.credentialRef &&
          store.installRecordShape.permissions.length >= 1 &&
          store.installRecordShape.healthcheck
      ),
      detail: "Install record schema defined.",
    },
    {
      name: "Sample installs present",
      passed: store.sampleInstalls.length >= 2,
      detail: `${store.sampleInstalls.length} sample installs`,
    },
    {
      name: "Required install flow present",
      passed: store.requiredInstallFlow.length >= 9,
      detail: `${store.requiredInstallFlow.length} install flow steps`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v18.2 Phase 202",
    service: "Real Connector Install Store Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    tableCount: store.tables.length,
    installStatusCount: store.installStatuses.length,
    credentialRuleCount: store.credentialStorageRules.length,
    sampleInstallCount: store.sampleInstalls.length,
    installFlowStepCount: store.requiredInstallFlow.length,
    checks,
  });
}
