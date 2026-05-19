import { getRebuildRollbackApiImplementation, simulateArtifactRebuild, simulateArtifactRollback } from "@/lib/sovereign/rebuild-rollback-api-implementation";
import { getArtifactStorageDatabaseWriteApi, simulateArtifactStorageDatabaseWrite } from "@/lib/sovereign/artifact-storage-database-write-api";
import { getCustomerExportAuditPersistence } from "@/lib/sovereign/customer-export-audit-persistence";

export function getRebuildRollbackPersistenceIntegration() {
  const rebuildRollbackApi = getRebuildRollbackApiImplementation();
  const storageWriteApi = getArtifactStorageDatabaseWriteApi();
  const auditPersistence = getCustomerExportAuditPersistence();

  const rebuild = simulateArtifactRebuild({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactId: "artifact_biscuit_shop_v1",
    rebuildPrompt:
      "Rebuild homepage-only biscuit shop draft into full-stack customer-ready artifact with backend, database, admin, preview, deploy, validation, ZIP, storage, and audit.",
    requestedBy: "system",
  });

  const rebuildWrite = simulateArtifactStorageDatabaseWrite({
    projectId: rebuild.receipt.projectId,
    artifactId: rebuild.receipt.newArtifactId,
    requestedBy: "system",
  });

  const rollback = simulateArtifactRollback({
    projectId: "cmoyy1gl700004mkqn7or7hxr",
    artifactId: rebuild.receipt.newArtifactId,
    targetArtifactId: "artifact_biscuit_shop_v1",
    rollbackReason: "Review original homepage-only draft while preserving customer-ready rebuild.",
    requestedBy: "system",
  });

  return {
    system: "OmegaCrownAI Rebuild/Rollback Persistence Integration",
    phase: "v25.9 Phase 279",
    status: "rebuild_rollback_persistence_integration_ready",
    purpose:
      "Define how rebuild and rollback actions persist storage records, history records, audit events, lineage references, customer-ready status, and rollback target status without overwriting previous artifact versions.",
    corePrinciple:
      "Rebuild and rollback persistence must preserve every version, store lineage, audit every action, and never replace a customer-ready artifact with a draft without explicit versioned history.",

    rebuildPersistenceContract: {
      sourceRoute: "/api/projects/[id]/artifacts/[artifactId]/rebuild",
      writeTargets: [
        "ArtifactStorageRecord",
        "ArtifactHistoryRecord",
        "ArtifactExportAuditEvent",
      ],
      requiredLineageFields: [
        "rebuildFromArtifactId",
        "sourceArtifactId",
        "newArtifactId",
        "previousVersion",
        "newVersion",
      ],
      requiredAuditEvents: [
        "artifact_rebuilt",
        "artifact_generated",
        "artifact_validated",
        "artifact_customer_ready_labeled",
      ],
      preservesSourceArtifact: true,
      createsNewVersion: true,
      redacted: true,
    },

    rollbackPersistenceContract: {
      sourceRoute: "/api/projects/[id]/artifacts/[artifactId]/rollback",
      writeTargets: [
        "ArtifactHistoryRecord",
        "ArtifactExportAuditEvent",
      ],
      requiredLineageFields: [
        "rollbackFromArtifactId",
        "targetArtifactId",
        "rollbackVersion",
        "rollbackReason",
      ],
      requiredAuditEvents: [
        "artifact_rollback_requested",
        "artifact_history_viewed",
      ],
      preservesCurrentArtifact: true,
      preservesNewerArtifacts: true,
      requiresRollbackReason: true,
      redacted: true,
    },

    persistenceFlow: [
      "Receive rebuild or rollback receipt.",
      "Normalize projectId and artifact IDs.",
      "Attach lineage fields.",
      "Create storage record for new rebuild artifacts.",
      "Create history record for rebuild or rollback event.",
      "Create export audit event for rebuild or rollback.",
      "Preserve source, target, and newer artifacts.",
      "Keep customer-ready labels per artifact version.",
      "Return redacted persistence receipt.",
    ],

    lineagePersistenceRules: [
      "Rebuild persistence must set rebuildFromArtifactId.",
      "Rollback persistence must set rollbackFromArtifactId.",
      "Previous versions must not be overwritten.",
      "New rebuild versions must receive their own artifactId.",
      "Rollback must create a rollback record/version rather than deleting newer artifacts.",
      "History records must include source and target artifact references.",
      "Audit events must include correlationId and artifact version.",
    ],

    customerReadyPreservationRules: [
      "Customer-ready rebuild artifacts must remain visible after rollback.",
      "Draft rollback targets must remain draft_not_customer_ready.",
      "Rollback to a draft must not relabel that draft customer-ready.",
      "Customer-ready labels must stay attached to the specific artifact version that passed validation.",
      "Rebuild persistence must not delete the blocked source draft.",
      "Rollback persistence must not delete the customer-ready rebuild.",
    ],

    persistenceReceiptShape: {
      persistenceId: "rebuild or rollback persistence receipt id",
      actionType: "rebuild | rollback",
      projectId: "project id",
      sourceArtifactId: "source artifact id",
      targetArtifactId: "target artifact id",
      newArtifactId: "new artifact id when rebuild",
      storageRecordWritten: "boolean",
      historyRecordWritten: "boolean",
      auditEventWritten: "boolean",
      lineageRecorded: "boolean",
      customerReady: "boolean",
      completenessScore: "0-100",
      exportLabel: "export label",
      redacted: true,
    },

    biscuitShopPersistenceExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      rebuild: {
        sourceArtifactId: rebuild.receipt.sourceArtifactId,
        newArtifactId: rebuild.receipt.newArtifactId,
        customerReady: rebuild.receipt.customerReady,
        completenessScore: rebuild.receipt.completenessScore,
        rebuildFromArtifactId: rebuild.receipt.rebuildFromArtifactId,
        storageRecordWritten: rebuildWrite.writeReceipt.storageRecordWritten,
        historyRecordWritten: rebuildWrite.writeReceipt.historyRecordWritten,
        auditEventWritten: rebuildWrite.writeReceipt.auditEventWritten,
        redacted: rebuild.receipt.redacted,
      },
      rollback: {
        targetArtifactId: rollback.receipt.targetArtifactId,
        rollbackFromArtifactId: rollback.receipt.rollbackFromArtifactId,
        rollbackReason: rollback.receipt.rollbackReason,
        customerReady: rollback.receipt.customerReady,
        completenessScore: rollback.receipt.completenessScore,
        newerArtifactsPreserved: rollback.receipt.newerArtifactsPreserved,
        redacted: rollback.receipt.redacted,
      },
    },

    integrationSafetyRules: [
      "Do not overwrite source artifact records.",
      "Do not delete newer artifacts during rollback.",
      "Do not relabel draft rollback targets customer-ready.",
      "Do not persist secrets or raw environment values.",
      "Persist audit events as redacted append-only records.",
      "Keep validation and missing-info report links for every version.",
      "Preserve customer-ready rebuild downloads after rollback.",
    ],

    integrationCompletenessChecks: [
      "Rebuild persistence contract writes storage, history, and audit records.",
      "Rollback persistence contract writes history and audit records.",
      "Persistence flow records lineage and preserves previous versions.",
      "Lineage rules cover rebuildFromArtifactId and rollbackFromArtifactId.",
      "Customer-ready preservation rules protect validated rebuilds and draft target status.",
      "Receipt shape includes write flags, lineage, score, label, and redaction.",
      "Biscuit shop example shows blocked draft rebuilt to customer-ready artifact and safe rollback to draft.",
      "Integration sources confirm rebuild/rollback API, storage write API, and audit persistence are ready.",
    ],

    integrationSources: {
      rebuildRollbackApiStatus: rebuildRollbackApi.status,
      artifactStorageDatabaseWriteApiStatus: storageWriteApi.status,
      customerExportAuditPersistenceStatus: auditPersistence.status,
    },

    nextImplementationPhases: [
      "Full-Function Customer Artifact Release Gate",
      "Production Website/App Generator File Writer",
      "Customer Artifact Billing/Entitlement Gate",
      "Artifact Storage Real Prisma Write Implementation",
      "Customer Artifact Delivery Dashboard",
    ],
  };
}
