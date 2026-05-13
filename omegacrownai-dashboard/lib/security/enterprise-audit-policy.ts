export type AuditSeverity = "info" | "warning" | "critical";

export type AuditEventCategory =
  | "authentication"
  | "team"
  | "roles"
  | "billing"
  | "providers"
  | "publishing"
  | "storage"
  | "tenant_isolation"
  | "admin"
  | "incident";

export type EnterpriseAuditEvent = {
  id: string;
  category: AuditEventCategory;
  severity: AuditSeverity;
  action: string;
  actor: string;
  tenantId: string;
  organizationId: string;
  target: string;
  result: "success" | "blocked" | "failed" | "review_required";
  timestamp: string;
  detail: string;
};

export const auditEventRetentionPolicy = {
  standardRetentionDays: 365,
  enterpriseRetentionDays: 2555,
  criticalEventRetention: "Retain for legal, security, billing, and incident response needs.",
  exportPolicy:
    "Enterprise audit exports must be scoped to tenantId and organizationId, require authorized admin access, and include an export audit event.",
  deletionPolicy:
    "Audit records should not be deleted while needed for security, billing, legal, fraud prevention, compliance, or incident response."
};

export const requiredAuditEvents = [
  {
    category: "authentication",
    events: [
      "login_success",
      "login_failure",
      "logout",
      "session_revoked",
      "password_reset_requested"
    ]
  },
  {
    category: "team",
    events: [
      "team_member_invited",
      "team_member_removed",
      "invitation_accepted",
      "invitation_revoked"
    ]
  },
  {
    category: "roles",
    events: [
      "role_granted",
      "role_removed",
      "admin_promoted",
      "owner_changed"
    ]
  },
  {
    category: "billing",
    events: [
      "checkout_started",
      "billing_portal_opened",
      "subscription_changed",
      "payment_failed",
      "entitlement_changed"
    ]
  },
  {
    category: "providers",
    events: [
      "provider_connected",
      "provider_revoked",
      "provider_credential_rotated",
      "provider_execution_started",
      "provider_execution_failed"
    ]
  },
  {
    category: "publishing",
    events: [
      "publishing_account_connected",
      "publish_job_created",
      "publish_job_approved",
      "publish_job_failed",
      "publish_job_cancelled"
    ]
  },
  {
    category: "storage",
    events: [
      "asset_uploaded",
      "asset_exported",
      "asset_downloaded",
      "storage_sync_started",
      "storage_sync_failed"
    ]
  },
  {
    category: "tenant_isolation",
    events: [
      "tenant_context_missing",
      "organization_scope_missing",
      "cross_tenant_access_blocked",
      "unauthorized_provider_access_blocked"
    ]
  },
  {
    category: "admin",
    events: [
      "admin_setting_changed",
      "security_policy_changed",
      "access_review_completed",
      "audit_export_created"
    ]
  },
  {
    category: "incident",
    events: [
      "security_incident_declared",
      "incident_severity_changed",
      "incident_mitigated",
      "post_incident_review_created"
    ]
  }
] as const;

export const adminSecurityControls = [
  {
    area: "Access review",
    control:
      "Review owners, admins, billing users, operators, support users, and provider managers for each enterprise tenant."
  },
  {
    area: "Role enforcement",
    control:
      "Require role validation before billing, provider credential, publishing, export, team, and administrative actions."
  },
  {
    area: "Audit visibility",
    control:
      "Expose tenant-scoped audit activity for enterprise administrators without leaking cross-tenant events."
  },
  {
    area: "Sensitive action approval",
    control:
      "Require explicit approval or elevated role for provider revocation, role changes, billing changes, publishing execution, exports, and tenant deletion."
  },
  {
    area: "Credential governance",
    control:
      "Show credential status and last-used metadata, never raw secrets, tokens, or private keys."
  },
  {
    area: "Security escalation",
    control:
      "Escalate cross-tenant attempts, credential exposure, unauthorized publishing, or billing abuse as SEV1 security incidents."
  }
];

export const sampleAuditEvents: EnterpriseAuditEvent[] = [
  {
    id: "audit_001",
    category: "authentication",
    severity: "info",
    action: "login_success",
    actor: "user:admin",
    tenantId: "tenant_demo",
    organizationId: "org_demo",
    target: "session",
    result: "success",
    timestamp: new Date().toISOString(),
    detail: "Administrator signed in successfully."
  },
  {
    id: "audit_002",
    category: "providers",
    severity: "warning",
    action: "provider_credential_rotated",
    actor: "user:owner",
    tenantId: "tenant_demo",
    organizationId: "org_demo",
    target: "provider:publishing",
    result: "success",
    timestamp: new Date().toISOString(),
    detail: "Provider credential was rotated and old credential was revoked."
  },
  {
    id: "audit_003",
    category: "tenant_isolation",
    severity: "critical",
    action: "cross_tenant_access_blocked",
    actor: "user:unknown",
    tenantId: "tenant_demo",
    organizationId: "org_demo",
    target: "organization:data",
    result: "blocked",
    timestamp: new Date().toISOString(),
    detail: "Request was blocked because tenant and organization context did not match."
  }
];

export function evaluateAdminControlReadiness(input: {
  tenantId?: string | null;
  organizationId?: string | null;
  adminUserId?: string | null;
  role?: string | null;
}) {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.tenantId) blockers.push("Tenant context is required.");
  if (!input.organizationId) blockers.push("Organization context is required.");
  if (!input.adminUserId) blockers.push("Admin user context is required.");

  if (!input.role) {
    warnings.push("Admin role is not supplied.");
  } else if (!["owner", "admin", "security_admin"].includes(input.role)) {
    blockers.push("Role is not authorized for enterprise admin security controls.");
  }

  return {
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "review_required" : "ready",
    blockers,
    warnings,
    requiredControls: adminSecurityControls
  };
}
