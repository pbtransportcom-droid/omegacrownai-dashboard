export function getPersistentMultiAgentMemoryRegistry() {
  return {
    system: "OmegaCrownAI Persistent Multi-Agent Memory Registry",
    phase: "v17.0 Phase 190",
    status: "registry_ready",
    purpose:
      "Define how OmegaCrownAI agents remember durable project facts, decisions, artifacts, validations, failures, fixes, and customer preferences across sessions without hiding uncertainty or storing unsafe data.",
    corePrinciple:
      "Memory must be scoped, source-labeled, auditable, correctable, and governed. No agent should rely on hidden or unverified memory for customer-critical output.",
    memoryPartitions: [
      {
        partition: "customer_profile_memory",
        ownerRole: "Customer Success Agent",
        purpose:
          "Stores durable customer preferences, company identity, brand tone, delivery standards, and project expectations.",
        examples: [
          "preferred tone",
          "company identity",
          "90–110% full-function output standard",
          "safe production rules",
        ],
        writePolicy: "explicit user request or durable repeated preference",
      },
      {
        partition: "project_memory",
        ownerRole: "Project Manager Agent",
        purpose:
          "Stores project goals, phase history, commits, deployment status, artifact readiness, and next actions.",
        examples: [
          "phase completion",
          "commit hashes",
          "production checks",
          "open risks",
        ],
        writePolicy: "validated project event or user-approved milestone",
      },
      {
        partition: "artifact_memory",
        ownerRole: "Builder Agent",
        purpose:
          "Stores generated artifact metadata, file counts, bundle paths, smoke-test results, readiness scores, and missing-information checks.",
        examples: [
          "website bundle file list",
          "smoke-test result",
          "builder output depth score",
          "download endpoint",
        ],
        writePolicy: "generated only after validation or smoke test",
      },
      {
        partition: "execution_memory",
        ownerRole: "Execution Agent",
        purpose:
          "Stores action attempts, approvals, dry-runs, deployment checks, failures, rollbacks, and audit-linked execution records.",
        examples: [
          "npm build passed",
          "PM2 restart performed",
          "route smoke checks",
          "rollback available",
        ],
        writePolicy: "execution action with audit record",
      },
      {
        partition: "governance_memory",
        ownerRole: "Governance Agent",
        purpose:
          "Stores policies, permission rules, blocked actions, approval gates, safety decisions, and non-negotiable standards.",
        examples: [
          "no PM2 restart before build",
          "no git add .",
          "no live trading by default",
          "manual approval required for high-risk action",
        ],
        writePolicy: "policy update or validated safety rule",
      },
      {
        partition: "learning_ledger",
        ownerRole: "Self-Improvement Agent",
        purpose:
          "Stores what broke, root cause, repair, prevention rule, and whether the prevention rule has been integrated.",
        examples: [
          "build failed due to corrupted variable names",
          "502 caused by restart after failed build",
          "fix: build-before-restart rule",
        ],
        writePolicy: "failure or repair event with root cause",
      },
    ],
    sourceConfidenceLabels: [
      {
        label: "verified_from_source",
        meaning:
          "Confirmed by file, API response, production check, smoke test, commit, or user-provided evidence.",
      },
      {
        label: "user_declared",
        meaning:
          "Directly stated by the user and should be treated as preference or instruction unless contradicted.",
      },
      {
        label: "project_memory",
        meaning:
          "Stored from prior validated project context but should be refreshed for current production state.",
      },
      {
        label: "inferred",
        meaning:
          "Reasoned from available evidence; must not be presented as verified fact.",
      },
      {
        label: "needs_verification",
        meaning:
          "Potentially useful but requires live check, file check, API check, or user confirmation.",
      },
      {
        label: "unsafe_or_blocked",
        meaning:
          "Memory/action cannot be used without explicit review because it may expose secrets, enable unsafe execution, or violate policy.",
      },
    ],
    memoryRecordShape: {
      memoryId: "stable unique memory identifier",
      partition: "memory partition name",
      ownerRole: "agent role allowed to write/update",
      sourceConfidence: "verified_from_source | user_declared | project_memory | inferred | needs_verification | unsafe_or_blocked",
      summary: "short durable memory summary",
      evidence: "file/API/commit/user source pointer when available",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      expiresAt: "optional expiry for stale operational data",
      correctionPolicy: "how memory can be corrected or forgotten",
      auditFields: [
        "actor",
        "writeReason",
        "sourceHash",
        "previousValueHash",
        "newValueHash",
        "reviewRequired",
      ],
    },
    writeGovernanceRules: [
      "Do not store sensitive or personal data unless explicitly requested or operationally required.",
      "Do not store secrets, API keys, passwords, tokens, or private credentials.",
      "Do not store inferred claims as verified facts.",
      "Every durable memory must have a source confidence label.",
      "Every operational memory should expire or be refreshed when stale.",
      "Every correction must preserve an audit trail unless the user asks to forget/delete.",
      "High-risk execution memories require approval gate linkage.",
      "Customer delivery standards can be stored when the user explicitly defines them.",
    ],
    readRules: [
      "Prefer verified_from_source over project_memory.",
      "Use project_memory as context, not final proof.",
      "Mark inferred information clearly.",
      "Refresh production state with live checks when deployment or status may have changed.",
      "Do not use unsafe_or_blocked memory for execution.",
    ],
    replayAndReviewRules: [
      "Every phase completion memory should include commit hash when available.",
      "Every deployment memory should include build result, PM2 status, route checks, and logs.",
      "Every artifact memory should include file count, endpoints, smoke-test results, and missing-functionality status.",
      "Every failure memory should include root cause, repair, and prevention rule.",
      "Every memory record must be inspectable by authorized project roles.",
    ],
    initialRegistryEntries: [
      {
        partition: "governance_memory",
        sourceConfidence: "user_declared",
        summary:
          "OmegaCrownAI must deliver 90–110% customer-ready full-function artifacts, not limited or partial outputs.",
      },
      {
        partition: "governance_memory",
        sourceConfidence: "verified_from_source",
        summary:
          "Production rule: run npm build before PM2 restart; do not restart PM2 after failed build.",
      },
      {
        partition: "learning_ledger",
        sourceConfidence: "verified_from_source",
        summary:
          "Earlier 502 incidents were caused by PM2 restarts after failed builds or missing .next production build.",
      },
      {
        partition: "artifact_memory",
        sourceConfidence: "verified_from_source",
        summary:
          "Website Builder full-stack bundle now targets 14 files including frontend, backend/API starters, admin review, deployment checklist, and smoke-test checklist.",
      },
    ],
    nextImplementationPhases: [
      "Memory Registry API",
      "Memory Smoke Test API",
      "Memory Write Request Schema",
      "Memory Review UI",
      "Memory Correction / Forget Flow",
      "Agent-Specific Memory Views",
      "Execution Audit Memory Integration",
    ],
  };
}
