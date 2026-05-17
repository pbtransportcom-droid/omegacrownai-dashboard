import { NextResponse } from "next/server";
import { getPersistentMultiAgentMemoryRegistry } from "@/lib/sovereign/multi-agent-memory-registry";

const requiredPartitions = [
  "customer_profile_memory",
  "project_memory",
  "artifact_memory",
  "execution_memory",
  "governance_memory",
  "learning_ledger",
];

const requiredConfidenceLabels = [
  "verified_from_source",
  "user_declared",
  "project_memory",
  "inferred",
  "needs_verification",
  "unsafe_or_blocked",
];

const requiredGovernanceRules = [
  "Do not store secrets, API keys, passwords, tokens, or private credentials.",
  "Do not store inferred claims as verified facts.",
  "Every durable memory must have a source confidence label.",
  "High-risk execution memories require approval gate linkage.",
];

export async function GET() {
  const registry = getPersistentMultiAgentMemoryRegistry();

  const partitionNames = registry.memoryPartitions.map((item) => item.partition);
  const labelNames = registry.sourceConfidenceLabels.map((item) => item.label);

  const missingPartitions = requiredPartitions.filter(
    (item) => !partitionNames.includes(item)
  );

  const missingLabels = requiredConfidenceLabels.filter(
    (item) => !labelNames.includes(item)
  );

  const missingGovernanceRules = requiredGovernanceRules.filter(
    (item) => !registry.writeGovernanceRules.includes(item)
  );

  const checks = [
    {
      name: "Registry is ready",
      passed: registry.status === "registry_ready",
      detail: registry.status,
    },
    {
      name: "Required memory partitions present",
      passed: missingPartitions.length === 0,
      detail: missingPartitions.length
        ? `Missing: ${missingPartitions.join(", ")}`
        : "All required partitions present.",
    },
    {
      name: "Source confidence labels present",
      passed: missingLabels.length === 0,
      detail: missingLabels.length
        ? `Missing: ${missingLabels.join(", ")}`
        : "All confidence labels present.",
    },
    {
      name: "Memory record shape present",
      passed: Boolean(
        registry.memoryRecordShape.memoryId &&
          registry.memoryRecordShape.partition &&
          registry.memoryRecordShape.sourceConfidence &&
          registry.memoryRecordShape.auditFields.length >= 5
      ),
      detail: "Memory record schema defined.",
    },
    {
      name: "Write governance rules present",
      passed: missingGovernanceRules.length === 0,
      detail: missingGovernanceRules.length
        ? `Missing: ${missingGovernanceRules.join(", ")}`
        : "Core governance rules present.",
    },
    {
      name: "Read rules present",
      passed: registry.readRules.length >= 5,
      detail: `${registry.readRules.length} read rules`,
    },
    {
      name: "Replay and review rules present",
      passed: registry.replayAndReviewRules.length >= 5,
      detail: `${registry.replayAndReviewRules.length} replay/review rules`,
    },
    {
      name: "Initial registry entries present",
      passed: registry.initialRegistryEntries.length >= 4,
      detail: `${registry.initialRegistryEntries.length} initial entries`,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;

  return NextResponse.json({
    ok: checks.every((check) => check.passed),
    phase: "v17.0 Phase 190",
    service: "Persistent Multi-Agent Memory Registry Smoke Test",
    totalChecks: checks.length,
    passedChecks,
    failedChecks: checks.length - passedChecks,
    memoryPartitionCount: registry.memoryPartitions.length,
    confidenceLabelCount: registry.sourceConfidenceLabels.length,
    writeRuleCount: registry.writeGovernanceRules.length,
    readRuleCount: registry.readRules.length,
    replayRuleCount: registry.replayAndReviewRules.length,
    initialEntryCount: registry.initialRegistryEntries.length,
    checks,
  });
}
