export function getEnterpriseReliabilityObservabilityLayer() {
  return {
    system: "OmegaCrownAI Enterprise Reliability & Observability Layer",
    phase: "v17.3 Phase 193",
    status: "observability_ready",
    purpose:
      "Define how OmegaCrownAI tracks production health, incidents, logs, metrics, service status, route health, artifact validation, and customer-impacting reliability signals.",
    corePrinciple:
      "Enterprise readiness requires visible health, classified errors, measurable reliability, alerting, recovery paths, and audit-ready operational evidence.",

    serviceHealthCategories: [
      {
        category: "application",
        signals: ["Next.js build status", "PM2 process status", "server readiness", "route response status"],
      },
      {
        category: "api",
        signals: ["HTTP status", "content-type", "JSON parse success", "schema completeness", "latency"],
      },
      {
        category: "artifact_generation",
        signals: ["file count", "download availability", "smoke-test result", "missing file count", "readiness score"],
      },
      {
        category: "deployment",
        signals: ["build pass/fail", "restart time", "route smoke checks", "PM2 error log", "rollback availability"],
      },
      {
        category: "security_governance",
        signals: ["blocked action count", "approval gate usage", "audit evidence", "secret exposure checks"],
      },
      {
        category: "customer_experience",
        signals: ["workspace availability", "builder output completeness", "preview path availability", "download success"],
      },
    ],

    incidentSeverityLevels: [
      {
        level: "SEV0",
        meaning: "Production unavailable or customer-critical data/action safety failure.",
        examples: ["site-wide 502", "missing production build", "secrets exposed", "unsafe live action"],
        response: "immediate stop, rollback/recovery, owner alert, incident record",
      },
      {
        level: "SEV1",
        meaning: "Major feature unavailable or customer output blocked.",
        examples: ["builder API 500", "download bundle broken", "smoke test failing"],
        response: "repair before new feature work, route verification, post-fix audit",
      },
      {
        level: "SEV2",
        meaning: "Degraded feature with workaround.",
        examples: ["non-critical API slow", "UI panel stale", "missing optional metadata"],
        response: "schedule repair, monitor impact, verify after patch",
      },
      {
        level: "SEV3",
        meaning: "Cosmetic, documentation, or low-risk operational issue.",
        examples: ["copy polish", "dashboard wording", "minor layout issue"],
        response: "batch into next polish phase",
      },
    ],

    errorClasses: [
      {
        class: "build_error",
        routeTo: "Self-Repair Engine",
        requiredEvidence: ["compiler output", "changed files", "diff", "build command"],
      },
      {
        class: "runtime_error",
        routeTo: "Execution Agent",
        requiredEvidence: ["PM2 logs", "HTTP status", "route path", "timestamp"],
      },
      {
        class: "api_contract_error",
        routeTo: "Builder/API Agent",
        requiredEvidence: ["endpoint", "status code", "content-type", "JSON parse result"],
      },
      {
        class: "artifact_validation_error",
        routeTo: "Builder Agent",
        requiredEvidence: ["expected files", "actual files", "smoke-test output", "bundle path"],
      },
      {
        class: "security_or_governance_error",
        routeTo: "Governance Agent",
        requiredEvidence: ["action attempted", "permission", "approval gate", "blocked rule"],
      },
      {
        class: "deployment_error",
        routeTo: "Deployment Agent",
        requiredEvidence: ["build result", ".next presence", "PM2 status", "route checks", "logs"],
      },
    ],

    metricsRegistry: [
      {
        metric: "route_success_rate",
        target: ">= 99%",
        source: "route smoke tests and uptime monitor",
      },
      {
        metric: "api_json_success_rate",
        target: ">= 99%",
        source: "API checks with content-type and JSON parsing",
      },
      {
        metric: "build_success_rate",
        target: ">= 95%",
        source: "npm run build logs",
      },
      {
        metric: "artifact_smoke_pass_rate",
        target: ">= 98%",
        source: "artifact smoke-test APIs",
      },
      {
        metric: "customer_ready_score",
        target: "90–110%",
        source: "Builder Output Depth scoring",
      },
      {
        metric: "mean_time_to_recovery",
        target: "tracked",
        source: "incident start/end timestamps",
      },
      {
        metric: "blocked_unsafe_action_count",
        target: "tracked",
        source: "governance audit trail",
      },
    ],

    structuredLogShape: {
      logId: "stable unique log id",
      timestamp: "ISO timestamp",
      service: "service or API name",
      route: "route or action path",
      level: "debug | info | warn | error | critical",
      eventType: "build | route_check | api_check | artifact_check | deployment | governance | memory | execution",
      status: "success | failed | degraded | blocked",
      errorClass: "optional classified error",
      durationMs: "optional duration",
      correlationId: "links logs across a workflow",
      evidence: ["status code", "content-type", "commit hash", "smoke-test result", "PM2 status"],
    },

    alertingRules: [
      "Alert SEV0 when /build or core routes return 502/500.",
      "Alert SEV0 when PM2 is online but Next.js cannot find a production build.",
      "Alert SEV1 when a smoke-test API returns ok false.",
      "Alert SEV1 when a JSON API returns HTML or non-JSON unexpectedly.",
      "Alert SEV1 when artifact expected files do not match actual files.",
      "Alert SEV2 when customer-ready score drops below 90%.",
      "Alert governance when blocked actions are attempted.",
    ],

    reliabilityScorecard: [
      {
        area: "Production availability",
        requirement: "Core routes return HTTP/2 200 after deployment.",
      },
      {
        area: "API correctness",
        requirement: "APIs return JSON content-type and parse successfully.",
      },
      {
        area: "Build discipline",
        requirement: "No PM2 restart after failed build.",
      },
      {
        area: "Artifact quality",
        requirement: "Smoke tests pass and file counts match expected output.",
      },
      {
        area: "Governance",
        requirement: "High-risk and blocked actions are routed through approval gates.",
      },
      {
        area: "Recovery",
        requirement: "Known-good commit, rollback note, or recovery path is available.",
      },
    ],

    requiredOperationalChecks: [
      "npm run build passes",
      ".next production build exists",
      "PM2 process is online",
      "/build returns 200",
      "core smoke-test APIs return 200",
      "smoke-test JSON returns ok true",
      "PM2 error logs are clean",
      "git status does not include unintended source changes",
      "runtime uploads are not committed accidentally",
    ],

    nextImplementationPhases: [
      "Reliability API",
      "Reliability Smoke Test API",
      "Operational Health Dashboard",
      "Incident Record API",
      "Structured Log Registry",
      "Alert Rules Registry",
      "Uptime Monitor Integration",
    ],
  };
}
