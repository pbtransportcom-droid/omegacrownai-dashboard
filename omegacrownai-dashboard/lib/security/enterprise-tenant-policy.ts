export type TenantIsolationCheck = {
  name: string;
  status: "pass" | "warning" | "fail";
  detail: string;
};

export type TenantIsolationEvaluation = {
  tenantId: string | null;
  organizationId: string | null;
  userId: string | null;
  status: "pass" | "warning" | "fail";
  checks: TenantIsolationCheck[];
  requiredControls: string[];
};

export function evaluateTenantIsolation(input: {
  tenantId?: string | null;
  organizationId?: string | null;
  userId?: string | null;
  role?: string | null;
  requestScope?: string | null;
}): TenantIsolationEvaluation {
  const checks: TenantIsolationCheck[] = [];

  checks.push({
    name: "Tenant identifier",
    status: input.tenantId ? "pass" : "fail",
    detail: input.tenantId
      ? "Tenant identifier is present."
      : "Tenant identifier is required for enterprise isolation."
  });

  checks.push({
    name: "Organization scope",
    status: input.organizationId ? "pass" : "fail",
    detail: input.organizationId
      ? "Organization scope is present."
      : "Organization scope is required for customer data access."
  });

  checks.push({
    name: "Authenticated user",
    status: input.userId ? "pass" : "fail",
    detail: input.userId
      ? "Authenticated user context is present."
      : "Authenticated user context is required."
  });

  checks.push({
    name: "Role context",
    status: input.role ? "pass" : "warning",
    detail: input.role
      ? "Role context is present for authorization decisions."
      : "Role context should be supplied before privileged actions."
  });

  checks.push({
    name: "Request scope",
    status: input.requestScope ? "pass" : "warning",
    detail: input.requestScope
      ? "Request scope is present for least-privilege evaluation."
      : "Request scope should be declared for sensitive enterprise actions."
  });

  const hasFail = checks.some((check) => check.status === "fail");
  const hasWarning = checks.some((check) => check.status === "warning");

  return {
    tenantId: input.tenantId ?? null,
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    status: hasFail ? "fail" : hasWarning ? "warning" : "pass",
    checks,
    requiredControls: [
      "Every enterprise request must carry tenant, organization, and authenticated user context.",
      "Customer organization data must be filtered by organizationId and tenantId before response serialization.",
      "Privileged actions must verify role, membership, and request scope.",
      "Provider credentials must never be returned to unauthorized users or cross-tenant callers.",
      "Audit events must include tenantId, organizationId, actor userId, action, target, and timestamp.",
      "Billing, storage, publishing, providers, team, and execution routes must enforce customer organization boundaries."
    ]
  };
}

export const securityHardeningControls = [
  {
    area: "Authentication",
    control:
      "Require authenticated user context before accessing customer organization, billing, provider, storage, publishing, execution, or admin data."
  },
  {
    area: "Authorization",
    control:
      "Enforce role-based access for owner, admin, member, billing, operator, and support actions."
  },
  {
    area: "Tenant isolation",
    control:
      "Filter all organization-owned records by tenantId and organizationId before reading, mutating, exporting, or publishing."
  },
  {
    area: "Provider credentials",
    control:
      "Encrypt or vault provider credentials, never expose secrets in API responses, and require membership before provider actions."
  },
  {
    area: "Audit logging",
    control:
      "Record security-sensitive actions including login, invite, role change, provider connect, provider revoke, billing update, export, publish, and deletion."
  },
  {
    area: "Rate limiting",
    control:
      "Apply stricter limits to authentication, onboarding, provider activation, publishing, billing, and public intake routes."
  },
  {
    area: "Security headers",
    control:
      "Use strict transport security, content-type protection, frame protection, referrer policy, and conservative permissions policy."
  },
  {
    area: "Incident readiness",
    control:
      "Escalate suspected tenant boundary violations, credential exposure, billing abuse, and provider misuse as SEV1 security incidents."
  }
];
