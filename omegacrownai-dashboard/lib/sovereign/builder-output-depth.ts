export type BuilderDepartment =
  | "website"
  | "app"
  | "automation"
  | "trading"
  | "coding";

export function getBuilderOutputDepth(department: string) {
  const key = department.toLowerCase();

  if (key === "website") {
    return {
      department: "website",
      outputMode: "customer_ready_website_blueprint",
      requiredArtifacts: [
        "pageTree",
        "homepageSections",
        "servicePageCopy",
        "aboutPageCopy",
        "contactPageCopy",
        "seoMetadata",
        "brandDirection",
        "conversionPlan",
        "deploymentChecklist",
      ],
      nextActions: [
        "Generate page copy",
        "Review brand direction",
        "Create preview",
        "Run SEO/readiness check",
        "Prepare deployment",
      ],
    };
  }

  if (key === "app") {
    return {
      department: "app",
      outputMode: "product_build_spec",
      requiredArtifacts: [
        "productBrief",
        "screenMap",
        "userFlows",
        "dataModel",
        "apiPlan",
        "rolesAndPermissions",
        "releaseChecklist",
      ],
      nextActions: [
        "Confirm core users",
        "Generate screen plan",
        "Create data model",
        "Define API routes",
        "Run release readiness",
      ],
    };
  }

  if (key === "automation") {
    return {
      department: "automation",
      outputMode: "workflow_execution_plan",
      requiredArtifacts: [
        "trigger",
        "workflowSteps",
        "actions",
        "approvalGates",
        "failureHandling",
        "loggingPlan",
        "replayPlan",
      ],
      nextActions: [
        "Confirm trigger",
        "Map workflow steps",
        "Add approval gates",
        "Add failure handling",
        "Run automation readiness",
      ],
    };
  }

  if (key === "trading") {
    return {
      department: "trading",
      outputMode: "paper_trading_system_package",
      requiredArtifacts: [
        "architecture",
        "agentList",
        "riskRules",
        "paperTradingLock",
        "codeRepositoryPlan",
        "backtestPlan",
        "dashboardPlan",
        "liveTradingSafetyGate",
      ],
      nextActions: [
        "Generate code repository plan",
        "Create paper trading config",
        "Add risk engine",
        "Add backtest engine",
        "Review before any live trading",
      ],
    };
  }

  if (key === "coding") {
    return {
      department: "coding",
      outputMode: "implementation_repo_plan",
      requiredArtifacts: [
        "fileTree",
        "implementationSteps",
        "dependencies",
        "tests",
        "validationPlan",
        "deploymentPlan",
      ],
      nextActions: [
        "Generate file tree",
        "Create implementation plan",
        "Add tests",
        "Run validation",
        "Prepare deployment",
      ],
    };
  }

  return {
    department: key || "unknown",
    outputMode: "general_project_build_plan",
    requiredArtifacts: [
      "brief",
      "deliverables",
      "nextActions",
      "validationPlan",
      "readinessChecklist",
    ],
    nextActions: [
      "Clarify goal",
      "Generate deliverables",
      "Validate output",
      "Prepare next step",
    ],
  };
}
