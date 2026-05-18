import { getPersistentArtifactStorage } from "@/lib/sovereign/persistent-artifact-storage";
import { getCustomerExportAuditTrail } from "@/lib/sovereign/customer-export-audit-trail";
import { getProductionArtifactWriterIntegration } from "@/lib/sovereign/production-artifact-writer-integration";
import { getArtifactRebuildRollbackControls } from "@/lib/sovereign/artifact-rebuild-rollback-controls";

export function getPersistentArtifactDatabaseMigration() {
  const storage = getPersistentArtifactStorage();
  const auditTrail = getCustomerExportAuditTrail();
  const production = getProductionArtifactWriterIntegration();
  const rebuildRollback = getArtifactRebuildRollbackControls();

  return {
    system: "OmegaCrownAI Persistent Artifact Database Migration",
    phase: "v25.3 Phase 273",
    status: "persistent_artifact_database_migration_ready",
    purpose:
      "Define the persistent database migration needed to store generated artifact storage records, artifact history records, customer export audit events, version lineage, validation status, preview/download/report paths, and redacted export metadata.",
    corePrinciple:
      "Generated artifacts must be stored in durable database records, not only in memory or static plans. Records must be versioned, redacted, queryable, and linked to project, storage, audit, rebuild, rollback, preview, download, and distribution paths.",

    migrationModels: [
      {
        model: "ArtifactStorageRecord",
        purpose:
          "Stores one durable storage record per generated artifact version.",
        fields: [
          "id",
          "projectId",
          "artifactId",
          "version",
          "artifactType",
          "title",
          "customerReady",
          "completenessScore",
          "exportLabel",
          "storageRoot",
          "sourceRoot",
          "zipPath",
          "manifestPath",
          "validationReportPath",
          "missingInfoReportPath",
          "deploymentGuidePath",
          "previewPath",
          "adminPreviewPath",
          "downloadPath",
          "historyPath",
          "distributionPath",
          "rebuildFromArtifactId",
          "rollbackFromArtifactId",
          "redacted",
          "createdAt",
          "updatedAt",
        ],
      },
      {
        model: "ArtifactHistoryRecord",
        purpose:
          "Stores artifact timeline cards and version lineage for project history UI.",
        fields: [
          "id",
          "projectId",
          "artifactId",
          "version",
          "title",
          "artifactType",
          "customerReady",
          "completenessScore",
          "statusBadge",
          "validationStatus",
          "previewPath",
          "adminPreviewPath",
          "downloadPath",
          "manifestPath",
          "validationReportPath",
          "missingInfoReportPath",
          "blockedReasonsJson",
          "missingLayersJson",
          "rebuildFromArtifactId",
          "rollbackFromArtifactId",
          "redacted",
          "createdAt",
          "updatedAt",
        ],
      },
      {
        model: "ArtifactExportAuditEvent",
        purpose:
          "Stores redacted customer export/download/preview/rebuild/rollback audit events.",
        fields: [
          "id",
          "eventType",
          "eventSource",
          "projectId",
          "artifactId",
          "artifactVersion",
          "artifactType",
          "customerReady",
          "completenessScore",
          "exportLabel",
          "actorId",
          "actorType",
          "correlationId",
          "previewPath",
          "downloadPath",
          "historyPath",
          "distributionPath",
          "validationReportPath",
          "missingInfoReportPath",
          "rebuildFromArtifactId",
          "rollbackFromArtifactId",
          "blockedReasonsJson",
          "redacted",
          "createdAt",
        ],
      },
    ],

    relationshipPlan: [
      "Project has many ArtifactStorageRecord rows.",
      "Project has many ArtifactHistoryRecord rows.",
      "Project has many ArtifactExportAuditEvent rows.",
      "ArtifactHistoryRecord links to ArtifactStorageRecord by projectId + artifactId + version.",
      "ArtifactExportAuditEvent links to artifact by projectId + artifactId + artifactVersion.",
      "Rebuild lineage uses rebuildFromArtifactId.",
      "Rollback lineage uses rollbackFromArtifactId.",
    ],

    indexPlan: [
      {
        model: "ArtifactStorageRecord",
        indexes: [
          "projectId",
          "artifactId",
          "projectId_version",
          "projectId_customerReady",
          "projectId_createdAt",
          "rebuildFromArtifactId",
          "rollbackFromArtifactId",
        ],
      },
      {
        model: "ArtifactHistoryRecord",
        indexes: [
          "projectId",
          "artifactId",
          "projectId_version",
          "projectId_statusBadge",
          "projectId_createdAt",
          "rebuildFromArtifactId",
          "rollbackFromArtifactId",
        ],
      },
      {
        model: "ArtifactExportAuditEvent",
        indexes: [
          "projectId",
          "artifactId",
          "eventType",
          "correlationId",
          "projectId_createdAt",
          "projectId_eventType",
        ],
      },
    ],

    migrationRolloutPlan: [
      "Add database models for artifact storage, history, and export audit events.",
      "Add indexes for project, artifact, version, status, event type, and correlation queries.",
      "Deploy migration without deleting existing runtime upload files.",
      "Keep current file-system paths as source of truth during migration rollout.",
      "Write new artifact records only after build passes.",
      "Backfill recent generated artifacts if metadata is available.",
      "Enable read APIs to prefer database records and fall back to static plans.",
      "Enable write APIs after smoke tests pass.",
    ],

    rollbackPlan: [
      "Do not drop existing upload folders.",
      "Disable database write routes first.",
      "Fall back to static artifact plans and file-system ZIP route.",
      "Preserve created artifact records for audit unless explicit rollback migration is approved.",
      "If migration fails, revert code commit and keep current artifact download route active.",
      "Do not delete customer-ready artifact ZIPs or reports.",
    ],

    safeDatabaseRules: [
      "Do not store raw .env values.",
      "Do not store secrets, tokens, API keys, passwords, or private keys.",
      "Do not store full customer PII payloads in audit events.",
      "Store IDs, paths, statuses, scores, labels, and redacted metadata only.",
      "Use JSON fields only for blocked reasons and missing layers, not secrets.",
      "Mark all artifact/export audit records as redacted.",
      "Preserve customer-ready records across rebuilds and rollbacks.",
      "Do not overwrite artifact versions in place.",
    ],

    prismaModelBlueprint: {
      ArtifactStorageRecord: {
        id: "String @id @default(cuid())",
        projectId: "String @index",
        artifactId: "String @index",
        version: "Int",
        customerReady: "Boolean @default(false)",
        completenessScore: "Int @default(0)",
        exportLabel: "String",
        redacted: "Boolean @default(true)",
      },
      ArtifactHistoryRecord: {
        id: "String @id @default(cuid())",
        projectId: "String @index",
        artifactId: "String @index",
        version: "Int",
        statusBadge: "String",
        validationStatus: "String",
        redacted: "Boolean @default(true)",
      },
      ArtifactExportAuditEvent: {
        id: "String @id @default(cuid())",
        eventType: "String @index",
        projectId: "String @index",
        artifactId: "String @index",
        correlationId: "String @index",
        redacted: "Boolean @default(true)",
      },
    },

    biscuitShopMigrationExample: {
      projectId: "cmoyy1gl700004mkqn7or7hxr",
      storageRecord: {
        artifactId: storage.biscuitShopStorageExample.artifactId,
        customerReady: storage.biscuitShopStorageExample.customerReady,
        completenessScore: storage.biscuitShopStorageExample.completenessScore,
        exportLabel: storage.biscuitShopStorageExample.exportLabel,
        redacted: true,
      },
      auditEvent: {
        artifactId: auditTrail.biscuitShopAuditExample.artifactId,
        eventType: "artifact_exported",
        customerReady: auditTrail.biscuitShopAuditExample.customerReady,
        completenessScore: auditTrail.biscuitShopAuditExample.completenessScore,
        exportLabel: auditTrail.biscuitShopAuditExample.exportLabel,
        redacted: true,
      },
    },

    databaseMigrationCompletenessChecks: [
      "Migration models include storage, history, and export audit records.",
      "Relationship plan links projects, artifacts, versions, rebuilds, rollbacks, and audit events.",
      "Index plan supports project, artifact, version, status, event type, and correlation lookups.",
      "Rollout plan avoids deleting existing runtime artifact files.",
      "Rollback plan preserves customer-ready ZIPs and reports.",
      "Safe database rules block secrets and raw environment values.",
      "Prisma model blueprint includes required redacted records.",
      "Biscuit shop migration example includes customer-ready storage and export audit event.",
      "Integration sources confirm persistent storage, audit trail, production writer, and rebuild/rollback are ready.",
    ],

    integrationSources: {
      persistentArtifactStorageStatus: storage.status,
      customerExportAuditTrailStatus: auditTrail.status,
      productionArtifactWriterIntegrationStatus: production.status,
      artifactRebuildRollbackControlsStatus: rebuildRollback.status,
    },

    nextImplementationPhases: [
      "Rebuild/Rollback API Implementation",
      "Production Artifact Writer Execution Route",
      "Distribution Page Live UI Injection",
      "Customer Export Audit Persistence",
      "Artifact Storage Database Write API",
    ],
  };
}
