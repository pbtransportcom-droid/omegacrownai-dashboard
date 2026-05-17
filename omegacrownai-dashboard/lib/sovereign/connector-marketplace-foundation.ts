export function getConnectorMarketplaceFoundation() {
  return {
    system: "OmegaCrownAI Connector / Integration Marketplace Foundation",
    phase: "v17.4 Phase 194",
    status: "marketplace_foundation_ready",
    purpose:
      "Define how OmegaCrownAI connects safely to external apps, APIs, data sources, automation tools, storage providers, communication channels, and enterprise systems.",
    corePrinciple:
      "No connector should be installed, executed, or allowed to write externally without scoped permissions, approval gates, audit logs, credential safety, and rollback/recovery guidance.",

    connectorCategories: [
      {
        category: "communication",
        examples: ["Gmail", "Outlook", "Slack", "Teams", "SMS"],
        typicalActions: ["read messages", "draft replies", "send approved messages", "summarize threads"],
      },
      {
        category: "crm_sales",
        examples: ["HubSpot", "Salesforce", "Zoho", "Airtable CRM"],
        typicalActions: ["read leads", "create records", "update statuses", "generate follow-ups"],
      },
      {
        category: "storage_files",
        examples: ["Google Drive", "Dropbox", "S3", "Cloudflare R2", "local storage"],
        typicalActions: ["read files", "write artifacts", "export bundles", "sync backups"],
      },
      {
        category: "development",
        examples: ["GitHub", "GitLab", "Linear", "Jira", "Vercel"],
        typicalActions: ["read issues", "create branches", "open PRs", "deploy previews"],
      },
      {
        category: "payments_billing",
        examples: ["Stripe", "PayPal", "QuickBooks"],
        typicalActions: ["read invoices", "create checkout drafts", "generate billing reports"],
      },
      {
        category: "marketing_distribution",
        examples: ["YouTube", "TikTok", "Instagram", "Facebook", "Mailchimp"],
        typicalActions: ["prepare posts", "upload drafts", "schedule approved campaigns"],
      },
      {
        category: "model_compute",
        examples: ["OpenAI", "Anthropic", "local models", "Ollama", "Hugging Face"],
        typicalActions: ["route prompts", "score outputs", "run model fallback", "track cost"],
      },
      {
        category: "automation_webhooks",
        examples: ["Zapier", "Make", "n8n", "custom webhook"],
        typicalActions: ["trigger workflows", "receive events", "send approved payloads"],
      },
    ],

    permissionModel: [
      {
        permission: "connector_read",
        riskLevel: "low",
        description: "Read-only access to files, messages, records, or events.",
        approval: "workspace/admin approval",
      },
      {
        permission: "connector_write_draft",
        riskLevel: "medium",
        description: "Create drafts, staging records, preview artifacts, or unsent messages.",
        approval: "validation required before customer-visible use",
      },
      {
        permission: "connector_external_write",
        riskLevel: "high",
        description: "Send messages, update CRM records, publish content, activate workflows, or deploy externally.",
        approval: "explicit approval required",
      },
      {
        permission: "connector_financial_action",
        riskLevel: "blocked_by_default",
        description: "Move money, charge payment methods, issue refunds, place trades, or execute irreversible financial actions.",
        approval: "blocked unless separately owner-approved with safety review",
      },
      {
        permission: "connector_secret_management",
        riskLevel: "high",
        description: "Store, rotate, or reference API keys, OAuth tokens, webhook secrets, or credentials.",
        approval: "secret manager and audit required",
      },
    ],

    credentialSafetyRequirements: [
      "Never commit API keys, OAuth tokens, webhooks secrets, passwords, or private credentials.",
      "Use scoped OAuth permissions where possible.",
      "Use least-privilege API keys.",
      "Use server-side environment variables or secret manager only.",
      "Do not expose secrets in generated artifacts, logs, screenshots, JSON responses, or client-side code.",
      "Support credential revocation and connector disconnect flow.",
      "Audit connector install, use, failure, and disconnect events.",
    ],

    connectorManifestShape: {
      connectorId: "stable connector identifier",
      name: "connector display name",
      category: "connector category",
      version: "semantic version",
      authType: "oauth | api_key | service_account | webhook_secret | local",
      permissionsRequested: ["connector_read", "connector_write_draft"],
      riskLevel: "low | medium | high | blocked_by_default",
      actions: [
        {
          actionId: "stable action id",
          name: "action name",
          inputSchema: "validated input schema",
          outputSchema: "expected output schema",
          approvalGate: "read_only | artifact_generation | workspace_write | external_write | blocked_by_default",
          auditRequired: true,
        },
      ],
      healthcheck: "connector-specific healthcheck path or method",
      disconnectPolicy: "how credentials and cached data are removed",
      dataRetentionPolicy: "how synced data is retained or deleted",
    },

    marketplaceListingShape: {
      listingId: "stable listing id",
      connectorId: "connector id",
      title: "marketplace title",
      summary: "what the connector does",
      supportedActions: ["read", "draft", "write_after_approval"],
      requiredPermissions: ["connector_read"],
      setupSteps: ["connect account", "approve scopes", "run healthcheck"],
      safetyNotes: ["what it can and cannot do"],
      pricingModel: "free | included | usage_based | paid_addon",
      reviewStatus: "draft | reviewed | approved | blocked",
    },

    webhookRules: [
      "All incoming webhooks must verify signature or shared secret when possible.",
      "Webhook payloads must be schema-validated.",
      "Webhook processing must be idempotent or replay-safe.",
      "Webhook failures must be classified and logged.",
      "High-risk webhook-triggered actions require approval before external write.",
      "Webhook secrets must never be exposed in client-side code or logs.",
    ],

    installReviewWorkflow: [
      "User selects connector from marketplace.",
      "OmegaCrownAI displays requested permissions and risk level.",
      "User/admin approves installation.",
      "Connector stores credentials in server-side secret storage only.",
      "Connector healthcheck runs.",
      "Connector actions become available according to permission level.",
      "External writes require explicit approval gate.",
      "Audit trail records install, action use, failures, and disconnect.",
    ],

    blockedConnectorActions: [
      "No connector may expose secrets in logs, commits, artifacts, or UI.",
      "No connector may send external messages without approval unless explicitly configured.",
      "No connector may publish public content without review.",
      "No connector may charge, refund, transfer funds, or place trades by default.",
      "No connector may delete customer data without explicit owner approval and rollback plan.",
      "No connector may request broader scopes than needed.",
    ],

    initialMarketplaceConnectors: [
      {
        connector: "GitHub",
        category: "development",
        status: "planned",
        priority: "high",
        reason: "Required for PRs, issues, releases, and code review workflows.",
      },
      {
        connector: "Google Drive / File Storage",
        category: "storage_files",
        status: "planned",
        priority: "high",
        reason: "Required for customer artifacts, documents, exports, and backups.",
      },
      {
        connector: "Gmail / Email",
        category: "communication",
        status: "planned",
        priority: "medium",
        reason: "Useful for customer follow-up, drafts, and approved messaging.",
      },
      {
        connector: "Stripe",
        category: "payments_billing",
        status: "planned_blocked_for_financial_actions",
        priority: "medium",
        reason: "Billing can be integrated, but money movement must remain blocked by default.",
      },
      {
        connector: "n8n / Webhooks",
        category: "automation_webhooks",
        status: "planned",
        priority: "medium",
        reason: "Useful for workflow automation and external event routing.",
      },
    ],

    nextImplementationPhases: [
      "Connector Marketplace API",
      "Connector Marketplace Smoke Test API",
      "Connector Manifest Validator",
      "Connector Install Review UI",
      "Connector Permission Gate API",
      "Connector Audit Trail Integration",
      "First GitHub Connector Blueprint",
    ],
  };
}
