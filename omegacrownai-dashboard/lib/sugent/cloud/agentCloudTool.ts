import { dispatchCloudJob } from "./dispatcher";
import { detectProvider, validateCloudJob } from "./policy";

export function shouldUseCloudExecution(message: string) {
  const text = String(message || "").toLowerCase();

  return [
    "run a cloud job",
    "cloud job",
    "execute this in the cloud",
    "schedule a background job",
    "run this on aws",
    "run this on gcp",
    "run this on azure",
    "run this on vercel",
    "run this on fly",
    "multi-cloud",
    "background pipeline",
    "refresh pipeline",
  ].some((phrase) => text.includes(phrase));
}

export function extractJsonPayload(message: string) {
  const text = String(message || "");

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }

  const payloadIndex = text.toLowerCase().indexOf("payload:");
  if (payloadIndex !== -1) {
    const after = text.slice(payloadIndex + "payload:".length).trim();
    try {
      return JSON.parse(after);
    } catch {}
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (match?.[0]) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }

  return {};
}

export function detectJobType(message: string) {
  const text = String(message || "").toLowerCase();

  if (text.includes("scrape")) return "scrape";
  if (text.includes("pipeline")) return "pipeline";
  if (text.includes("automation")) return "run_automation";
  if (text.includes("browser")) return "browser_batch";
  if (text.includes("market")) return "market_refresh";

  return "generic";
}

export async function runAgentCloudTool({
  projectId,
  sessionId,
  runtimeSessionId,
  message,
}: {
  projectId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  message: string;
}) {
  const provider = detectProvider(message);
  const jobType = detectJobType(message);
  const payload = extractJsonPayload(message);

  const validation = validateCloudJob({
    provider,
    payload,
  });

  if (!validation.ok) {
    return {
      ok: false,
      intent: "cloud_execution",
      reply: `Cloud job blocked: ${validation.error}`,
      actions: [
        {
          type: "cloud_job_run",
          status: "blocked",
          provider,
          jobType,
          reason: validation.error,
        },
      ],
      error: validation.error,
    };
  }

  const job = await dispatchCloudJob({
    projectId: projectId || "global",
    buildId: "agent-cloud-job",
    type: jobType,
    payload: {
      provider,
      jobType,
      source: "agent_tool",
      sessionId,
      runtimeSessionId,
      ...payload,
    },
  });

  return {
    ok: true,
    intent: "cloud_execution",
    reply: `Cloud job queued. Job ID: ${job?.id || "unknown"}, provider: ${provider}.`,
    actions: [
      {
        type: "cloud_job_run",
        projectId,
        jobId: job?.id,
        provider,
        jobType,
        status: job?.status || "queued",
      },
    ],
    job,
    error: null,
  };
}
