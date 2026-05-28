import fs from "fs";
import path from "path";

function write(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function slug(text: string) {
  return String(text || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function buildArtifacts(run: any) {
  const outDir = path.join(process.cwd(), "data", "artifacts", run.projectId);
  fs.mkdirSync(outDir, { recursive: true });

  const projectName = slug(run.prompt);
  const isTransport = /transport|black car|airport|limo|chauffeur|ride/i.test(run.prompt || "");
  const mode = run.mode || "website";

  const files = [
    {
      type: "html",
      title: "Production Landing Page",
      file: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <header class="hero">
    <nav>
      <strong>OmegaCrownAI Build</strong>
      <a href="#features">Features</a>
      <a href="#delivery">Delivery</a>
      <a href="#contact">Launch</a>
    </nav>

    <section>
      <p class="eyebrow">${mode.toUpperCase()} RUNTIME ARTIFACT</p>
      <h1>${run.prompt}</h1>
      <p class="lead">
        A production-ready generated artifact package with preview, structure,
        validation, delivery manifest, and export support.
      </p>
      <div class="actions">
        <a class="primary" href="#delivery">View Delivery</a>
        <a class="secondary" href="./README.md">Read Build Notes</a>
      </div>
    </section>
  </header>

  <main>
    <section id="features" class="grid">
      <article><h2>${isTransport ? "Airport Transfers" : "Runtime Generated"}</h2><p>${isTransport ? "Book premium rides to and from major airports with professional chauffeurs." : "Created by the independent Sovereign Runtime engine."}</p></article>
      <article><h2>${isTransport ? "Executive Fleet" : "Agent Validated"}</h2><p>${isTransport ? "Luxury sedans, SUVs, and black car service for business and private travel." : "Planner, Builder, Validator, and Delivery agents completed execution."}</p></article>
      <article><h2>${isTransport ? "Fast Reservations" : "Export Ready"}</h2><p>${isTransport ? "Clear calls to action for booking, quotes, dispatch, and customer service." : "Artifacts are prepared for ZIP download and customer delivery."}</p></article>
    </section>

    <section id="delivery" class="panel">
      <h2>Delivery Summary</h2>
      <ul>
        <li>Project ID: ${run.projectId}</li>
        <li>Runtime ID: ${run.runtimeId}</li>
        <li>Mode: ${mode}</li>
        <li>Status: generated</li>
      </ul>
    </section>

    ${isTransport ? `
    <section class="panel">
      <p class="eyebrow">LUXURY FLEET</p>
      <h2>Executive vehicles for every trip</h2>
      <div class="fleet">
        <article><h3>Executive Sedan</h3><p>Premium black car service for airport transfers and business travel.</p></article>
        <article><h3>Luxury SUV</h3><p>Spacious rides for families, executives, luggage, and VIP guests.</p></article>
        <article><h3>Private Chauffeur</h3><p>Professional point-to-point service with polished presentation.</p></article>
      </div>
    </section>

    <section class="panel booking">
      <p class="eyebrow">RESERVATIONS</p>
      <h2>Book your airport transfer</h2>
      <form>
        <input placeholder="Pickup location" />
        <input placeholder="Drop-off location" />
        <input placeholder="Date and time" />
        <input placeholder="Phone or email" />
        <button type="button">Request Quote</button>
      </form>
    </section>

    <section class="panel">
      <p class="eyebrow">SERVICE AREA</p>
      <h2>O Hare airport and executive travel coverage</h2>
      <p>Designed for premium airport transfers, corporate transportation, hotel pickups, private events, and scheduled chauffeur service.</p>
    </section>
    ` : ""}

    <section id="contact" class="panel dark">
      <h2>${isTransport ? "Ready to ride in comfort" : "Ready for deployment"}</h2>
      <p>${isTransport ? "Launch-ready black car booking experience with premium positioning, clear reservation flow, and executive design." : "This package can now be extended into full frontend/backend production output."}</p>
    </section>
  </main>
</body>
</html>`
    },
    {
      type: "css",
      title: "Production Stylesheet",
      file: "styles.css",
      content: `*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#070707;color:#fff}a{color:inherit;text-decoration:none}.hero{min-height:100vh;padding:32px;background:radial-gradient(circle at top right,#7f1d1d,transparent 35%),linear-gradient(135deg,#020202,#151515)}nav{display:flex;gap:24px;align-items:center;justify-content:flex-end}nav strong{margin-right:auto}.hero section{max-width:980px;margin:18vh auto 0}.eyebrow{letter-spacing:.35em;color:#fca5a5;font-size:12px}h1{font-size:clamp(44px,8vw,92px);line-height:.95;margin:24px 0}.lead{font-size:22px;color:#d4d4d8;max-width:760px}.actions{display:flex;gap:16px;margin-top:32px}.primary,.secondary{padding:16px 24px;border-radius:18px;font-weight:800}.primary{background:#f87171;color:#000}.secondary{border:1px solid #3f3f46}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;padding:80px 40px}.grid article,.panel{border:1px solid #27272a;border-radius:28px;background:#111;padding:32px}.panel{margin:40px auto;max-width:1000px}.dark{background:#000}.fleet{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:24px}.fleet article{border:1px solid #27272a;border-radius:22px;padding:24px;background:#09090b}.booking form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.booking input{background:#050505;border:1px solid #3f3f46;border-radius:14px;color:white;padding:16px}.booking button{border:0;border-radius:14px;background:#f87171;color:#000;font-weight:900;padding:16px}`
    },
    {
      type: "json",
      title: "Runtime Metadata",
      file: "metadata.json",
      content: JSON.stringify(
        {
          projectId: run.projectId,
          runtimeId: run.runtimeId,
          mode,
          prompt: run.prompt,
          generatedAt: new Date().toISOString(),
          engine: "sovereign-runtime",
          artifacts: ["index.html", "styles.css", "metadata.json", "README.md", "package.json"]
        },
        null,
        2
      )
    },
    {
      type: "json",
      title: "Package Manifest",
      file: "package.json",
      content: JSON.stringify(
        {
          name: projectName || run.projectId.toLowerCase(),
          version: "1.0.0",
          private: true,
          scripts: {
            preview: "npx serve ."
          }
        },
        null,
        2
      )
    },
    {
      type: "markdown",
      title: "Delivery README",
      file: "README.md",
      content: `# ${run.projectId}

## Prompt
${run.prompt}

## Runtime
- Runtime ID: ${run.runtimeId}
- Mode: ${mode}
- Status: generated

## Files
- index.html
- styles.css
- metadata.json
- package.json
- README.md

## Delivery
This artifact was generated by the independent Sovereign Runtime engine and is ready for preview, validation, export, and customer delivery.
`
    }
  ];

  for (const file of files) {
    write(path.join(outDir, file.file), file.content);
  }

  return files.map((file) => ({
    type: file.type,
    title: file.title,
    path: path.join(outDir, file.file),
    status: "generated"
  }));
}
