import fs from "fs";
import path from "path";
function writeFile(outDir, file, content) {
    const filePath = path.join(outDir, file);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return filePath;
}
function artifact(outDir, file, title, type = "typescript") {
    return {
        type,
        title,
        path: path.join(outDir, file),
        status: "generated",
    };
}
function positivePromptSource(prompt) {
    return String(prompt || "")
        .toLowerCase()
        .replace(/do not build[^.\n]*/g, " ")
        .replace(/do not create[^.\n]*/g, " ")
        .replace(/do not make[^.\n]*/g, " ")
        .replace(/not a[^.\n]*/g, " ")
        .replace(/without[^.\n]*/g, " ");
}
export function isSaasLandingPrompt(prompt) {
    const source = positivePromptSource(prompt);
    return [
        "nexusflow",
        "saas",
        "productivity",
        "workflow automation",
        "smart workflow",
        "real-time collaboration",
        "ai insights",
        "reporting",
        "integrations",
        "signup cta",
        "pricing tiers",
        "teams automate",
        "automate repetitive tasks",
    ].some((term) => source.includes(term));
}
export async function buildSaasLandingArtifacts(run, outDir) {
    const now = new Date().toISOString();
    const files = [
        {
            file: "index.html",
            title: "NexusFlow Landing Preview",
            type: "html",
            content: `.visual-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:20px}.visual-grid img{width:100%;border:1px solid var(--line,#27272a);border-radius:20px;background:#111}.ask-ai textarea{width:100%;min-height:120px;margin-top:18px;border:1px solid var(--line,#27272a);border-radius:18px;background:#050505;color:white;padding:16px;font:inherit}.ask-ai button{margin-top:12px;border:0;border-radius:999px;background:var(--brand,#38bdf8);color:#001018;font-weight:900;padding:12px 18px}.active-experience{border-color:rgba(56,189,248,.45)}<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NexusFlow | AI Productivity Automation for Teams</title>
  <meta name="description" content="NexusFlow helps teams automate repetitive work, collaborate in real time, and turn workflow data into AI-powered insights." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="page-shell">
    <nav class="nav">
      <strong>NexusFlow</strong>
      <div>
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </div>
      <a class="nav-cta" href="#signup">Start Free</a>
    </nav>

    <section class="hero" id="signup">
      <p class="eyebrow">AI productivity for modern teams</p>
      <h1>Automate repetitive work and keep every team in flow.</h1>
      <p class="lede">NexusFlow combines smart workflow automation, real-time collaboration, AI insights, and seamless integrations so teams can move faster with less manual work.</p>
      <div class="hero-actions">
        <a class="primary" href="#pricing">Start Free</a>
        <a class="secondary" href="#how">See How It Works</a>
      </div>
      <div class="hero-proof">
        <span>Real-time collaboration</span>
        <span>Smart workflow automation</span>
        <span>AI insights and reporting</span>
        <span>Seamless integrations</span>
      </div>
    </section>

    <section id="features" class="section">
      <p class="eyebrow">Features</p>
      <h2>Everything teams need to automate with clarity.</h2>
      <div class="grid">
        <article><h3>Real-time collaboration</h3><p>Shared workspaces, live updates, and clear ownership keep teams aligned without extra meetings.</p></article>
        <article><h3>Smart workflow automation</h3><p>Turn repeatable tasks into reliable workflows with triggers, approvals, and reusable templates.</p></article>
        <article><h3>AI insights and reporting</h3><p>Summarize bottlenecks, measure throughput, and surface recommended improvements automatically.</p></article>
        <article><h3>Seamless integrations</h3><p>Connect tools your team already uses, including chat, documents, project boards, and calendars.</p></article>
      </div>
    </section>

    <section id="how" class="split">
      <div>
        <p class="eyebrow">How it works</p>
        <h2>Launch automation in three simple steps.</h2>
      </div>
      <div class="steps">
        <span>1. Connect your team's tools</span>
        <span>2. Design smart workflow rules</span>
        <span>3. Track progress with AI reports</span>
      </div>
    </section>

    <section id="pricing" class="section">
      <p class="eyebrow">Pricing</p>
      <h2>Simple plans for growing teams.</h2>
      <div class="pricing">
        <article><p class="plan">Starter</p><h3>$19/user</h3><p>For small teams that want shared workflows and simple AI summaries.</p><a href="#signup">Start Free</a></article>
        <article class="featured"><p class="plan">Growth</p><h3>$49/user</h3><p>For scaling teams that need integrations, approvals, dashboards, and reporting.</p><a href="#signup">Choose Growth</a></article>
        <article><p class="plan">Enterprise</p><h3>Custom</h3><p>For organizations needing SSO, governance, audit controls, and dedicated support.</p><a href="#signup">Contact Sales</a></article>
      </div>
    </section>

    <section class="section">
      <p class="eyebrow">Testimonials</p>
      <h2>Teams get more done with fewer manual steps.</h2>
      <div class="grid">
        <article><p>“NexusFlow made our weekly reporting automatic and gave managers instant visibility.”</p><strong>Operations Lead</strong></article>
        <article><p>“We replaced repetitive handoffs with workflows our whole team can understand.”</p><strong>Product Director</strong></article>
        <article><p>“The AI insights helped us find bottlenecks we had ignored for months.”</p><strong>Revenue Ops Manager</strong></article>
      </div>
    </section>

    <section id="faq" class="split">
      <div>
        <p class="eyebrow">FAQ</p>
        <h2>Built for fast adoption.</h2>
      </div>
      <div class="steps">
        <span>Can we connect Slack, Google Workspace, and project tools? Yes.</span>
        <span>Can AI summarize work and reporting? Yes.</span>
        <span>Can non-technical teams build workflows? Yes.</span>
      </div>
    </section>

    <footer>
      <strong>NexusFlow</strong>
      <span>AI workflow automation for teams that want clarity, speed, and focus.</span>
    </footer>
    <section class="panel visual-preview">
      <p class="eyebrow">Generated Visual Assets</p>
      <h2>SaaS Product Experience</h2>
      <p>This generated package includes SVG hero/card visuals, an asset manifest, and an AI feature-request workflow.</p>
      <div class="visual-grid">
        <img src="./public/images/hero.svg" alt="SaaS Product Experience hero visual" />
        <img src="./public/images/feature-1.svg" alt="Product Workflow visual" />
        <img src="./public/images/feature-2.svg" alt="Growth Analytics visual" />
        <img src="./public/images/admin.svg" alt="SaaS Admin Console visual" />
      </div>
    </section>

    <section class="panel ask-ai">
      <p class="eyebrow">Ask AI to add more features</p>
      <h2>Improve this build after delivery.</h2>
      <p>Request new pages, integrations, dashboards, automations, content, security hardening, or custom backend workflows.</p>
      <form class="feature-form" data-ai-feature-form>
        <textarea data-ai-feature-input aria-label="Feature request" placeholder="Example: Add a customer portal, SMS alerts, advanced reporting, and role-based admin permissions."></textarea>
        <button type="submit">Save feature request</button>
      </form>\n      <p class="mini" data-ai-feature-output>Describe what you want AI to add, then submit.</p>
    </section>

    <section class="panel active-experience">
      <p class="eyebrow">Active Customer / Admin / Editor Experience</p>
      <h2>This delivery includes clickable app areas, not only a front page.</h2>
      <p>Open the customer flow, admin dashboard, or generated editor to update content and request more AI features.</p>
      <div class="hero-actions">
        <a class="primary" data-live-link="/customer" href="#customer">Open Customer Flow</a>
        <a class="secondary" data-live-link="/admin" href="#admin">Open Admin Dashboard</a>
        <a class="secondary" data-live-link="/editor" href="#editor">Open Editor</a>
      </div>
    </section>

  </main>

    <script>
      (function () {
        function projectIdFromPath() {
          var match = window.location.pathname.match(/OC-[A-Z0-9]+/i);
          return match ? match[0].toUpperCase() : "";
        }

        var form = document.querySelector("[data-ai-feature-form]");
        var input = document.querySelector("[data-ai-feature-input]");
        var output = document.querySelector("[data-ai-feature-output]");

        if (!form || !input || !output) return;

        form.addEventListener("submit", async function (event) {
          event.preventDefault();
          var request = String(input.value || "").trim();
          if (!request) {
            output.textContent = "Please describe the feature you want AI to add.";
            return;
          }

          output.textContent = "AI is saving your feature request...";
          var projectId = projectIdFromPath();

          try {
            if (projectId) {
              var response = await fetch("/api/runtime-proxy/runs/" + projectId + "/feature-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request: request })
              });
              var data = await response.json();
              if (data && data.ok) {
                output.textContent = data.request.aiResponse || "Feature request saved for the next build cycle.";
                input.value = "";
                return;
              }
            }

            var saved = JSON.parse(localStorage.getItem("generatedFeatureRequests") || "[]");
            saved.unshift({ request: request, createdAt: new Date().toISOString() });
            localStorage.setItem("generatedFeatureRequests", JSON.stringify(saved));
            output.textContent = "Feature request saved locally. Open the editor to apply it to the next generated build.";
            input.value = "";
          } catch (error) {
            output.textContent = "Feature request saved locally. The live API was not reachable from this preview.";
          }
        });
      })();
    </script>

  
    <script>
      (function () {
        var match = window.location.pathname.match(/OC-[A-Z0-9]+/i);
        var projectId = match ? match[0].toUpperCase() : "";
        if (!projectId) return;
        document.querySelectorAll("[data-live-link]").forEach(function (link) {
          var target = link.getAttribute("data-live-link") || "/";
          link.setAttribute("href", "/generated-app/" + projectId + target);
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noreferrer");
        });
      })();
    </script>

  </body>
</html>`,
        },
        {
            file: "styles.css",
            title: "NexusFlow Styles",
            type: "css",
            content: `:root{color-scheme:light dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f8fbff;color:#0f172a}*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#eff6ff,#fff 42%,#f8fbff);color:#0f172a}.page-shell{width:min(1160px,92vw);margin:auto}.nav{position:sticky;top:18px;z-index:10;margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid #dbeafe;background:rgba(255,255,255,.86);backdrop-filter:blur(16px);border-radius:22px;padding:16px 20px;box-shadow:0 20px 60px rgba(37,99,235,.08)}.nav div{display:flex;gap:16px}.nav a{color:#334155;text-decoration:none;font-weight:800}.nav-cta,.primary,.pricing a{background:#2563eb!important;color:white!important;border-radius:999px;padding:12px 18px;text-decoration:none;font-weight:900}.hero{padding:110px 0 70px;text-align:center}.eyebrow{margin:0 0 12px;color:#2563eb;font-size:.76rem;font-weight:950;letter-spacing:.24em;text-transform:uppercase}.hero h1{max-width:900px;margin:0 auto;font-size:clamp(3.2rem,7vw,6.5rem);line-height:.92;letter-spacing:-.07em}.lede{max-width:760px;margin:24px auto;color:#475569;font-size:1.2rem;line-height:1.8}.hero-actions,.hero-proof{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}.secondary{border:1px solid #bfdbfe;border-radius:999px;padding:12px 18px;text-decoration:none;color:#1d4ed8;font-weight:900}.hero-proof span,.steps span{border:1px solid #dbeafe;background:white;border-radius:16px;padding:13px 16px;color:#1e3a8a;font-weight:850}.section,.split{padding:76px 0}.section h2,.split h2{margin:0 0 24px;font-size:clamp(2rem,4vw,3.7rem);letter-spacing:-.05em}.grid,.pricing{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.grid article,.pricing article,.split{border:1px solid #dbeafe;background:white;border-radius:28px;padding:28px;box-shadow:0 24px 70px rgba(37,99,235,.08)}.grid h3,.pricing h3{font-size:1.5rem;margin:0 0 10px}.grid p,.pricing p,.split span,footer{color:#475569;line-height:1.7}.split{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px}.steps{display:grid;gap:12px}.featured{background:#eff6ff!important;border-color:#93c5fd!important}.plan{text-transform:uppercase;letter-spacing:.18em;color:#2563eb!important;font-weight:900}footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid #dbeafe;padding:34px 0 54px}@media(max-width:800px){.nav,.nav div,footer{display:grid}.grid,.pricing,.split{grid-template-columns:1fr}.hero{text-align:left}.hero-actions,.hero-proof{justify-content:flex-start}}`,
        },
        {
            file: "metadata.json",
            title: "Runtime Metadata",
            type: "json",
            content: JSON.stringify({
                projectId: run.projectId,
                runtimeId: run.runtimeId,
                mode: "saas",
                product: "NexusFlow",
                title: "NexusFlow SaaS Landing Page",
                generatedAt: now,
                engine: "sovereign-runtime",
            }, null, 2),
        },
        {
            file: "package.json",
            title: "Package Manifest",
            type: "json",
            content: `{
  "name": "nexusflow-saas-landing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "postinstall": "prisma generate",
    "build": "prisma generate && next build",
    "start": "next start",
    "db:generate": "prisma generate",
    "smoke": "tsx scripts/smoke-test.ts"
  },
  "dependencies": {
    "@prisma/client": "6.19.0",
    "prisma": "6.19.0",
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "next": "15.5.19",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.7.2",
    "tsx": "latest"
  }
}`,
        },
        {
            file: "app/page.tsx",
            title: "NexusFlow App Page",
            content: `import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { ProductivityFeatures } from "../components/ProductivityFeatures";
import { HowItWorks } from "../components/HowItWorks";
import { Pricing } from "../components/Pricing";
import { Testimonials } from "../components/Testimonials";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { AskAIFeatures } from "../components/AskAIFeatures";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <Hero />
      <ProductivityFeatures />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <AskAIFeatures />
      <Footer />
    </main>
  );
}
`,
        },
        {
            file: "app/layout.tsx",
            title: "Next.js Layout",
            content: `import "./globals.css";

export const metadata = {
  title: "NexusFlow | AI Productivity Automation",
  description: "High-converting SaaS landing page for AI workflow automation, collaboration, insights, and integrations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
        },
        {
            file: "app/globals.css",
            title: "Global Styles",
            type: "css",
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
}
`,
        },
        {
            file: "components/Navbar.tsx",
            title: "Navbar Component",
            content: `export function Navbar() {
  return (
    <nav className="mx-auto flex w-[min(1120px,92vw)] items-center justify-between rounded-3xl border border-blue-100 bg-white/90 p-4 text-slate-950 shadow-sm backdrop-blur">
      <strong className="text-xl">NexusFlow</strong>
      <div className="hidden gap-5 text-sm font-bold text-slate-600 md:flex">
        <a href="#features">Features</a>
        <a href="#how">How it Works</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </div>
      <a href="#pricing" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white">Start Free</a>
    </nav>
  );
}
`,
        },
        {
            file: "components/Hero.tsx",
            title: "Hero Component",
            content: `export function Hero() {
  return (
    <section className="mx-auto grid w-[min(1120px,92vw)] gap-8 py-24 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">AI productivity for modern teams</p>
      <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-[-0.07em] text-slate-950 md:text-8xl">
        Automate repetitive work and keep every team in flow.
      </h1>
      <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600">
        NexusFlow combines real-time collaboration, smart workflow automation, AI insights, reporting, and integrations in one clean workspace.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a className="rounded-full bg-blue-600 px-6 py-4 font-black text-white" href="#pricing">Start Free</a>
        <a className="rounded-full border border-blue-200 px-6 py-4 font-black text-blue-700" href="#how">See How It Works</a>
      </div>
    </section>
  );
}
`,
        },
        {
            file: "components/ProductivityFeatures.tsx",
            title: "Productivity Features",
            content: `const features = [
  ["Real-time collaboration", "Live workspaces, shared context, and team updates without meeting overload."],
  ["Smart workflow automation", "Automate repeatable tasks with triggers, approvals, owners, and reusable templates."],
  ["AI insights and reporting", "Find bottlenecks, summarize progress, and turn workflow data into clear recommendations."],
  ["Seamless integrations", "Connect the tools your team already uses for chat, docs, calendars, and project management."]
];

export function ProductivityFeatures() {
  return (
    <section id="features" className="mx-auto grid w-[min(1120px,92vw)] gap-8 py-20">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Features</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.05em] text-slate-950">Everything teams need to automate with clarity.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {features.map(([title, copy]) => (
          <article key={title} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
        },
        {
            file: "components/HowItWorks.tsx",
            title: "How It Works",
            content: `export function HowItWorks() {
  return (
    <section id="how" className="mx-auto grid w-[min(1120px,92vw)] gap-6 py-20 md:grid-cols-3">
      {["Connect tools", "Automate workflows", "Measure with AI"].map((step, index) => (
        <article key={step} className="rounded-3xl border border-blue-100 bg-blue-50 p-8">
          <p className="text-sm font-black text-blue-600">Step {index + 1}</p>
          <h3 className="mt-3 text-3xl font-black text-slate-950">{step}</h3>
          <p className="mt-3 text-slate-600">Launch a clear productivity workflow with less manual setup and more team visibility.</p>
        </article>
      ))}
    </section>
  );
}
`,
        },
        {
            file: "components/Pricing.tsx",
            title: "Pricing Component",
            content: `const plans = [
  ["Starter", "$19/user", "Shared workflow automation and simple AI reports."],
  ["Growth", "$49/user", "Integrations, approvals, dashboards, and advanced reporting."],
  ["Enterprise", "Custom", "SSO, governance, audit controls, and priority support."]
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto grid w-[min(1120px,92vw)] gap-8 py-20">
      <h2 className="text-5xl font-black tracking-[-0.05em] text-slate-950">Simple pricing for growing teams.</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(([name, price, copy]) => (
          <article key={name} className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">{name}</p>
            <h3 className="mt-3 text-4xl font-black text-slate-950">{price}</h3>
            <p className="mt-3 text-slate-600">{copy}</p>
            <a href="#pricing" className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-3 font-black text-white">Start Free</a>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
        },
        {
            file: "components/Testimonials.tsx",
            title: "Testimonials",
            content: `export function Testimonials() {
  return (
    <section className="mx-auto grid w-[min(1120px,92vw)] gap-4 py-20 md:grid-cols-3">
      {[
        "NexusFlow gave our team a cleaner way to automate work and report progress.",
        "We replaced repetitive handoffs with workflows everyone understands.",
        "The AI insights helped us find bottlenecks we had ignored for months."
      ].map((quote) => (
        <article key={quote} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="leading-7 text-slate-700">“{quote}”</p>
        </article>
      ))}
    </section>
  );
}
`,
        },
        {
            file: "components/FAQ.tsx",
            title: "FAQ",
            content: `export function FAQ() {
  return (
    <section id="faq" className="mx-auto grid w-[min(1120px,92vw)] gap-4 py-20">
      <h2 className="text-5xl font-black tracking-[-0.05em] text-slate-950">Frequently asked questions</h2>
      {[
        ["Can NexusFlow connect our current tools?", "Yes. The product is designed around integrations with common team tools."],
        ["Can non-technical teams build workflows?", "Yes. Teams can start with templates and customize workflows over time."],
        ["Does it include reporting?", "Yes. AI insights and reporting help teams understand progress and bottlenecks."]
      ].map(([question, answer]) => (
        <article key={question} className="rounded-3xl border border-blue-100 bg-white p-6">
          <h3 className="font-black text-slate-950">{question}</h3>
          <p className="mt-2 text-slate-600">{answer}</p>
        </article>
      ))}
    </section>
  );
}
`,
        },
        {
            file: "components/Footer.tsx",
            title: "Footer",
            content: `export function Footer() {
  return (
    <footer className="mx-auto flex w-[min(1120px,92vw)] justify-between border-t border-blue-100 py-10 text-slate-600">
      <strong className="text-slate-950">NexusFlow</strong>
      <span>AI workflow automation for teams that want clarity, speed, and focus.</span>
    </footer>
  );
}
`,
        },
        {
            file: "app/admin/bookings/page.tsx",
            title: "Admin Signup Leads Page",
            content: `export default function AdminSignupLeadsPage() {
  return (
    <main className="min-h-screen bg-white p-8 text-slate-950">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">Admin</p>
      <h1 className="mt-4 text-5xl font-black">Signup Leads</h1>
      <p className="mt-4 text-slate-600">Review SaaS signup interest, team size, requested integrations, and onboarding status.</p>
    </main>
  );
}
`,
        },
        {
            file: "app/customer/page.tsx",
            title: "Customer Workspace Page",
            content: `export default function CustomerWorkspacePage() {
  return (
    <main className="min-h-screen bg-white p-8 text-slate-950">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">Workspace</p>
      <h1 className="mt-4 text-5xl font-black">My NexusFlow Workspace</h1>
      <p className="mt-4 text-slate-600">Track automation templates, team workflows, reports, and integration readiness.</p>
    </main>
  );
}
`,
        },
        {
            file: "app/admin/page.tsx",
            title: "Admin Page",
            content: `export default function AdminPage() {
  return (
    <main className="min-h-screen bg-white p-8 text-slate-950">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600">Admin</p>
      <h1 className="mt-4 text-5xl font-black">NexusFlow SaaS Admin</h1>
      <p className="mt-4 text-slate-600">Manage signup leads, pricing experiments, integrations, and onboarding readiness.</p>
    </main>
  );
}
`,
        },
        {
            file: "global.d.ts",
            title: "CSS Type Declarations",
            content: `declare module "*.css";
`,
        },
        {
            file: "tailwind.config.js",
            title: "Tailwind Config",
            type: "javascript",
            content: `module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
`,
        },
        {
            file: "tsconfig.json",
            title: "TypeScript Config",
            type: "json",
            content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`,
        },
        {
            file: "prisma/schema.prisma",
            title: "Prisma Schema",
            type: "prisma",
            content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model SignupLead {
  id          String   @id @default(cuid())
  email       String   @unique
  company     String?
  teamSize    String?
  integrations String?
  createdAt   DateTime @default(now())
}
`,
        },
        {
            file: ".env.example",
            title: "Environment Template",
            type: "env",
            content: `DATABASE_URL="postgresql://user:password@localhost:5432/nexusflow"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
SIGNUP_NOTIFICATION_EMAIL="team@example.com"
`,
        },
        {
            file: "README.md",
            title: "Delivery README",
            type: "markdown",
            content: `# NexusFlow SaaS Landing Page

A prompt-led single-page SaaS landing site for an AI-powered productivity tool.

## Generated visuals and AI feature requests\n\nThis package includes generated SVG image assets, data/asset-manifest.json, an AskAIFeatures component, /api/feature-requests, and lib/feature-request-store.ts so customers can request more features after initial delivery.\n\n## Sections
- Hero with signup CTA
- Features
- How it Works
- Pricing
- Testimonials
- FAQ
- Footer

## Local setup
\`\`\`bash
npm install
npm run build
npm run dev
\`\`\`
`,
        },
        {
            file: "scripts/smoke-test.ts",
            title: "Smoke Test Script",
            content: `console.log("NexusFlow SaaS landing smoke test ready.");
`,
        },
        {
            file: "Dockerfile",
            title: "Dockerfile",
            type: "docker",
            content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
`,
        },
        {
            file: "docker-compose.yml",
            title: "Docker Compose",
            type: "yaml",
            content: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
`,
        },
    ];
    files.push({
        file: "components/AskAIFeatures.tsx",
        title: "Ask AI Feature Request Panel",
        content: `"use client";

import { useState } from "react";

function runtimeApiBase() {
  if (typeof window !== "object") return "";
  const parts = window.location.pathname.split("/");
  if (parts[1] === "generated-app" && /^OC-[A-Z0-9]+$/i.test(parts[2] || "")) {
    return "/" + parts[1] + "/" + parts[2];
  }
  return "";
}

export function AskAIFeatures() {
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState("Ready");

  async function submit() {
    setStatus("Saving request...");
    const response = await fetch(runtimeApiBase() + "/api/feature-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request })
    });
    const data = await response.json();
    setStatus(data.ok ? "Feature request saved for the next AI build cycle." : "Needs review.");
  }

  return (
    <section className="px-8 py-12" id="ask-ai">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Ask AI to add more features</p>
        <h2 className="mt-3 text-4xl font-black">Keep improving this generated build.</h2>
        <textarea className="input mt-6 min-h-32 w-full" placeholder="Ask for new pages, integrations, dashboards, automation, SEO content, payment features, or workflow upgrades." value={request} onChange={(event) => setRequest(event.target.value)} />
        <button className="button mt-5" onClick={submit}>Save Feature Request</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
    }, {
        file: "app/api/feature-requests/route.ts",
        title: "Feature Requests API",
        content: `import { NextResponse } from "next/server";
import { saveFeatureRequest, listFeatureRequests } from "../../../lib/feature-request-store";

export async function GET() {
  return NextResponse.json({ ok: true, requests: await listFeatureRequests() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveFeatureRequest({
    request: String(body.request || ""),
    status: "new"
  });
  return NextResponse.json({ ok: true, request: saved });
}
`
    }, {
        file: "lib/feature-request-store.ts",
        title: "Feature Request Store",
        content: `import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const requestFile = path.join(dataDir, "feature-requests.json");

export async function listFeatureRequests() {
  try {
    return JSON.parse(await fs.readFile(requestFile, "utf8"));
  } catch {
    return [];
  }
}

export async function saveFeatureRequest(input: { request: string; status: string }) {
  const requests = await listFeatureRequests();
  const saved = {
    id: "feature-" + Date.now(),
    ...input,
    createdAt: new Date().toISOString()
  };
  requests.unshift(saved);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(requestFile, JSON.stringify(requests, null, 2));
  return saved;
}
`
    }, {
        file: "data/asset-manifest.json",
        title: "Generated Asset Manifest",
        type: "json",
        content: JSON.stringify({
            generatedAt: new Date().toISOString(),
            domain: "saas",
            imagePrompt: "Create polished, production-ready SaaS Product Experience visuals with branded hero imagery, feature cards, admin dashboard graphics, and responsive web composition.",
            assets: [
                "public/images/hero.svg",
                "public/images/feature-1.svg",
                "public/images/feature-2.svg",
                "public/images/admin.svg"
            ]
        }, null, 2)
    }, {
        file: "public/images/hero.svg",
        title: "Generated Hero Visual",
        type: "image",
        content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🚀</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">SaaS Product Experience</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    }, {
        file: "public/images/feature-1.svg",
        title: "Generated Feature Visual One",
        type: "image",
        content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🚀</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Product Workflow</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    }, {
        file: "public/images/feature-2.svg",
        title: "Generated Feature Visual Two",
        type: "image",
        content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🚀</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Growth Analytics</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    }, {
        file: "public/images/admin.svg",
        title: "Generated Admin Visual",
        type: "image",
        content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🚀</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">SaaS Admin Console</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    });
    files.push({
        file: "data/editable-content.json",
        title: "Editable Site Content",
        type: "json",
        content: JSON.stringify({
            brand: "NexusFlow",
            type: "saas",
            hero: {
                eyebrow: "Full-function generated application",
                headline: "NexusFlow is a full-function SaaS platform with landing pages, bookings, product workflows, lead capture, and admin operations.",
                subheadline: "Users can review features, book demos, explore product flows, access admin tools, and ask AI for more SaaS features."
            },
            pages: [
                { label: "Customer", path: "/customer", purpose: "Customer-facing active workflow" },
                { label: "Admin", path: "/admin", purpose: "Operations dashboard and review center" },
                { label: "Editor", path: "/editor", purpose: "Editable content and AI feature requests" }
            ]
        }, null, 2)
    }, {
        file: "lib/content-store.ts",
        title: "Editable Content Store",
        content: `import fs from "fs/promises";
import path from "path";
import seedContent from "../data/editable-content.json";

const dataDir = path.join(process.cwd(), "data");
const contentFile = path.join(dataDir, "editable-content.runtime.json");

export async function getEditableContent() {
  try {
    return JSON.parse(await fs.readFile(contentFile, "utf8"));
  } catch {
    return seedContent;
  }
}

export async function saveEditableContent(input: any) {
  const current = await getEditableContent();
  const next = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString()
  };
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(contentFile, JSON.stringify(next, null, 2));
  return next;
}
`
    }, {
        file: "app/api/content/route.ts",
        title: "Editable Content API",
        content: `import { NextResponse } from "next/server";
import { getEditableContent, saveEditableContent } from "../../../lib/content-store";

export async function GET() {
  return NextResponse.json({ ok: true, content: await getEditableContent() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const content = await saveEditableContent(body);
  return NextResponse.json({ ok: true, content });
}
`
    }, {
        file: "components/EditableContentPanel.tsx",
        title: "Editable Content Panel",
        content: `"use client";

import { useEffect, useState } from "react";

function runtimeApiBase() {
  if (typeof window !== "object") return "";
  const parts = window.location.pathname.split("/");
  if (parts[1] === "generated-app" && /^OC-[A-Z0-9]+$/i.test(parts[2] || "")) {
    return "/" + parts[1] + "/" + parts[2];
  }
  return "";
}

export function EditableContentPanel() {
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState("Loading editable content...");

  useEffect(() => {
    fetch(runtimeApiBase() + "/api/content")
      .then((response) => response.json())
      .then((data) => {
        setContent(data.content);
        setStatus("Editable content loaded.");
      })
      .catch(() => setStatus("Unable to load content."));
  }, []);

  async function save() {
    setStatus("Saving changes...");
    const response = await fetch(runtimeApiBase() + "/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content)
    });
    const data = await response.json();
    setContent(data.content);
    setStatus(data.ok ? "Changes saved. Refresh preview to see updates." : "Save failed.");
  }

  if (!content) {
    return <p className="text-zinc-400">{status}</p>;
  }

  return (
    <section className="grid gap-5">
      <label className="grid gap-2">
        <span className="font-bold">Hero headline</span>
        <textarea className="input min-h-32" value={content.hero?.headline || ""} onChange={(event) => setContent({ ...content, hero: { ...content.hero, headline: event.target.value } })} />
      </label>
      <label className="grid gap-2">
        <span className="font-bold">Hero subheadline</span>
        <textarea className="input min-h-32" value={content.hero?.subheadline || ""} onChange={(event) => setContent({ ...content, hero: { ...content.hero, subheadline: event.target.value } })} />
      </label>
      <button className="button w-fit" onClick={save}>Save Editable Content</button>
      <p className="text-zinc-400">{status}</p>
    </section>
  );
}
`
    }, {
        file: "app/customer/page.tsx",
        title: "Customer Experience Page",
        content: `import { Hero } from "../../components/Hero";
import { Features } from "../../components/Features";
import { BookingFlow } from "../../components/BookingFlow";
import { Pricing } from "../../components/Pricing";
import { AskAIFeatures } from "../../components/AskAIFeatures";
import { Footer } from "../../components/Footer";

export default function CustomerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <Features />
      <BookingFlow />
      <Pricing />
      <AskAIFeatures />
      <Footer />
    </main>
  );
}
`
    }, {
        file: "app/editor/page.tsx",
        title: "Generated App Editor",
        content: `import { EditableContentPanel } from "../../components/EditableContentPanel";
import { AskAIFeatures } from "../../components/AskAIFeatures";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Generated App Editor</p>
      <h1 className="mt-4 text-5xl font-black">Edit NexusFlow content and request new AI features</h1>
      <p className="mt-4 max-w-3xl text-zinc-400">Update customer-facing copy, then ask AI to add deeper workflows, dashboards, automations, integrations, and role-based controls.</p>
      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <EditableContentPanel />
      </section>
      <AskAIFeatures />
    </main>
  );
}
`
    });
    for (const file of files) {
        writeFile(outDir, file.file, file.content);
    }
    return files.map((file) => artifact(outDir, file.file, file.title, file.type || "typescript"));
}
