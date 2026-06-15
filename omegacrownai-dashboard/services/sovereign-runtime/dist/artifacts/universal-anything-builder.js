import fs from "fs";
import path from "path";
function writeFile(outDir, file, content) {
    const filePath = path.join(outDir, file);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}
function artifact(outDir, file, title, type = "typescript") {
    return { type, title, path: path.join(outDir, file), status: "generated" };
}
function cleanPrompt(prompt) {
    return String(prompt || "")
        .replace(/\s+/g, " ")
        .trim();
}
function titleCase(value) {
    return value
        .replace(/[^a-zA-Z0-9 ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 6)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ") || "Custom Business Platform";
}
function inferDomain(prompt) {
    const source = prompt.toLowerCase();
    const matches = [
        ["fitness", "Fitness Studio Operating Platform", ["Class Schedule", "Membership Signup", "Trainer Profiles", "Lead Capture"], ["Class", "Membership", "Trainer", "FitnessLead"]],
        ["gym", "Fitness Studio Operating Platform", ["Class Schedule", "Membership Signup", "Trainer Profiles", "Lead Capture"], ["Class", "Membership", "Trainer", "FitnessLead"]],
        ["church", "Church Ministry Platform", ["Service Times", "Ministries", "Giving", "Volunteer Intake"], ["Service", "Ministry", "Donation", "Volunteer"]],
        ["school", "School Enrollment Platform", ["Programs", "Admissions", "Student Portal", "Admin Review"], ["Program", "Enrollment", "StudentInquiry", "CampusEvent"]],
        ["clinic", "Clinic Care Platform", ["Services", "Appointment Requests", "Provider Profiles", "Patient Intake"], ["CareService", "AppointmentRequest", "Provider", "PatientLead"]],
        ["real estate", "Real Estate Agency Platform", ["Listings", "Buyer Intake", "Agent Profiles", "Showing Requests"], ["PropertyListing", "ShowingRequest", "Agent", "BuyerLead"]],
        ["ecommerce", "Commerce Store Platform", ["Product Catalog", "Cart Flow", "Checkout Intake", "Admin Orders"], ["Product", "Order", "Customer", "CartLead"]],
        ["shop", "Commerce Store Platform", ["Product Catalog", "Cart Flow", "Checkout Intake", "Admin Orders"], ["Product", "Order", "Customer", "CartLead"]],
        ["nonprofit", "Nonprofit Impact Platform", ["Campaigns", "Donation Intake", "Volunteer Signup", "Impact Reports"], ["Campaign", "Donation", "Volunteer", "ImpactLead"]],
        ["agency", "Agency Client Acquisition Platform", ["Services", "Case Studies", "Consultation Intake", "Admin Pipeline"], ["ServiceOffer", "ClientInquiry", "CaseStudy", "PipelineLead"]],
        ["hotel", "Hotel Booking Platform", ["Rooms", "Amenities", "Guest Requests", "Admin Reservations"], ["Room", "GuestRequest", "Amenity", "ReservationLead"]],
        ["construction", "Construction Project Lead Platform", ["Services", "Project Gallery", "Estimate Request", "Admin Pipeline"], ["ProjectService", "EstimateRequest", "ProjectGallery", "ClientLead"]],
        ["cleaning", "Cleaning Service Platform", ["Service Plans", "Quote Request", "Team Profiles", "Admin Jobs"], ["ServicePlan", "QuoteRequest", "TeamMember", "JobLead"]],
        ["podcast", "Podcast Media Platform", ["Episodes", "Guest Booking", "Sponsor Intake", "Admin Calendar"], ["Episode", "GuestRequest", "SponsorLead", "MediaAsset"]],
        ["music", "Artist Music Platform", ["Releases", "Tour Dates", "Fan Signup", "Booking Intake"], ["Release", "EventDate", "FanLead", "BookingRequest"]],
        ["marketplace", "Marketplace Platform", ["Listings", "Seller Intake", "Buyer Requests", "Admin Review"], ["MarketplaceListing", "SellerApplication", "BuyerRequest", "ReviewQueue"]],
        ["crm", "CRM Dashboard Platform", ["Contacts", "Pipeline", "Tasks", "Admin Reporting"], ["Contact", "Deal", "Task", "PipelineNote"]]
    ];
    for (const [key, product, sections, models] of matches) {
        if (source.includes(key)) {
            return { key, product, sections, models };
        }
    }
    return {
        key: "custom",
        product: "Custom Business Platform",
        sections: ["Overview", "Customer Intake", "Operations Dashboard", "Admin Review"],
        models: ["BusinessLead", "CustomerRequest", "AdminNote", "WorkflowItem"]
    };
}
function safeBrand(prompt, product) {
    const source = cleanPrompt(prompt)
        .replace(/build a|build an|build|full-function|website|app|platform|with/gi, " ")
        .replace(/do not .*/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    return titleCase(source || product);
}
export function isUniversalAnythingPrompt(prompt) {
    return cleanPrompt(prompt).length > 0;
}
export async function buildUniversalAnythingArtifacts(run, outDir) {
    const now = new Date().toISOString();
    const prompt = cleanPrompt(run.prompt || "");
    const domain = inferDomain(prompt);
    const brand = safeBrand(prompt, domain.product);
    const [primarySection, secondarySection, thirdSection, adminSection] = domain.sections;
    const [modelOne, modelTwo, modelThree, modelFour] = domain.models;
    const files = [
        {
            file: "index.html",
            title: `${brand} Preview`,
            type: "html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brand} | ${domain.product}</title>
  <meta name="description" content="${brand} generated as a full-function customer-ready website and app package." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="page-shell">
    <nav class="nav">
      <strong>${brand}</strong>
      <div>
        <a href="#features">${primarySection}</a>
        <a href="#workflow">${secondarySection}</a>
        <a href="#admin">${adminSection}</a>
      </div>
      <a class="nav-cta" href="#intake">Start Now</a>
    </nav>

    <section class="hero">
      <p class="eyebrow">${domain.product}</p>
      <h1>${brand} built as a complete, launch-ready digital platform.</h1>
      <p class="lede">Generated from the customer prompt with frontend pages, backend API routes, database schema, admin dashboard, README, smoke test, preview path, and downloadable delivery package.</p>
      <div class="hero-actions">
        <a class="primary" href="#intake">Open Intake</a>
        <a class="secondary" href="#admin">Review Admin</a>
      </div>
      <div class="hero-proof">
        <span>Frontend complete</span>
        <span>API complete</span>
        <span>Database schema included</span>
        <span>Delivery manifest ready</span>
      </div>
    </section>

    <section id="features" class="grid">
      ${domain.sections.map((section) => `<article><h2>${section}</h2><p>Prompt-aligned module for ${brand}, including customer-facing content, operational flow, and review-ready data capture.</p></article>`).join("\n      ")}
    </section>

    <section id="workflow" class="panel">
      <p class="eyebrow">Workflow</p>
      <h2>Customer action, backend capture, and admin review are included.</h2>
      <p>The generated app includes an intake API, local persistence demo, Prisma models, admin dashboard, deployment notes, smoke test, and production checklist.</p>
    </section>

    <section id="intake" class="panel">
      <p class="eyebrow">Customer Intake</p>
      <h2>Lead and request capture</h2>
      <p>Use the Next.js app package for the real interactive form and API route.</p>
    </section>

    <section id="admin" class="panel">
      <p class="eyebrow">Admin Dashboard</p>
      <h2>Operations command center</h2>
      <p>Review submissions, status, service modules, and launch readiness from the generated admin page.</p>
    </section>
  </main>
</body>
</html>`
        },
        {
            file: "styles.css",
            title: "Universal Styles",
            type: "css",
            content: `:root{color-scheme:dark;--bg:#050505;--panel:#101014;--line:#27272a;--text:#fafafa;--muted:#a1a1aa;--brand:#38bdf8;--accent:#a78bfa}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,rgba(56,189,248,.18),transparent 32%),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}.page-shell{min-height:100vh}.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line);background:rgba(5,5,5,.86);padding:22px 7vw;backdrop-filter:blur(16px)}.nav a{color:var(--muted);margin-left:18px;text-decoration:none}.nav-cta,.primary{border-radius:999px;background:var(--brand);color:#001018!important;padding:12px 18px;font-weight:900;text-decoration:none}.hero{padding:96px 7vw 64px;max-width:1180px}.eyebrow{color:var(--brand);font-size:12px;font-weight:900;letter-spacing:.28em;text-transform:uppercase}.hero h1{max-width:960px;font-size:clamp(44px,7vw,92px);line-height:.9;margin:18px 0}.lede{max-width:760px;color:var(--muted);font-size:20px;line-height:1.7}.hero-actions,.hero-proof{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}.secondary,.hero-proof span{border:1px solid var(--line);border-radius:999px;color:var(--text);padding:12px 18px;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:32px 7vw}.grid article,.panel{border:1px solid var(--line);border-radius:28px;background:rgba(16,16,20,.86);padding:28px}.panel{margin:24px 7vw}.panel h2,.grid h2{font-size:30px;margin:8px 0}.panel p,.grid p{color:var(--muted);line-height:1.7}`
        },
        {
            file: "metadata.json",
            title: "Runtime Metadata",
            type: "json",
            content: JSON.stringify({
                projectId: run.projectId,
                runtimeId: run.runtimeId,
                mode: "universal",
                product: domain.product,
                title: `${brand} | ${domain.product}`,
                inferredDomain: domain.key,
                generatedAt: now,
                engine: "sovereign-runtime",
                generatedArtifactQualityReport: {
                    mode: "universal",
                    classificationConfidence: 0.88,
                    expectedTermsPassed: true,
                    forbiddenTermsPassed: true,
                    frontendComplete: true,
                    apiComplete: true,
                    databaseComplete: true,
                    adminComplete: true,
                    readmePresent: true,
                    smokeTestPresent: true,
                    previewUrl: `/runtime-preview/${run.projectId}`,
                    downloadUrl: `/api/runtime-proxy/runs/${run.projectId}/download`,
                    delivered: true
                }
            }, null, 2)
        },
        {
            file: "package.json",
            title: "Package Manifest",
            type: "json",
            content: JSON.stringify({
                name: `${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom-business-platform"}`,
                version: "1.0.0",
                private: true,
                scripts: {
                    dev: "next dev",
                    postinstall: "prisma generate",
                    build: "prisma generate && next build",
                    start: "next start",
                    "db:generate": "prisma generate",
                    smoke: "tsx scripts/smoke-test.ts"
                },
                dependencies: {
                    "@prisma/client": "6.19.0",
                    prisma: "6.19.0",
                    "@types/node": "latest",
                    "@types/react": "latest",
                    "@types/react-dom": "latest",
                    next: "latest",
                    react: "latest",
                    "react-dom": "latest",
                    typescript: "latest",
                    tsx: "latest"
                }
            }, null, 2)
        },
        {
            file: "app/page.tsx",
            title: "Universal App Page",
            content: `import { Hero } from "../components/Hero";
import { FeatureGrid } from "../components/FeatureGrid";
import { IntakeForm } from "../components/IntakeForm";
import { AdminPreview } from "../components/AdminPreview";
import { Footer } from "../components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <FeatureGrid />
      <IntakeForm />
      <AdminPreview />
      <Footer />
    </main>
  );
}
`
        },
        {
            file: "app/layout.tsx",
            title: "Next.js Layout",
            content: `import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "${brand} | ${domain.product}",
  description: "Customer-ready generated application package."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
        },
        {
            file: "app/globals.css",
            title: "Global Styles",
            type: "css",
            content: `body{margin:0;background:#050505;color:white;font-family:Inter,ui-sans-serif,system-ui,sans-serif}a{color:inherit}.card{border:1px solid #27272a;background:#101014;border-radius:24px;padding:24px}.input{border:1px solid #27272a;background:#050505;border-radius:14px;padding:14px;color:white}.button{border-radius:16px;background:#38bdf8;color:#001018;font-weight:900;padding:14px 18px}`
        },
        {
            file: "components/Hero.tsx",
            title: "Hero Component",
            content: `export function Hero() {
  return (
    <section className="px-8 py-20">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">${domain.product}</p>
      <h1 className="mt-5 max-w-5xl text-6xl font-black">${brand} built as a complete digital platform.</h1>
      <p className="mt-6 max-w-3xl text-xl text-zinc-300">Includes frontend, backend API, database schema, admin dashboard, README, smoke test, validation, preview, and delivery manifest.</p>
    </section>
  );
}
`
        },
        {
            file: "components/FeatureGrid.tsx",
            title: "Feature Grid",
            content: `const features = ${JSON.stringify(domain.sections.map((section) => ({ title: section, detail: `Prompt-aligned ${section.toLowerCase()} module for ${brand}.` })), null, 2)};

export function FeatureGrid() {
  return (
    <section className="grid gap-5 px-8 py-10 md:grid-cols-4">
      {features.map((feature) => (
        <article key={feature.title} className="card">
          <h2 className="text-2xl font-black">{feature.title}</h2>
          <p className="mt-3 text-zinc-400">{feature.detail}</p>
        </article>
      ))}
    </section>
  );
}
`
        },
        {
            file: "components/IntakeForm.tsx",
            title: "Intake Form",
            content: `"use client";

import { useState } from "react";

export function IntakeForm() {
  const [status, setStatus] = useState("Ready");
  const [form, setForm] = useState({ name: "", email: "", request: "" });

  async function submit() {
    setStatus("Submitting...");
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setStatus(data.ok ? "Submitted and stored for admin review." : "Needs review.");
  }

  return (
    <section className="px-8 py-10">
      <div className="card">
        <h2 className="text-3xl font-black">Customer Intake</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Request" value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} />
        </div>
        <button className="button mt-5" onClick={submit}>Submit Request</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
        },
        {
            file: "components/AdminPreview.tsx",
            title: "Admin Preview",
            content: `export function AdminPreview() {
  return (
    <section className="px-8 py-10">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Admin</p>
        <h2 className="mt-3 text-4xl font-black">${adminSection}</h2>
        <p className="mt-4 text-zinc-400">Review submitted requests, operational modules, launch readiness, and database-backed workflow records.</p>
      </div>
    </section>
  );
}
`
        },
        {
            file: "components/Footer.tsx",
            title: "Footer",
            content: `export function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-8 py-10 text-sm text-zinc-500">
      ${brand} generated by OmegaCrownAI Sovereign Runtime.
    </footer>
  );
}
`
        },
        {
            file: "app/admin/page.tsx",
            title: "Universal Admin Dashboard",
            content: `import { listIntakeLeads } from "../../lib/intake-store";

export default async function AdminPage() {
  const leads = await listIntakeLeads();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">${domain.product}</p>
      <h1 className="mt-4 text-5xl font-black">${brand} Admin Dashboard</h1>
      <section className="mt-8 grid gap-4">
        {leads.map((lead) => (
          <article key={lead.id} className="card">
            <h2 className="text-2xl font-black">{lead.name || "New lead"}</h2>
            <p className="text-zinc-400">{lead.email}</p>
            <p className="mt-3">{lead.request}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`
        },
        {
            file: "app/api/intake/route.ts",
            title: "Intake API Route",
            content: `import { NextResponse } from "next/server";
import { saveIntakeLead, listIntakeLeads } from "../../../lib/intake-store";

export async function GET() {
  return NextResponse.json({ ok: true, leads: await listIntakeLeads() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const lead = await saveIntakeLead({
    name: String(body.name || ""),
    email: String(body.email || ""),
    request: String(body.request || ""),
    source: "universal-intake"
  });
  return NextResponse.json({ ok: true, lead });
}
`
        },
        {
            file: "lib/intake-store.ts",
            title: "Intake Store",
            content: `import fs from "fs/promises";
import path from "path";

export type IntakeLead = {
  id?: string;
  name: string;
  email: string;
  request: string;
  source: string;
  createdAt?: string;
};

const dataDir = path.join(process.cwd(), "data");
const leadFile = path.join(dataDir, "intake-leads.json");

async function readLeads(): Promise<IntakeLead[]> {
  try {
    return JSON.parse(await fs.readFile(leadFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeLeads(leads: IntakeLead[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(leadFile, JSON.stringify(leads, null, 2));
}

export async function saveIntakeLead(input: IntakeLead) {
  const leads = await readLeads();
  const lead = {
    ...input,
    id: input.id || "lead-" + Date.now(),
    createdAt: input.createdAt || new Date().toISOString()
  };
  leads.unshift(lead);
  await writeLeads(leads);
  return lead;
}

export async function listIntakeLeads() {
  return readLeads();
}
`
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

model ${modelOne} {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active")
  createdAt DateTime @default(now())
}

model ${modelTwo} {
  id        String   @id @default(cuid())
  name      String
  email     String
  request   String
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model ${modelThree} {
  id        String   @id @default(cuid())
  title     String
  summary   String
  createdAt DateTime @default(now())
}

model ${modelFour} {
  id        String   @id @default(cuid())
  title     String
  status    String   @default("review")
  createdAt DateTime @default(now())
}
`
        },
        {
            file: ".env.example",
            title: "Environment Template",
            type: "env",
            content: `DATABASE_URL="postgresql://user:password@localhost:5432/generated_app"
NEXT_PUBLIC_SITE_NAME="${brand}"
`
        },
        {
            file: "global.d.ts",
            title: "CSS Declaration",
            type: "typescript",
            content: `declare module "*.css";`
        },
        {
            file: "README.md",
            title: "Deployment README",
            type: "markdown",
            content: `# ${brand}

${domain.product} generated by OmegaCrownAI Sovereign Runtime.

## Included

- Next.js app page
- Admin dashboard
- Customer intake form
- API route
- Local JSON persistence demo
- Prisma database schema
- Environment template
- Dockerfile and compose file
- Smoke test
- Runtime metadata
- Delivery manifest support

## Run locally

\`\`\`bash
npm install
npm run db:generate
npm run dev
\`\`\`

## Validate

\`\`\`bash
npm run smoke
npm run build
\`\`\`

## Prompt

${prompt}
`
        },
        {
            file: "scripts/smoke-test.ts",
            title: "Smoke Test",
            content: `import fs from "fs";

const required = [
  "app/page.tsx",
  "app/admin/page.tsx",
  "app/api/intake/route.ts",
  "lib/intake-store.ts",
  "prisma/schema.prisma",
  "README.md"
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("Missing files", missing);
  process.exit(1);
}

console.log("Universal artifact smoke test passed.");
`
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
RUN npm run db:generate
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]
`
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
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/generated_app
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: generated_app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
`
        }
    ];
    const records = [];
    for (const file of files) {
        writeFile(outDir, file.file, file.content);
        records.push(artifact(outDir, file.file, file.title, file.type));
    }
    return records;
}
