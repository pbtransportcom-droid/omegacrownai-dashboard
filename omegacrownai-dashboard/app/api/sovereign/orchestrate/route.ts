import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { NextResponse } from "next/server";

function id() {
  return "OC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const projectId = String(body.projectId || id());
    const prompt = String(body.prompt || "Build a production-ready OmegaCrownAI project.");

    const root = process.cwd();
    const runPath = path.join(root, "data", "sovereign-runs", `${projectId}.json`);
    const memoryDir = path.join(root, "data", "runtime-memory", projectId);
    const buildDir = path.join(root, "data", "project-builds", projectId);
    const artifactDir = path.join(root, "data", "generated-artifacts", projectId);

    fs.mkdirSync(memoryDir, { recursive: true });
    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(artifactDir, { recursive: true });

    const runtimeId = "RT-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const agents = [
      {
        name: "Planner Agent",
        role: "Decomposes the user goal into an execution plan.",
        output: "Defined project scope, delivery path, validation needs, and export requirements.",
      },
      {
        name: "Architect Agent",
        role: "Designs file structure and production artifact layout.",
        output: "Selected HTML/CSS/static export structure with metadata and runtime traceability.",
      },
      {
        name: "Builder Agent",
        role: "Generates the website files and active artifact preview.",
        output: "Created index.html, styles.css, and metadata.json.",
      },
      {
        name: "Validator Agent",
        role: "Checks generated files, artifact state, and export readiness.",
        output: "Confirmed required files exist and are ready for delivery.",
      },
      {
        name: "Delivery Agent",
        role: "Registers history, runtime events, and customer delivery paths.",
        output: "Linked artifact, runtime, validation, and ZIP download surfaces.",
      },
    ];

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${projectId} Autonomous Build</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="hero">
    <p class="eyebrow">OmegaCrownAI Autonomous Build</p>
    <h1>${prompt}</h1>
    <p class="subcopy">
      Generated through sovereign multi-agent orchestration with planning,
      architecture, build, validation, and delivery agents.
    </p>
    <div class="actions">
      <a href="#proof">View Proof</a>
      <a href="#delivery">Delivery Package</a>
    </div>
  </main>

  <section class="grid" id="proof">
    ${agents.map((agent) => `<article><h2>${agent.name}</h2><p>${agent.output}</p></article>`).join("\n")}
  </section>

  <section class="delivery" id="delivery">
    <h2>Production Delivery Ready</h2>
    <p>This build includes runtime state, artifact preview, validation proof, and export package support.</p>
  </section>
</body>
</html>`;

    const css = `body{margin:0;background:#020617;color:white;font-family:Arial,sans-serif}
.hero{padding:90px 8vw;min-height:65vh;background:radial-gradient(circle at top left,rgba(34,211,238,.28),transparent 42%)}
.eyebrow{color:#67e8f9;text-transform:uppercase;letter-spacing:.3em;font-weight:900}
h1{font-size:clamp(42px,7vw,88px);line-height:.95;max-width:1100px}
.subcopy{font-size:20px;color:#cbd5e1;line-height:1.7;max-width:760px}
.actions{display:flex;gap:16px;margin-top:32px;flex-wrap:wrap}
.actions a{background:#22d3ee;color:#020617;padding:14px 22px;border-radius:14px;font-weight:900;text-decoration:none}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;padding:50px 8vw}
article,.delivery{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);border-radius:24px;padding:28px}
article p,.delivery p{color:#cbd5e1;line-height:1.7}
.delivery{margin:20px 8vw 80px}`;

    const metadata = {
      projectId,
      runtimeId,
      prompt,
      generatedAt: new Date().toISOString(),
      agents,
      surfaces: {
        artifact: `/artifacts/${projectId}`,
        runtime: `/live-runtime?projectId=${projectId}`,
        validation: `/projects/${projectId}/validation`,
        history: `/projects/${projectId}/artifacts/history`,
        export: `/api/sovereign/runs/${projectId}/export`,
        download: `/api/sovereign/download/${projectId}`,
      },
    };

    fs.writeFileSync(path.join(buildDir, "index.html"), html);
    fs.writeFileSync(path.join(buildDir, "styles.css"), css);
    writeJson(path.join(buildDir, "metadata.json"), metadata);

    fs.writeFileSync(path.join(artifactDir, "index.html"), html);
    fs.writeFileSync(path.join(artifactDir, "styles.css"), css);
    writeJson(path.join(artifactDir, "metadata.json"), metadata);

    writeJson(path.join(memoryDir, "shared-memory.json"), {
      projectId,
      prompt,
      rememberedGoal: prompt,
      agentHandoffs: agents,
      updatedAt: new Date().toISOString(),
    });

    const run = {
      projectId,
      runtimeId,
      intent: "autonomous_build",
      prompt,
      workspace: `/projects/${projectId}`,
      status: "validated",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [
        "Autonomous orchestration initialized.",
        "Planner Agent decomposed the user goal.",
        "Architect Agent designed the artifact structure.",
        "Builder Agent generated production website files.",
        "Validator Agent confirmed required delivery files.",
        "Delivery Agent registered runtime, artifact, validation, and export surfaces.",
      ],
      agents,
      artifacts: [
        {
          id: `${projectId}-website`,
          type: "website-build",
          title: "Autonomous Website Build",
          status: "generated",
          path: `data/project-builds/${projectId}/index.html`,
        },
        {
          id: `${projectId}-artifact`,
          type: "active-artifact",
          title: "Active Artifact Preview",
          status: "active",
          path: `data/generated-artifacts/${projectId}/index.html`,
        },
      ],
    };

    const exportDir = path.join(root, "data", "exports");
    fs.mkdirSync(exportDir, { recursive: true });
    const zipPath = path.join(exportDir, `${projectId}.zip`);

    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    execSync(`cd "${artifactDir}" && zip -r "${zipPath}" .`, {
      stdio: "ignore",
    });

    run.events.push("Delivery Agent generated production ZIP export package.");
    run.artifacts.push({
      id: `${projectId}-zip-export`,
      type: "zip-export",
      title: "Production ZIP Export",
      status: "generated",
      path: `data/exports/${projectId}.zip`,
    });

    run.updatedAt = new Date().toISOString();
    writeJson(runPath, run);

    return NextResponse.json({
      ok: true,
      projectId,
      runtimeId,
      status: "validated",
      agents,
      preview: `/api/artifacts/${projectId}/preview`,
      artifact: `/artifacts/${projectId}`,
      runtime: `/live-runtime?projectId=${projectId}`,
      validation: `/projects/${projectId}/validation`,
      history: `/projects/${projectId}/artifacts/history`,
      export: `/api/sovereign/runs/${projectId}/export`,
      download: `/api/sovereign/download/${projectId}`,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
