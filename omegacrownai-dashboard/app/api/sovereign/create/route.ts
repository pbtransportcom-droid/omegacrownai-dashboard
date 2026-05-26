import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function detectIntent(prompt: string) {
  const value = prompt.toLowerCase();

  if (value.includes("podcast")) return "podcast";
  if (value.includes("video")) return "video";
  if (value.includes("music")) return "music";
  if (value.includes("marketing")) return "marketing";
  if (value.includes("trading")) return "trading";
  if (value.includes("website")) return "website";
  if (value.includes("app")) return "app";

  return "workspace";
}

function workspaceRoute(intent: string) {
  switch (intent) {
    case "video":
      return "/video-studio";

    case "podcast":
      return "/studio";

    case "music":
      return "/studio";

    case "marketing":
      return "/studio";

    case "trading":
      return "/trade";

    case "website":
      return "/create?type=website";

    case "app":
      return "/create?type=app";

    default:
      return "/projects";
  }
}

function buildArtifactFiles(projectId: string, runtimeId: string, intent: string, prompt: string) {
  const title = prompt.slice(0, 90) || "OmegaCrownAI Sovereign Build";

  const brief = `# ${title}

Project ID: ${projectId}
Runtime ID: ${runtimeId}
Intent: ${intent}

## User Brief
${prompt}

## Sovereign Interpretation
OmegaCrownAI has initialized an autonomous build mission for this request. The system will convert the brief into structured execution, generated assets, project planning, and customer-ready output surfaces.
`;

  const plan = `# Sovereign Execution Plan

## Mission
${prompt}

## Execution Phases
1. Interpret the build request.
2. Generate project structure.
3. Produce first customer-ready artifact.
4. Prepare preview surface.
5. Register runtime events.
6. Persist generated outputs.

## Runtime
- Project: ${projectId}
- Runtime: ${runtimeId}
- Intent: ${intent}
`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #020617; color: white; }
    main { max-width: 1100px; margin: 0 auto; padding: 64px 24px; }
    .card { border: 1px solid rgba(34,211,238,.35); background: rgba(15,23,42,.9); border-radius: 28px; padding: 36px; }
    .eyebrow { color: #67e8f9; letter-spacing: .25em; text-transform: uppercase; font-size: 12px; font-weight: 900; }
    h1 { font-size: 54px; line-height: 1; margin: 20px 0; }
    p { color: #cbd5e1; line-height: 1.8; font-size: 18px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 30px; }
    .box { border: 1px solid rgba(255,255,255,.12); border-radius: 20px; padding: 20px; background: rgba(255,255,255,.05); }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <div class="eyebrow">OmegaCrownAI Generated Artifact</div>
      <h1>${title}</h1>
      <p>${prompt}</p>
      <div class="grid">
        <div class="box"><strong>Project</strong><br/>${projectId}</div>
        <div class="box"><strong>Runtime</strong><br/>${runtimeId}</div>
        <div class="box"><strong>Intent</strong><br/>${intent}</div>
      </div>
    </section>
  </main>
</body>
</html>`;

  return { brief, plan, html };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = String(body?.prompt || "");
    const intent = detectIntent(prompt);
    const mode = String(body?.mode || body?.type || intent || "general");

    const projectId =
      "OC-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const runtimeId =
      "RT-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const workspace = workspaceRoute(intent);

    const artifactDir = path.join(process.cwd(), "data", "generated-artifacts", projectId);
    fs.mkdirSync(artifactDir, { recursive: true });

    const generated = buildArtifactFiles(projectId, runtimeId, intent, prompt);

    fs.writeFileSync(path.join(artifactDir, "brief.md"), generated.brief);
    fs.writeFileSync(path.join(artifactDir, "plan.md"), generated.plan);
    fs.writeFileSync(path.join(artifactDir, "index.html"), generated.html);

    const runRecord = {
      projectId,
      runtimeId,
      intent,
      mode,
      prompt,
      workspace,
      status: "initializing",
      createdAt: new Date().toISOString(),
      events: [
        "Sovereign execution pipeline initialized.",
        "Intent classified.",
        "Runtime orchestration started.",
        "Project shell created.",
        "Live execution feed prepared."
      ],
      artifacts: [
        {
          id: `${projectId}-brief`,
          type: "brief",
          title: "Initial Sovereign Project Brief",
          status: "generated",
          path: `data/generated-artifacts/${projectId}/brief.md`
        },
        {
          id: `${projectId}-runtime`,
          type: "runtime",
          title: "Runtime Execution Session",
          status: "active",
          path: `data/sovereign-runs/${projectId}.json`
        },
        {
          id: `${projectId}-preview`,
          type: "html",
          title: "Generated Preview Artifact",
          status: "generated",
          path: `data/generated-artifacts/${projectId}/index.html`
        }
      ]
    };

    const dataDir = path.join(process.cwd(), "data", "sovereign-runs");
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(
      path.join(dataDir, `${projectId}.json`),
      JSON.stringify(runRecord, null, 2)
    );

    return NextResponse.json({
      ok: true,
      sovereign: true,
      intent,
      mode,
      projectId,
      runtimeId,
      workspace,
      status: "initializing",
      runtime: {
        queue: "active",
        orchestration: "running",
        agents: "deploying",
      },
      artifacts: {
        brief: `data/generated-artifacts/${projectId}/brief.md`,
        plan: `data/generated-artifacts/${projectId}/plan.md`,
        preview: `data/generated-artifacts/${projectId}/index.html`,
      },
      message:
        "OmegaCrownAI sovereign execution pipeline initialized with generated artifacts.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to initialize sovereign create engine.",
      },
      { status: 500 }
    );
  }
}
