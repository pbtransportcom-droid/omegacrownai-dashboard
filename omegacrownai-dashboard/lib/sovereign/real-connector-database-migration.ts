export function getRealConnectorDatabaseMigration() {
  return {
    system: "OmegaCrownAI Real Connector Database Migration",
    phase: "v20.0 Phase 220",
    status: "connector_database_migration_blueprint_ready",
    purpose:
      "Define the real database migration blueprint for connector installs, permission grants, healthchecks, selected resources, disconnect events, and credential reference safety.",
    corePrinciple:
      "Connector persistence must track installs, permissions, resources, health, disconnects, audit links, and credential references without storing raw secrets.",

    migrationOrder: [
      {
        step: 1,
        table: "connector_installs",
        reason:
          "Canonical installed connector record with workspace, actor, install status, auth type, risk, credential reference, and audit linkage.",
      },
      {
        step: 2,
        table: "connector_permission_grants",
        reason:
          "Stores approved connector permissions, approval gates, approval actor, expiry, and revoke state.",
      },
      {
        step: 3,
        table: "connector_selected_resources",
        reason:
          "Stores selected non-secret resources such as GitHub repositories, projects, lists, calendars, or workspace scopes.",
      },
      {
        step: 4,
        table: "connector_healthchecks",
        reason:
          "Stores connector health status, latency, error class, and safe details reference.",
      },
      {
        step: 5,
        table: "connector_disconnect_events",
        reason:
          "Stores disconnect/revoke events, revocation status, cache cleanup status, and audit event link.",
      },
    ],

    prismaModels: [
      {
        model: "ConnectorInstall",
        table: "connector_installs",
        fields: [
          "id String @id @default(cuid())",
          "connectorId String",
          "workspaceId String",
          "installedBy String",
          "installStatus String",
          "riskLevel String",
          "authType String",
          "credentialRef String?",
          "auditEventId String?",
          "createdAt DateTime @default(now())",
          "updatedAt DateTime @updatedAt",
          "disconnectedAt DateTime?",
        ],
        indexes: [
          "@@index([connectorId, workspaceId])",
          "@@index([installStatus])",
          "@@index([riskLevel])",
          "@@index([auditEventId])",
        ],
      },
      {
        model: "ConnectorPermissionGrant",
        table: "connector_permission_grants",
        fields: [
          "id String @id @default(cuid())",
          "connectorInstallId String",
          "permission String",
          "approvalGate String",
          "approvedBy String?",
          "approvedAt DateTime?",
          "expiresAt DateTime?",
          "revokedAt DateTime?",
          "auditEventId String?",
          "createdAt DateTime @default(now())",
        ],
        relationships: [
          "connectorInstallId -> connector_installs.id",
          "auditEventId -> audit_events.id",
        ],
        indexes: [
          "@@index([connectorInstallId])",
          "@@index([permission])",
          "@@index([approvalGate])",
          "@@index([revokedAt])",
        ],
      },
      {
        model: "ConnectorSelectedResource",
        table: "connector_selected_resources",
        fields: [
          "id String @id @default(cuid())",
          "connectorInstallId String",
          "resourceType String",
          "resourceId String",
          "resourceName String?",
          "resourceOwner String?",
          "accessLevel String",
          "metadataRef String?",
          "selectedBy String",
          "selectedAt DateTime @default(now())",
          "revokedAt DateTime?",
          "auditEventId String?",
        ],
        relationships: [
          "connectorInstallId -> connector_installs.id",
          "auditEventId -> audit_events.id",
        ],
        indexes: [
          "@@index([connectorInstallId])",
          "@@index([resourceType, resourceId])",
          "@@index([accessLevel])",
          "@@index([revokedAt])",
        ],
      },
      {
        model: "ConnectorHealthcheck",
        table: "connector_healthchecks",
        fields: [
          "id String @id @default(cuid())",
          "connectorInstallId String",
          "status String",
          "checkedAt DateTime @default(now())",
          "latencyMs Int?",
          "errorClass String?",
          "detailsRef String?",
          "auditEventId String?",
        ],
        relationships: [
          "connectorInstallId -> connector_installs.id",
          "auditEventId -> audit_events.id",
        ],
        indexes: [
          "@@index([connectorInstallId])",
          "@@index([status])",
          "@@index([errorClass])",
          "@@index([checkedAt])",
        ],
      },
      {
        model: "ConnectorDisconnectEvent",
        table: "connector_disconnect_events",
        fields: [
          "id String @id @default(cuid())",
          "connectorInstallId String",
          "requestedBy String",
          "revocationStatus String",
          "cacheCleanupStatus String",
          "reason String?",
          "auditEventId String?",
          "createdAt DateTime @default(now())",
        ],
        relationships: [
          "connectorInstallId -> connector_installs.id",
          "auditEventId -> audit_events.id",
        ],
        indexes: [
          "@@index([connectorInstallId])",
          "@@index([revocationStatus])",
          "@@index([cacheCleanupStatus])",
          "@@index([auditEventId])",
        ],
      },
    ],

    installStatuses: [
      "ready_for_review",
      "validation_failed",
      "approval_required",
      "approved_for_install",
      "installed_limited",
      "installed_active",
      "healthcheck_failed",
      "disconnected",
      "blocked",
    ],

    authTypes: ["oauth", "api_key", "service_account", "webhook_secret", "local"],

    credentialReferencePolicy: [
      "connector_installs.credentialRef may store only an opaque secret reference.",
      "Do not store raw OAuth tokens.",
      "Do not store API keys.",
      "Do not store passwords.",
      "Do not store bearer authorization headers.",
      "Do not store private keys.",
      "Do not store webhook secrets.",
      "Use server-side secret manager or encrypted vault for actual credentials.",
      "Disconnect must revoke provider access where supported.",
      "Credential references must be removed or disabled on disconnect.",
    ],

    selectedResourcePolicy: [
      "Store only non-secret resource metadata.",
      "GitHub repository selection may store owner, repo name, repo id, and access level.",
      "Do not store repository secrets or protected branch secrets.",
      "Resource selections must be auditable.",
      "Resource access should be least-privilege.",
    ],

    relationshipRules: [
      "Permission grants, selected resources, healthchecks, and disconnect events belong to connector_installs.",
      "Connector install actions should link to audit_events where possible.",
      "Disconnect should mark connector install disconnectedAt and create disconnect event.",
      "Permission revocation should set revokedAt instead of deleting the grant.",
      "Selected resource revocation should set revokedAt instead of deleting the resource selection.",
    ],

    rollbackPlan: [
      "Create database backup or managed snapshot before migration.",
      "Apply connector migration in staging first.",
      "Verify existing app build succeeds.",
      "Run connector migration smoke test.",
      "If migration fails, roll back migration and restore snapshot if needed.",
      "Do not delete connector audit records during rollback.",
    ],

    implementationSteps: [
      "Inspect existing Prisma schema and database provider.",
      "Add connector models to Prisma schema or SQL migration.",
      "Run prisma format or SQL lint if available.",
      "Run migration in staging/local.",
      "Generate Prisma client if Prisma is used.",
      "Run npm run build.",
      "Run connector database migration smoke test.",
      "Restart PM2 only after build success.",
      "Verify production API route 200 responses.",
    ],

    nextImplementationPhases: [
      "GitHub OAuth Start Route",
      "GitHub OAuth Callback Route",
      "GitHub Credential Reference Vault Adapter",
      "GitHub Repository Selector API",
      "GitHub Issue Reader Action",
      "GitHub PR Draft Action",
      "Connector Disconnect/Revoke API",
    ],
  };
}
