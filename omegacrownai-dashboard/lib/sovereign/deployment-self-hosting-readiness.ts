export function getDeploymentSelfHostingReadinessLayer() {
  return {
    system: "OmegaCrownAI Deployment / Self-Hosting Readiness Layer",
    phase: "v17.2 Phase 192",
    status: "deployment_readiness_ready",
    purpose:
      "Define how OmegaCrownAI can move toward true deployment sovereignty: hosted SaaS, VPS, Docker, Kubernetes, private cloud, and on-prem readiness with backup, restore, portability, and security requirements.",
    corePrinciple:
      "Sovereignty requires portability, recoverability, documented environments, controlled deployments, and the option to run outside a single vendor dependency.",

    deploymentModes: [
      {
        mode: "managed_saas",
        description:
          "OmegaCrownAI hosted and operated centrally with customer workspaces, release checks, and managed updates.",
        readiness: "active_direction",
        requirements: [
          "workspace isolation",
          "release readiness checks",
          "customer onboarding",
          "audit trails",
          "backup policy",
        ],
      },
      {
        mode: "vps_single_node",
        description:
          "Single-server deployment similar to current production: Next.js app, PM2, Nginx, domain, SSL, GitHub deploy flow.",
        readiness: "current_operational_base",
        requirements: [
          "npm run build before PM2 restart",
          "PM2 process health",
          "Nginx reverse proxy",
          "SSL certificate",
          "route smoke tests",
          "log review",
        ],
      },
      {
        mode: "docker_compose",
        description:
          "Portable self-hosting package for small teams or private servers using Docker Compose.",
        readiness: "planned",
        requirements: [
          "Dockerfile",
          "docker-compose.yml",
          "environment variable template",
          "volume mapping",
          "healthcheck endpoint",
          "backup scripts",
        ],
      },
      {
        mode: "kubernetes_private_cloud",
        description:
          "Enterprise-grade deployment for clusters, private cloud, failover, autoscaling, and isolated workloads.",
        readiness: "planned",
        requirements: [
          "Kubernetes manifests or Helm chart",
          "Ingress",
          "Secrets management",
          "persistent volumes",
          "readiness/liveness probes",
          "horizontal scaling plan",
        ],
      },
      {
        mode: "air_gapped_or_offline",
        description:
          "Future mode for high-sovereignty customers that need offline or restricted-network operation.",
        readiness: "future",
        requirements: [
          "local model support",
          "offline artifact generation",
          "offline package registry mirror",
          "manual update bundle",
          "strict audit export",
        ],
      },
    ],

    environmentRegistry: [
      {
        name: "NODE_ENV",
        required: true,
        purpose: "Controls production/runtime behavior.",
        example: "production",
      },
      {
        name: "PORT",
        required: true,
        purpose: "Application listen port used by PM2/Nginx.",
        example: "3101",
      },
      {
        name: "DATABASE_URL",
        required: "when persistence is enabled",
        purpose: "Database connection for projects, memory, audit, and workflow records.",
        example: "postgresql://user:pass@host:5432/omegacrownai",
      },
      {
        name: "NEXT_PUBLIC_APP_URL",
        required: true,
        purpose: "Canonical public app URL for links, previews, callbacks, and exports.",
        example: "https://www.omegacrownai.com",
      },
      {
        name: "OPENAI_API_KEY",
        required: "when model routing uses OpenAI",
        purpose: "Model/provider access. Must never be committed or exposed.",
        example: "set in server environment only",
      },
      {
        name: "STORAGE_PROVIDER",
        required: "when file persistence is enabled",
        purpose: "Controls local/S3/R2/private storage backend.",
        example: "local | s3 | r2 | private",
      },
    ],

    portabilityRequirements: [
      "Every customer project should have an export path.",
      "Every generated artifact should be downloadable or reproducible from source prompt and metadata.",
      "Environment variables must be documented in an example file without secrets.",
      "Runtime uploads should not be accidentally committed to git.",
      "Deployment mode should be visible: SaaS, VPS, Docker, Kubernetes, or offline.",
      "Data portability should include projects, artifacts, memory records, audit logs, and generated bundles.",
    ],

    backupRestorePlan: [
      {
        area: "database",
        backup: "scheduled dump or managed snapshot",
        restore: "documented restore command and verification query",
      },
      {
        area: "uploads/artifacts",
        backup: "archive local uploads or sync object storage bucket",
        restore: "restore to public/uploads or configured storage provider",
      },
      {
        area: "environment",
        backup: "secure secret manager or encrypted offline copy",
        restore: "recreate env from template and secret vault",
      },
      {
        area: "code",
        backup: "GitHub repository and release tags",
        restore: "git checkout known-good commit and npm install/build",
      },
      {
        area: "runtime process",
        backup: "PM2 ecosystem/config notes",
        restore: "pm2 start/restart with documented port and env",
      },
    ],

    domainSslRequirements: [
      "Domain points to server or ingress.",
      "Nginx or ingress routes HTTPS traffic to app port.",
      "TLS certificate is active and renewable.",
      "HTTP redirects to HTTPS.",
      "Production health routes return 200.",
      "API routes return JSON content-type, not HTML error pages.",
    ],

    healthAndRecoveryChecks: [
      "npm run build passes",
      ".next production build exists",
      "PM2 process is online",
      "Nginx returns HTTP/2 200 for /build",
      "Core APIs return HTTP/2 200",
      "Smoke-test APIs return ok true",
      "PM2 error logs are clean",
      "Git working tree has no unintended changes",
      "Runtime upload folders are not accidentally committed",
    ],

    selfHostingReadinessChecklist: [
      {
        item: "Dockerfile",
        status: "missing",
        priority: "high",
      },
      {
        item: "docker-compose.yml",
        status: "missing",
        priority: "high",
      },
      {
        item: ".env.example",
        status: "needed",
        priority: "high",
      },
      {
        item: "healthcheck route",
        status: "partial_via_existing_smoke_tests",
        priority: "medium",
      },
      {
        item: "backup/restore scripts",
        status: "missing",
        priority: "high",
      },
      {
        item: "Kubernetes/Helm deployment",
        status: "future",
        priority: "medium",
      },
      {
        item: "self-hosting README",
        status: "missing",
        priority: "high",
      },
    ],

    productionRules: [
      "Build before PM2 restart.",
      "Never restart production after failed build.",
      "Verify .next production build exists before next start.",
      "Use targeted git add only.",
      "Do not commit secrets.",
      "Do not commit runtime upload folders accidentally.",
      "Run route smoke tests after restart.",
      "Check PM2 logs after restart.",
      "Keep rollback command or known-good commit available.",
    ],

    nextImplementationPhases: [
      "Deployment Readiness API",
      "Deployment Smoke Test API",
      "Dockerfile and docker-compose scaffold",
      ".env.example and self-hosting README",
      "Backup/restore command package",
      "Healthcheck endpoint",
      "Kubernetes/Helm blueprint",
    ],
  };
}
