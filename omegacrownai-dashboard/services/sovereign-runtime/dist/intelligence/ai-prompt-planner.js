function getApiKey() {
    return String(process.env.OPENAI_API_KEY || "").trim();
}
function getModel() {
    return String(process.env.OMEGACROWN_PLANNER_MODEL ||
        process.env.OPENAI_MODEL ||
        "gpt-5.5").trim();
}
function extractOutputText(response) {
    if (typeof response?.output_text === "string" &&
        response.output_text.trim()) {
        return response.output_text.trim();
    }
    const parts = [];
    for (const item of response?.output || []) {
        for (const content of item?.content || []) {
            if (typeof content?.text === "string") {
                parts.push(content.text);
            }
        }
    }
    return parts.join("\n").trim();
}
function parseJsonObject(text) {
    const trimmed = text.trim();
    try {
        return JSON.parse(trimmed);
    }
    catch { }
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
        return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 &&
        end > start) {
        return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI planner returned no parseable JSON object");
}
function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return Array.from(new Set(value
        .map((item) => String(item || "").trim())
        .filter(Boolean)));
}
function mergePromptContractPages(fallbackPages, aiPages) {
    const merged = new Map();
    for (const page of fallbackPages || []) {
        const route = String(page?.route || "").trim();
        if (!route)
            continue;
        merged.set(route, {
            route,
            name: String(page?.name ||
                route).trim(),
            required: page?.required !== false,
        });
    }
    for (const page of aiPages || []) {
        const route = String(page?.route || "").trim();
        if (!route.startsWith("/")) {
            continue;
        }
        const existing = merged.get(route);
        merged.set(route, {
            route,
            name: String(page?.name ||
                existing?.name ||
                route).trim(),
            required: existing?.required === true ||
                page?.required !== false,
        });
    }
    return Array.from(merged.values());
}
function mergePromptContractApis(fallbackApis, aiApis) {
    const merged = new Map();
    for (const api of fallbackApis || []) {
        const route = String(api?.route || "").trim();
        if (!route)
            continue;
        merged.set(route, {
            route,
            methods: normalizeStringArray(api?.methods).length
                ? normalizeStringArray(api?.methods)
                : ["GET", "POST"],
            required: api?.required !== false,
        });
    }
    for (const api of aiApis || []) {
        const route = String(api?.route || "").trim();
        if (!route.startsWith("/api/")) {
            continue;
        }
        const existing = merged.get(route);
        merged.set(route, {
            route,
            methods: Array.from(new Set([
                ...(existing?.methods ||
                    []),
                ...(normalizeStringArray(api?.methods).length
                    ? normalizeStringArray(api?.methods)
                    : ["GET", "POST"]),
            ])),
            required: existing?.required === true ||
                api?.required !== false,
        });
    }
    return Array.from(merged.values());
}
function mergePromptContractModels(fallbackModels, aiModels) {
    const merged = new Map();
    for (const model of fallbackModels || []) {
        const name = String(model?.name || "").trim();
        if (!name)
            continue;
        merged.set(name.toLowerCase(), {
            name,
            required: model?.required !== false,
        });
    }
    for (const model of aiModels || []) {
        const name = String(model?.name || "").trim();
        if (!name)
            continue;
        const key = name.toLowerCase();
        const existing = merged.get(key);
        merged.set(key, {
            name: existing?.name ||
                name,
            required: existing?.required === true ||
                model?.required !== false,
        });
    }
    return Array.from(merged.values());
}
function mergePromptContractStrings(fallbackValues, aiValues) {
    return Array.from(new Set([
        ...normalizeStringArray(fallbackValues),
        ...normalizeStringArray(aiValues),
    ]));
}
function mergePromptContractWorkflows(fallbackWorkflows, aiWorkflows) {
    const merged = new Map();
    for (const workflow of fallbackWorkflows || []) {
        const name = String(workflow?.name || "").trim();
        if (!name)
            continue;
        merged.set(name.toLowerCase(), {
            name,
            required: workflow?.required !== false,
            steps: normalizeStringArray(workflow?.steps),
        });
    }
    for (const workflow of aiWorkflows || []) {
        const name = String(workflow?.name || "").trim();
        if (!name)
            continue;
        const key = name.toLowerCase();
        const existing = merged.get(key);
        merged.set(key, {
            name: existing?.name ||
                name,
            required: existing?.required === true ||
                workflow?.required !== false,
            steps: Array.from(new Set([
                ...(existing?.steps ||
                    []),
                ...normalizeStringArray(workflow?.steps),
            ])),
        });
    }
    return Array.from(merged.values());
}
// BRAIN_V2_AUTHORITATIVE_CONTRACT_RECONCILIATION
//
// Deterministic extraction establishes a minimum explicit requirement floor.
// AI planning may enrich or add semantics, but it may never silently remove
// an explicit page, API, model, role, feature, workflow, or quality obligation
// already proven from the customer's original prompt.
function normalizePlannerContract(input, fallback, originalPrompt) {
    const pages = Array.isArray(input?.pages)
        ? input.pages
        : [];
    const apiRoutes = Array.isArray(input?.apiRoutes)
        ? input.apiRoutes
        : [];
    const models = Array.isArray(input?.models)
        ? input.models
        : [];
    const workflows = Array.isArray(input?.workflows)
        ? input.workflows
        : [];
    return {
        version: "1.0",
        source: "customer-prompt",
        productName: String(input?.productName ||
            fallback.productName).trim(),
        productType: String(input?.productType ||
            fallback.productType).trim(),
        industry: String(input?.industry ||
            fallback.industry).trim(),
        pages: mergePromptContractPages(fallback.pages, pages),
        apiRoutes: mergePromptContractApis(fallback.apiRoutes, apiRoutes),
        models: mergePromptContractModels(fallback.models, models),
        roles: mergePromptContractStrings(fallback.roles, input?.roles),
        features: mergePromptContractStrings(fallback.features, input?.features),
        workflows: mergePromptContractWorkflows(fallback.workflows, workflows),
        integrations: mergePromptContractStrings(fallback.integrations, input?.integrations),
        uiStates: mergePromptContractStrings(fallback.uiStates, input?.uiStates),
        quality: {
            // Explicit customer quality requirements form a minimum floor.
            // AI may strengthen these obligations but may not weaken them.
            responsive: fallback.quality.responsive === true ||
                input?.quality?.responsive === true,
            productionBuildRequired: fallback.quality.productionBuildRequired === true ||
                input?.quality?.productionBuildRequired === true,
            livePreviewRequired: fallback.quality.livePreviewRequired === true ||
                input?.quality?.livePreviewRequired === true,
            persistentDataRequired: fallback.quality.persistentDataRequired === true ||
                input?.quality?.persistentDataRequired === true,
            noPlaceholderContent: fallback.quality.noPlaceholderContent === true ||
                input?.quality?.noPlaceholderContent === true,
            noDeadActions: fallback.quality.noDeadActions === true ||
                input?.quality?.noDeadActions === true,
        },
        originalPrompt
    };
}
export async function planPromptWithAI(input) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
    }
    const model = getModel();
    const instructions = `
You are the product architecture planner for OmegaCrownAI.

Your job is to read the ENTIRE customer request and convert it into a precise structured product contract.

Do not reduce the request to an industry template.
Do not omit requirements because the prompt is long.
Do not invent features the customer did not request unless they are technically necessary to make the requested product functional.

Return ONLY valid JSON.

The JSON shape must be:

{
  "productName": string,
  "productType": string,
  "industry": string,
  "pages": [
    {
      "route": string,
      "name": string,
      "required": boolean
    }
  ],
  "apiRoutes": [
    {
      "route": string,
      "methods": string[],
      "required": boolean
    }
  ],
  "models": [
    {
      "name": string,
      "required": boolean
    }
  ],
  "roles": string[],
  "features": string[],
  "workflows": [
    {
      "name": string,
      "required": boolean,
      "steps": string[]
    }
  ],
  "integrations": string[],
  "uiStates": string[],
  "quality": {
    "responsive": boolean,
    "productionBuildRequired": boolean,
    "livePreviewRequired": boolean,
    "persistentDataRequired": boolean,
    "noPlaceholderContent": boolean,
    "noDeadActions": boolean
  }
}

Rules:

1. Every explicitly requested page must appear.
2. Every explicitly requested API must appear.
3. Every explicitly requested data model must appear.
4. Roles must come from explicit role/authentication requirements.
5. Preserve the requested product architecture even if the industry matches an existing OmegaCrownAI template.
6. Capture major workflows and required interaction steps.
7. Capture requested persistence, validation, admin, dashboard, analytics, and quality requirements.
8. Do not mark an omitted requirement optional.
9. Treat the original customer prompt as authoritative.
`;
    const body = {
        model,
        instructions,
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: `Return the product contract as valid JSON only.\n\nCUSTOMER PROMPT:\n\n${input.prompt}\n\nDETERMINISTIC FALLBACK CONTRACT:\n\n${JSON.stringify(input.fallbackContract, null, 2)}`
                    }
                ]
            }
        ],
        text: {
            format: {
                type: "json_object"
            }
        }
    };
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const raw = await response.json();
    if (!response.ok) {
        throw new Error(`AI planner request failed: ${response.status} ${JSON.stringify(raw)}`);
    }
    const text = extractOutputText(raw);
    if (!text) {
        throw new Error("AI planner returned empty output");
    }
    const parsed = parseJsonObject(text);
    const contract = normalizePlannerContract(parsed, input.fallbackContract, input.prompt);
    return {
        ok: true,
        provider: "openai-responses",
        model,
        contract,
        raw
    };
}
