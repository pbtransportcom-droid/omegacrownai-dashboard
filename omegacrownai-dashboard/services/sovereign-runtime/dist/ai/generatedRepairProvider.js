// GENERATED_APP_REAL_AI_REPAIR_PROVIDER
//
// The model is proposal-only.
// It cannot write files or bypass the universal C6 repair executor.
const RESPONSES_URL = process.env.OPENAI_RESPONSES_URL ||
    "https://api.openai.com/v1/responses";
const MAX_FILES = 12;
const MAX_FILE_BYTES = 120_000;
const MAX_EVIDENCE = 100;
function apiKey() {
    const value = String(process.env.OPENAI_API_KEY ||
        "").trim();
    if (!value) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }
    return value;
}
function repairModel() {
    const value = String(process.env.OMEGACROWN_REPAIR_MODEL ||
        process.env.OPENAI_MODEL ||
        "").trim();
    if (!value) {
        throw new Error("OMEGACROWN_REPAIR_MODEL is not configured.");
    }
    return value;
}
function normalizeRequest(request) {
    return {
        projectId: String(request.projectId || "").trim(),
        attempt: Math.max(1, Number(request.attempt || 1)),
        diagnosis: {
            category: String(request.diagnosis?.category ||
                "unknown"),
            message: String(request.diagnosis?.message ||
                ""),
            failingFile: request.diagnosis?.failingFile
                ? String(request.diagnosis.failingFile)
                : null,
            line: Number.isFinite(request.diagnosis?.line)
                ? Number(request.diagnosis.line)
                : null,
            column: Number.isFinite(request.diagnosis?.column)
                ? Number(request.diagnosis.column)
                : null,
            evidence: Array.isArray(request.diagnosis?.evidence)
                ? request.diagnosis.evidence
                    .slice(-MAX_EVIDENCE)
                    .map(String)
                : [],
            repairEligible: request.diagnosis
                ?.repairEligible === true,
        },
        files: Array.isArray(request.files)
            ? request.files
                .slice(0, MAX_FILES)
                .map((item) => ({
                file: String(item.file || "").trim(),
                content: String(item.content || "").slice(0, MAX_FILE_BYTES),
            }))
                .filter(item => item.file.length > 0)
            : [],
    };
}
function responseText(payload) {
    if (typeof payload?.output_text ===
        "string" &&
        payload.output_text.trim()) {
        return payload.output_text;
    }
    for (const item of Array.isArray(payload?.output)
        ? payload.output
        : []) {
        for (const content of Array.isArray(item?.content)
            ? item.content
            : []) {
            if (content?.type === "output_text" &&
                typeof content?.text === "string") {
                return content.text;
            }
        }
    }
    throw new Error("OpenAI response contained no output text.");
}
function validateProposal(raw, model) {
    if (!raw ||
        typeof raw !== "object") {
        throw new Error("Repair proposal is not an object.");
    }
    const summary = String(raw.summary || "").trim();
    if (!summary) {
        throw new Error("Repair proposal summary is empty.");
    }
    const files = Array.isArray(raw.files)
        ? raw.files
        : [];
    if (files.length < 1 ||
        files.length > MAX_FILES) {
        throw new Error("Repair proposal has invalid file count.");
    }
    const normalized = files.map((item) => {
        const file = String(item?.file || "").trim();
        const content = String(item?.content ?? "");
        if (!file) {
            throw new Error("Repair proposal contains empty path.");
        }
        return {
            file,
            content,
        };
    });
    return {
        provider: "openai-responses",
        model,
        summary,
        files: normalized,
    };
}
export function getGeneratedRepairProviderStatus() {
    return {
        provider: "openai-responses",
        configured: Boolean(String(process.env.OPENAI_API_KEY ||
            "").trim()),
        model: String(process.env.OMEGACROWN_REPAIR_MODEL ||
            process.env.OPENAI_MODEL ||
            ""),
    };
}
export async function generateGeneratedAppRepairProposal(request) {
    const key = apiKey();
    const model = repairModel();
    const normalized = normalizeRequest(request);
    if (normalized.diagnosis
        .repairEligible !== true) {
        throw new Error("Diagnosis is not repair eligible.");
    }
    if (normalized.files.length === 0) {
        throw new Error("No source files were supplied for repair.");
    }
    const systemInstruction = [
        "You are the OmegaCrownAI universal generated-application repair model.",
        "Repair the diagnosed production build failure without removing requested product functionality.",
        "Return complete replacement contents only for files that need modification.",
        "Prefer the smallest correct repair.",
        "Do not output patches or diffs.",
        "Do not output markdown fences.",
        "Do not alter secrets, .env files, node_modules, .next, runtime state, logs, repair backups, or generated build output.",
        "Do not invent industry-specific behavior.",
        "Do not simplify the application merely to make compilation pass.",
        "A separate trusted executor validates every path and performs all filesystem mutation."
    ].join("\n");
    const response = await fetch(RESPONSES_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            instructions: systemInstruction,
            input: JSON.stringify({
                task: "Repair generated Next.js production build failure.",
                projectId: normalized.projectId,
                attempt: normalized.attempt,
                diagnosis: normalized.diagnosis,
                sourceFiles: normalized.files,
            }, null, 2),
            text: {
                format: {
                    type: "json_schema",
                    name: "generated_application_repair",
                    strict: true,
                    schema: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            summary: {
                                type: "string",
                            },
                            files: {
                                type: "array",
                                minItems: 1,
                                maxItems: MAX_FILES,
                                items: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: {
                                        file: {
                                            type: "string",
                                        },
                                        content: {
                                            type: "string",
                                        },
                                    },
                                    required: [
                                        "file",
                                        "content",
                                    ],
                                },
                            },
                        },
                        required: [
                            "summary",
                            "files",
                        ],
                    },
                },
            },
        }),
        signal: AbortSignal.timeout(120_000),
    });
    const payload = await response
        .json()
        .catch(() => null);
    if (!response.ok) {
        throw new Error(`OpenAI repair provider HTTP ${response.status}: ${String(payload?.error?.message ||
            "unknown provider error")}`);
    }
    const text = responseText(payload);
    let parsed;
    try {
        parsed =
            JSON.parse(text);
    }
    catch {
        throw new Error("OpenAI repair provider returned invalid JSON.");
    }
    return validateProposal(parsed, model);
}
