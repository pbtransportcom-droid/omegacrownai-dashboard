export type PromptContractPage = {
  route: string;
  name: string;
  required: boolean;
};

export type PromptContractApi = {
  route: string;
  methods: string[];
  required: boolean;
};

export type PromptContractModel = {
  name: string;
  required: boolean;
};

export type PromptContractWorkflow = {
  name: string;
  required: boolean;
  steps: string[];
};

export type PromptContract = {
  version: "1.0";

  source: "customer-prompt";

  productName: string;
  productType: string;
  industry: string;

  pages: PromptContractPage[];
  apiRoutes: PromptContractApi[];
  models: PromptContractModel[];

  roles: string[];
  features: string[];
  workflows: PromptContractWorkflow[];
  integrations: string[];
  uiStates: string[];

  quality: {
    responsive: boolean;
    productionBuildRequired: boolean;
    livePreviewRequired: boolean;
    persistentDataRequired: boolean;
    noPlaceholderContent: boolean;
    noDeadActions: boolean;
  };

  originalPrompt: string;
};

function unique(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function routeName(route: string) {
  if (route === "/") return "Home";

  return route
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).replace(/-/g, " ")
    )
    .join(" / ");
}

function contains(
  source: string,
  ...terms: string[]
) {
  return terms.some(
    (term) =>
      source.includes(term.toLowerCase())
  );
}

export function createPromptContract(
  prompt: string,
  buildSpec: any = null
): PromptContract {
  const originalPrompt =
    String(prompt || "").trim();

  const source =
    originalPrompt.toLowerCase();

  const pages: string[] = ["/"];

  const pageRules: Array<
    [string, string[]]
  > = [
    ["/platform", ["platform"]],
    ["/dispatch", ["dispatch"]],
    ["/fleet", ["fleet management", "fleet"]],
    ["/booking", ["booking", "reservation"]],
    ["/customers", ["customer management", "customers", "crm"]],
    ["/drivers", ["driver management", "drivers"]],
    ["/pricing", ["pricing engine", "pricing"]],
    ["/reports", ["reporting", "analytics dashboard", "reports"]],
    ["/settings", ["admin settings", "settings"]],
    ["/login", ["login", "authentication"]],
    ["/about", ["about"]],
    ["/contact", ["contact"]],
    ["/get-started", ["get started"]]
  ];

  for (const [route, terms] of pageRules) {
    if (
      contains(
        source,
        ...terms.map(
          (term) => term.toLowerCase()
        )
      )
    ) {
      pages.push(route);
    }
  }

  const apiRoutes: string[] = [];

  const apiRules: Array<
    [string, string[]]
  > = [
    ["/api/bookings", ["booking", "reservation"]],
    ["/api/customers", ["customer", "crm"]],
    ["/api/drivers", ["driver"]],
    ["/api/vehicles", ["vehicle", "fleet"]],
    ["/api/dispatch", ["dispatch"]],
    ["/api/pricing", ["pricing"]],
    ["/api/reports", ["report", "analytics"]],
    ["/api/settings", ["settings"]]
  ];

  for (const [route, terms] of apiRules) {
    if (contains(source, ...terms)) {
      apiRoutes.push(route);
    }
  }

  const modelRules: Array<
    [string, string[]]
  > = [
    ["User", ["user", "authentication", "role"]],
    ["Customer", ["customer", "crm"]],
    ["Booking", ["booking", "reservation"]],
    ["Driver", ["driver"]],
    ["Vehicle", ["vehicle", "fleet"]],
    [
      "DispatchAssignment",
      ["dispatch assignment", "assign driver", "assign vehicle"]
    ],
    ["PricingRule", ["pricing rule", "pricing engine"]],
    ["ServiceArea", ["service area", "servicearea"]],
    [
      "CompanySetting",
      ["company setting", "admin settings", "settings"]
    ]
  ];

  // PROMPT_CONTRACT_EXPLICIT_MODEL_IDENTIFIER_SUPPORT
  //
  // Explicit model identifiers are authoritative requirements.
  // Recognize both natural-language phrases such as "service area"
  // and schema-style identifiers such as ServiceArea,
  // DispatchAssignment, PricingRule, and CompanySetting.
  const compactPrompt =
    originalPrompt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const models =
    modelRules
      .filter(
        ([name, terms]) => {
          const compactModelName =
            String(name)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

          return (
            contains(
              source,
              ...terms
            ) ||
            (
              compactModelName.length > 0 &&
              compactPrompt.includes(
                compactModelName
              )
            )
          );
        }
      )
      .map(
        ([name]) => ({
          name,
          required: true
        })
      );

  const roles: string[] = [];

  // PROMPT_CONTRACT_EXPLICIT_ROLE_SCOPE
  //
  // Explicit role declarations are authoritative customer requirements.
  // Support both inline and multiline/bulleted forms:
  //
  //   Authentication roles: admin, dispatcher, customer
  //
  //   Authentication roles:
  //   - admin
  //   - dispatcher
  //   - customer
  //
  // Do not infer roles merely because the same words appear in models,
  // workflows, features, or general prose.
  const explicitRoleValues: string[] = [];

  const allowedRoles = [
    "admin",
    "dispatcher",
    "customer",
    "driver",
    "operator",
  ];

  const lines =
    originalPrompt
      .replace(/\r\n/g, "\n")
      .split("\n");

  for (
    let index = 0;
    index < lines.length;
    index += 1
  ) {
    const line =
      String(
        lines[index] || ""
      );

    const declaration =
      line.match(
        /^\s*(?:authentication\s+roles?|user\s+roles?|roles?)\s*:\s*(.*)$/i
      );

    if (!declaration) {
      continue;
    }

    const declaredChunks: string[] = [];

    const inline =
      String(
        declaration[1] || ""
      ).trim();

    if (inline) {
      declaredChunks.push(
        inline
      );
    }

    // Continue through following bullet/plain role lines until a blank line,
    // another heading, sentence-style prose, or unrelated content begins.
    for (
      let cursor = index + 1;
      cursor < lines.length;
      cursor += 1
    ) {
      const nextRaw =
        String(
          lines[cursor] || ""
        );

      const next =
        nextRaw.trim();

      if (!next) {
        break;
      }

      // Another explicit section/header starts here.
      if (
        /^[A-Za-z][A-Za-z0-9 /_-]*:\s*$/.test(
          next
        )
      ) {
        break;
      }

      const cleaned =
        next
          .replace(
            /^[-*•]\s*/,
            ""
          )
          .replace(
            /^\d+[.)]\s*/,
            ""
          )
          .trim();

      if (!cleaned) {
        break;
      }

      const normalized =
        cleaned
          .toLowerCase()
          .replace(
            /[^a-z0-9_-]/g,
            " "
          )
          .trim();

      const looksLikeRoleLine =
        normalized
          .split(/\s+/)
          .filter(Boolean)
          .every(
            (token) =>
              allowedRoles.includes(
                token
              ) ||
              token === "and"
          );

      if (!looksLikeRoleLine) {
        break;
      }

      declaredChunks.push(
        cleaned
      );

      index = cursor;
    }

    const declaredRoles =
      declaredChunks
        .join(",")
        .toLowerCase()
        .split(
          /[,;]|\band\b|\s+/
        )
        .map(
          (value) =>
            value
              .replace(
                /[^a-z0-9_-]/g,
                ""
              )
              .trim()
        )
        .filter(Boolean);

    explicitRoleValues.push(
      ...declaredRoles
    );
  }

  for (const role of allowedRoles) {
    if (
      explicitRoleValues.includes(
        role
      )
    ) {
      roles.push(role);
    }
  }

  const features: string[] = [];

  const featureTerms = [
    "booking",
    "dispatch",
    "fleet management",
    "driver management",
    "crm",
    "pricing engine",
    "reporting",
    "analytics",
    "authentication",
    "persistent data",
    "sample data",
    "role-aware authentication",
    "vehicle assignment",
    "driver assignment",
    "trip status",
    "payment status"
  ];

  for (const term of featureTerms) {
    if (source.includes(term)) {
      features.push(term);
    }
  }

  const workflows: PromptContractWorkflow[] = [];

  if (
    contains(
      source,
      "booking",
      "reservation"
    )
  ) {
    workflows.push({
      name: "Customer booking",
      required: true,
      steps: [
        "trip-details",
        "vehicle-selection",
        "customer-details",
        "review",
        "confirmation",
        "persist-booking"
      ]
    });
  }

  if (source.includes("dispatch")) {
    workflows.push({
      name: "Dispatch operations",
      required: true,
      steps: [
        "view-trips",
        "assign-driver",
        "assign-vehicle",
        "update-trip-status"
      ]
    });
  }

  if (source.includes("pricing")) {
    workflows.push({
      name: "Pricing management",
      required: true,
      steps: [
        "edit-pricing-rules",
        "calculate-estimate"
      ]
    });
  }

  const productName =
    String(
      buildSpec?.productName ||
      buildSpec?.name ||
      ""
    ).trim() ||
    (
      originalPrompt.match(
        /\bcalled\s+([A-Z][A-Za-z0-9 ]{2,80})/i
      )?.[1]?.trim() ||
      "Generated Application"
    );

  return {
    version: "1.0",

    source:
      "customer-prompt",

    productName,

    productType:
      String(
        buildSpec?.productType ||
        (
          contains(
            source,
            "saas",
            "web application",
            "platform"
          )
            ? "web-application"
            : "website"
        )
      ),

    industry:
      String(
        buildSpec?.industry ||
        "general"
      ),

    pages:
      unique(pages).map(
        (route) => ({
          route,
          name:
            routeName(route),
          required: true
        })
      ),

    apiRoutes:
      unique(apiRoutes).map(
        (route) => ({
          route,
          methods: [
            "GET",
            "POST"
          ],
          required: true
        })
      ),

    models,

    roles:
      unique(roles),

    features:
      unique(features),

    workflows,

    integrations: [],

    uiStates: [
      "loading",
      "empty",
      "error",
      "success"
    ],

    quality: {
      responsive: true,
      productionBuildRequired: true,
      livePreviewRequired: true,
      persistentDataRequired:
        contains(
          source,
          "persist",
          "persistent",
          "database"
        ),
      noPlaceholderContent: true,
      noDeadActions: true
    },

    originalPrompt
  };
}
