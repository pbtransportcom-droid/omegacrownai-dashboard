export function getFullFunctionArtifactStandard() {
  return {
    system: "OmegaCrownAI Full-Function Artifact Standard",
    phase: "v16.7 Phase 187",
    status: "standard_ready",
    deliveryTarget: {
      minimumCustomerReady: "90%",
      preferredPremium: "100%",
      eliteAboveCompetitor: "110%",
      rule:
        "OmegaCrownAI should not deliver limited, shallow, or partial customer artifacts when a full-function output is expected.",
    },
    coreRequirements: [
      {
        name: "Frontend output",
        requiredWhen: "Any customer-facing website, app, dashboard, portal, or UI is requested.",
        standard:
          "Must include usable pages/screens/components, navigation, responsive layout, and customer-facing copy.",
      },
      {
        name: "Backend/API output",
        requiredWhen: "The project needs forms, orders, bookings, auth, data, workflows, trading logic, payments, automation, or integrations.",
        standard:
          "Must include API route examples, data handling, validation, and integration notes where applicable.",
      },
      {
        name: "Preview/review path",
        requiredWhen: "Every paid/customer artifact.",
        standard:
          "Must include a way to inspect the output before launch, such as preview page, admin review panel, JSON artifact, or review checklist.",
      },
      {
        name: "Download/export",
        requiredWhen: "Every generated software, website, app, trading, automation, or content package.",
        standard:
          "Must include downloadable/exportable artifact or clear export path.",
      },
      {
        name: "README/run instructions",
        requiredWhen: "Every code/software artifact.",
        standard:
          "Must explain setup, local run, tests, safety notes, deployment, and next steps.",
      },
      {
        name: "Smoke test/validation",
        requiredWhen: "Every customer-ready builder output.",
        standard:
          "Must include validation endpoint, checklist, or smoke-test runner confirming required files and safety gates.",
      },
      {
        name: "Missing information checker",
        requiredWhen: "Every customer project.",
        standard:
          "Must call out missing details such as brand, contact info, pricing, service area, legal/privacy, credentials, data sources, or deployment settings.",
      },
      {
        name: "Deployment checklist",
        requiredWhen: "Every launchable artifact.",
        standard:
          "Must include launch steps, environment notes, domain/deployment steps, QA checks, and rollback/review notes.",
      },
      {
        name: "Next action",
        requiredWhen: "Every output.",
        standard:
          "Must tell the customer what to do next: preview, edit, test, download, deploy, approve, or continue building.",
      },
    ],
    builderStandards: [
      {
        builder: "Website / App Builder",
        requiredOutputs: [
          "Frontend pages/screens",
          "Backend/API routes where forms/orders/bookings/data are needed",
          "Contact/order/booking flow",
          "Data model or data file",
          "Admin/review panel",
          "SEO metadata",
          "README",
          "Deployment checklist",
          "Smoke-test checklist",
          "Downloadable bundle",
        ],
      },
      {
        builder: "Trading Builder",
        requiredOutputs: [
          "Strategy logic",
          "Risk rules",
          "Paper-trading safety lock",
          "Dashboard starter",
          "Backtest/smoke-test path",
          "README",
          "Downloadable repo",
          "Live-trading disabled by default",
        ],
      },
      {
        builder: "Automation Builder",
        requiredOutputs: [
          "Trigger",
          "Actions",
          "Approvals",
          "Logs",
          "Retry/failure handling",
          "Review before activation",
          "Test run",
          "Export/deployment notes",
        ],
      },
      {
        builder: "Coding Builder",
        requiredOutputs: [
          "Actual files",
          "Repo structure",
          "Install/run commands",
          "Tests",
          "README",
          "Smoke check",
          "Deployment notes",
        ],
      },
      {
        builder: "Creative / Marketing Builder",
        requiredOutputs: [
          "Campaign assets",
          "Copy variants",
          "Publishing plan",
          "Review panel",
          "Export package",
          "Usage notes",
        ],
      },
    ],
    scoringRubric: [
      {
        score: "0–40%",
        label: "Incomplete",
        meaning: "Idea, outline, or partial mockup only. Not customer-ready.",
      },
      {
        score: "41–70%",
        label: "Prototype",
        meaning: "Useful draft but missing major functionality, tests, or export path.",
      },
      {
        score: "71–89%",
        label: "Advanced draft",
        meaning: "Strong output but still missing important production or review pieces.",
      },
      {
        score: "90–100%",
        label: "Customer-ready",
        meaning: "Complete enough for paid customer review, testing, and launch preparation.",
      },
      {
        score: "101–110%",
        label: "Above competitor",
        meaning: "Includes extra review, validation, export, safety, documentation, and next-action value beyond normal builders.",
      },
    ],
    nonNegotiableRules: [
      "No paid/customer artifact should stop at only a front page when backend or workflow functionality is expected.",
      "No builder should output only a blueprint when code/files/export are expected.",
      "No launchable artifact should ship without preview or review path.",
      "No generated software should be marked customer-ready without validation or smoke-test evidence.",
      "No missing critical customer information should be hidden.",
      "No production restart before successful build.",
      "No uncontrolled git add .",
    ],
  };
}
