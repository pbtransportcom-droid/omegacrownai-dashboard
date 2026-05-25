import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

function safeText(value: unknown, fallback = "") {
  return String(value || fallback).trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const projectId =
      safeText(body.projectId) ||
      "OC-" + Math.random().toString(36).slice(2, 10).toUpperCase();

    const prompt = safeText(body.prompt, "Build a premium OmegaCrownAI website.");

    const buildDir = path.join(process.cwd(), "data", "project-builds", projectId);
    const artifactDir = path.join(process.cwd(), "data", "generated-artifacts", projectId);
    const runPath = path.join(process.cwd(), "data", "sovereign-runs", `${projectId}.json`);

    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(artifactDir, { recursive: true });

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${projectId} Website Build</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="hero">
    <p class="eyebrow">OmegaCrownAI Sovereign Website Build</p>
    <h1>${prompt}</h1>
    <p class="subcopy">
      Built by OmegaCrownAI as a customer-ready website artifact with preview,
      export, runtime tracking, and deployment package support.
    </p>
    <div class="actions">
      <a href="#services">Explore Services</a>
      <a href="#contact">Start Project</a>
    </div>
  </main>

  <section id="services" class="grid">
    <article><h2>Strategy</h2><p>Premium positioning and launch-ready messaging.</p></article>
    <article><h2>Automation</h2><p>Workflow-ready structure for modern AI operations.</p></article>
    <article><h2>Delivery</h2><p>Exportable production files and deployment package support.</p></article>
  </section>

  <section id="contact" class="contact">
    <h2>Ready to Launch?</h2>
    <p>OmegaCrownAI generated this website package for sovereign production delivery.</p>
  </section>
</body>
</html>`;

    const css = `body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #020617;
  color: white;
}

.hero {
  min-height: 70vh;
  padding: 80px 8vw;
  background: radial-gradient(circle at top left, rgba(34,211,238,.25), transparent 40%);
}

.eyebrow {
  color: #67e8f9;
  text-transform: uppercase;
  letter-spacing: .3em;
  font-weight: 900;
}

h1 {
  max-width: 1000px;
  font-size: clamp(44px, 7vw, 92px);
  line-height: .95;
}

.subcopy {
  max-width: 720px;
  color: #cbd5e1;
  font-size: 20px;
  line-height: 1.7;
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.actions a {
  color: #020617;
  background: #22d3ee;
  padding: 14px 22px;
  border-radius: 14px;
  font-weight: 900;
  text-decoration: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  padding: 40px 8vw;
}

article, .contact {
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  border-radius: 24px;
  padding: 28px;
}

.contact {
  margin: 40px 8vw 80px;
}`;

    const metadata = {
      projectId,
      prompt,
      type: "website",
      generatedAt: new Date().toISOString(),
      files: ["index.html", "styles.css", "metadata.json"],
    };

    fs.writeFileSync(path.join(buildDir, "index.html"), html);
    fs.writeFileSync(path.join(buildDir, "styles.css"), css);
    fs.writeFileSync(path.join(buildDir, "metadata.json"), JSON.stringify(metadata, null, 2));

    fs.writeFileSync(path.join(artifactDir, "index.html"), html);
    fs.writeFileSync(path.join(artifactDir, "styles.css"), css);
    fs.writeFileSync(path.join(artifactDir, "metadata.json"), JSON.stringify(metadata, null, 2));

    if (fs.existsSync(runPath)) {
      const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
      run.events = Array.isArray(run.events) ? run.events : [];
      run.artifacts = Array.isArray(run.artifacts) ? run.artifacts : [];

      run.events.push("Real website build generated and registered.");
      run.artifacts.push({
        id: `${projectId}-website-build-${Date.now()}`,
        type: "website-build",
        title: "Generated Website Build",
        status: "generated",
        path: `data/project-builds/${projectId}/index.html`,
      });

      run.status = "running";
      run.updatedAt = new Date().toISOString();

      fs.writeFileSync(runPath, JSON.stringify(run, null, 2));
    }

    return NextResponse.json({
      ok: true,
      projectId,
      buildPath: `data/project-builds/${projectId}`,
      artifactPath: `data/generated-artifacts/${projectId}`,
      preview: `/api/artifacts/${projectId}/preview`,
      history: `/projects/${projectId}/artifacts/history`,
      download: `/api/sovereign/download/${projectId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
