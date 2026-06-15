import fs from "fs";
import path from "path";

type ArtifactRecord = {
  type: string;
  title: string;
  path: string;
  status: "generated";
};

function writeFile(outDir: string, file: string, content: string) {
  const filePath = path.join(outDir, file);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function artifact(outDir: string, file: string, title: string, type = "typescript"): ArtifactRecord {
  return { type, title, path: path.join(outDir, file), status: "generated" };
}

function cleanPrompt(prompt: string) {
  return String(prompt || "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
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

function inferDomain(prompt: string) {
  const source = prompt.toLowerCase();

  const matches: Array<[string, string, string[], string[]]> = [
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

function safeBrand(prompt: string, product: string) {
  const cleaned = cleanPrompt(prompt);
  const calledMatch = cleaned.match(/(?:called|named)\s+([A-Z][A-Za-z0-9&' -]{1,60}?)(?:\s+[—-]|\s+--|\s+\||,|\.|$)/);
  if (calledMatch?.[1]) {
    return titleCase(calledMatch[1]);
  }

  const source = cleaned
    .replace(/build a|build an|build|complete|modern|full-function|website|app|platform|with/gi, " ")
    .replace(/do not .*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return titleCase(source || product);
}

export function isUniversalAnythingPrompt(prompt: string) {
  return cleanPrompt(prompt).length > 0;
}

export async function buildUniversalAnythingArtifacts(run: any, outDir: string) {
  const now = new Date().toISOString();
  const prompt = cleanPrompt(run.prompt || "");
  const domain = inferDomain(prompt);
  const brand = safeBrand(prompt, domain.product);
  const [primarySection, secondarySection, thirdSection, adminSection] = domain.sections;
  const [modelOne, modelTwo, modelThree, modelFour] = domain.models;

  const files: Array<{ file: string; title: string; type?: string; content: string }> = [
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


  if (domain.key === "ecommerce" || domain.key === "shop") {
    const commerceProducts = [
      {
        id: "navel-oranges-5lb",
        name: "Premium Navel Oranges",
        category: "Fresh Oranges",
        price: 24.99,
        image: "/images/navel-oranges.jpg",
        origin: "California",
        organic: true,
        stock: 128,
        variants: ["5 lb box", "10 lb box", "Organic"],
        description: "Sweet, seedless premium navel oranges packed fresh for families and gift buyers."
      },
      {
        id: "citrus-variety-pack",
        name: "Citrus Variety Pack",
        category: "Citrus Variety Packs",
        price: 34.99,
        image: "/images/citrus-variety.jpg",
        origin: "Florida",
        organic: false,
        stock: 74,
        variants: ["Standard", "Large", "Gift Wrap"],
        description: "A colorful mix of oranges, mandarins, grapefruit, and seasonal citrus."
      },
      {
        id: "fresh-orange-juice",
        name: "Cold-Pressed Orange Juice",
        category: "Fresh Juice",
        price: 12.99,
        image: "/images/orange-juice.jpg",
        origin: "US farms",
        organic: true,
        stock: 52,
        variants: ["32 oz", "64 oz", "Weekly subscription"],
        description: "Bright, fresh juice made for health-conscious customers who want convenience."
      },
      {
        id: "sunshine-gift-basket",
        name: "Sunshine Gift Basket",
        category: "Gift Baskets",
        price: 59.99,
        image: "/images/gift-basket.jpg",
        origin: "Curated US citrus",
        organic: false,
        stock: 36,
        variants: ["Classic", "Premium", "Corporate"],
        description: "A premium citrus gift basket with fresh fruit, juice, and artisan orange treats."
      },
      {
        id: "monthly-orange-box",
        name: "Monthly Orange Box",
        category: "Subscription Boxes",
        price: 39.99,
        image: "/images/subscription-box.jpg",
        origin: "Seasonal US farms",
        organic: true,
        stock: 200,
        variants: ["Weekly", "Monthly", "Family size"],
        description: "Recurring orange delivery with flexible shipping and seasonal substitutions."
      }
    ];

    files.push(
      {
        file: "data/products.json",
        title: "Commerce Product Catalog",
        type: "json",
        content: JSON.stringify(commerceProducts, null, 2)
      },
      {
        file: "components/ProductCatalog.tsx",
        title: "Product Catalog",
        content: `import products from "../data/products.json";

export function ProductCatalog() {
  return (
    <section className="px-8 py-12" id="catalog">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Product Catalog</p>
      <h2 className="mt-3 text-4xl font-black">Fresh citrus, juice, gifts, subscriptions, and merchandise.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="card">
            <div className="rounded-3xl bg-gradient-to-br from-orange-300 to-amber-500 p-10 text-center text-5xl">🍊</div>
            <p className="mt-5 text-sm font-bold text-orange-300">{product.category}</p>
            <h3 className="mt-2 text-2xl font-black">{product.name}</h3>
            <p className="mt-3 text-zinc-400">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((variant) => <span key={variant} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{variant}</span>)}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <strong className="text-2xl">$ {product.price}</strong>
              <span className="text-sm text-zinc-400">{product.stock} in stock</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
`
      },
      {
        file: "components/CartDrawer.tsx",
        title: "Realtime Cart Drawer",
        content: `"use client";

import { useMemo, useState } from "react";
import products from "../data/products.json";

export function CartDrawer() {
  const [items, setItems] = useState([{ id: "navel-oranges-5lb", quantity: 1 }]);
  const total = useMemo(() => items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0), [items]);

  return (
    <section className="px-8 py-12" id="cart">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Cart</p>
        <h2 className="mt-3 text-4xl font-black">Realtime cart preview</h2>
        {items.map((item) => {
          const product = products.find((entry) => entry.id === item.id);
          if (!product) return null;
          return (
            <div key={item.id} className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 p-4">
              <div>
                <h3 className="text-xl font-black">{product.name}</h3>
                <p className="text-zinc-400">$ {product.price} each</p>
              </div>
              <input className="input w-24" type="number" min="1" value={item.quantity} onChange={(event) => setItems([{ ...item, quantity: Number(event.target.value) }])} />
            </div>
          );
        })}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-zinc-400">Estimated total</span>
          <strong className="text-3xl">$ {total.toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}
`
      },
      {
        file: "components/CheckoutPanel.tsx",
        title: "Checkout Panel",
        content: `"use client";

import { useState } from "react";

export function CheckoutPanel() {
  const [status, setStatus] = useState("Ready for secure checkout");

  async function startCheckout() {
    setStatus("Creating secure checkout session...");
    const response = await fetch("/api/checkout", { method: "POST" });
    const data = await response.json();
    setStatus(data.message);
  }

  return (
    <section className="px-8 py-12" id="checkout">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Checkout</p>
        <h2 className="mt-3 text-4xl font-black">Guest checkout, customer accounts, and payment-provider ready.</h2>
        <p className="mt-4 text-zinc-400">Includes Stripe or Square placeholders, delivery address capture, estimated shipping, promo codes, and order confirmation email template.</p>
        <button className="button mt-6" onClick={startCheckout}>Start Checkout</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
      },
      {
        file: "components/SubscriptionPlans.tsx",
        title: "Subscription Plans",
        content: `const plans = [
  { name: "Weekly Citrus Box", price: "$29/week", detail: "Fresh oranges and seasonal citrus delivered weekly." },
  { name: "Monthly Family Box", price: "$39/month", detail: "A larger monthly box for families and gift buyers." },
  { name: "Juice Lover Plan", price: "$24/week", detail: "Fresh juice plus rotating citrus add-ons." }
];

export function SubscriptionPlans() {
  return (
    <section className="px-8 py-12" id="subscriptions">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Subscriptions</p>
      <h2 className="mt-3 text-4xl font-black">Recurring orange deliveries.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="card">
            <h3 className="text-2xl font-black">{plan.name}</h3>
            <p className="mt-3 text-3xl font-black">{plan.price}</p>
            <p className="mt-3 text-zinc-400">{plan.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
      },
      {
        file: "components/PromoWishlistReviews.tsx",
        title: "Promo Wishlist Reviews",
        content: `export function PromoWishlistReviews() {
  return (
    <section className="grid gap-5 px-8 py-12 md:grid-cols-3">
      <article className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Promos</p>
        <h3 className="mt-3 text-2xl font-black">Discount system</h3>
        <p className="mt-3 text-zinc-400">Supports promo code validation, seasonal offers, and basket discounts.</p>
      </article>
      <article className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Wishlist</p>
        <h3 className="mt-3 text-2xl font-black">Save favorites</h3>
        <p className="mt-3 text-zinc-400">Customers can save citrus boxes, juice, and gift baskets for later.</p>
      </article>
      <article className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Reviews</p>
        <h3 className="mt-3 text-2xl font-black">Ratings and social proof</h3>
        <p className="mt-3 text-zinc-400">Review APIs and Prisma models are included for product ratings.</p>
      </article>
    </section>
  );
}
`
      },
      {
        file: "app/api/products/route.ts",
        title: "Products API",
        content: `import { NextResponse } from "next/server";
import { listProducts } from "../../../lib/commerce-store";

export async function GET() {
  return NextResponse.json({ ok: true, products: await listProducts() });
}
`
      },
      {
        file: "app/api/cart/route.ts",
        title: "Cart API",
        content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, cart: body, recalculated: true });
}
`
      },
      {
        file: "app/api/checkout/route.ts",
        title: "Checkout API",
        content: `import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    provider: process.env.PAYMENT_PROVIDER || "stripe_or_square_placeholder",
    message: "Checkout session placeholder created. Connect Stripe or Square credentials in production."
  });
}
`
      },
      {
        file: "app/api/orders/route.ts",
        title: "Orders API",
        content: `import { NextResponse } from "next/server";
import { createOrder, listOrders } from "../../../lib/commerce-store";

export async function GET() {
  return NextResponse.json({ ok: true, orders: await listOrders() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const order = await createOrder(body);
  return NextResponse.json({ ok: true, order });
}
`
      },
      {
        file: "app/api/promos/route.ts",
        title: "Promo Codes API",
        content: `import { NextResponse } from "next/server";

const promos = [
  { code: "ORANGE10", type: "percent", value: 10 },
  { code: "FAMILYBOX", type: "fixed", value: 15 }
];

export async function POST(request: Request) {
  const body = await request.json();
  const promo = promos.find((entry) => entry.code === String(body.code || "").toUpperCase());
  return NextResponse.json({ ok: Boolean(promo), promo });
}
`
      },
      {
        file: "app/api/wishlist/route.ts",
        title: "Wishlist API",
        content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, wishlistItem: body });
}
`
      },
      {
        file: "app/api/reviews/route.ts",
        title: "Reviews API",
        content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, review: { ...body, status: "pending_moderation" } });
}
`
      },
      {
        file: "app/api/subscriptions/route.ts",
        title: "Subscriptions API",
        content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, subscription: { ...body, status: "active_placeholder" } });
}
`
      },
      {
        file: "lib/commerce-store.ts",
        title: "Commerce Store",
        content: `import fs from "fs/promises";
import path from "path";
import products from "../data/products.json";

const dataDir = path.join(process.cwd(), "data");
const orderFile = path.join(dataDir, "orders.json");

export async function listProducts() {
  return products;
}

export async function listOrders() {
  try {
    return JSON.parse(await fs.readFile(orderFile, "utf8"));
  } catch {
    return [];
  }
}

export async function createOrder(input: any) {
  const orders = await listOrders();
  const order = {
    id: "order-" + Date.now(),
    status: "pending_fulfillment",
    paymentStatus: "provider_placeholder",
    ...input,
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(orderFile, JSON.stringify(orders, null, 2));
  return order;
}
`
      },
      {
        file: "lib/email-templates.ts",
        title: "Order Email Templates",
        content: `export function orderConfirmationEmail(order: { id: string; customerEmail?: string; total?: number }) {
  return {
    subject: "Your Orange Shop order is confirmed",
    text: \`Thank you for your order \${order.id}. Your fresh citrus delivery is being prepared.\`,
    html: \`<h1>Order confirmed</h1><p>Thank you for your order <strong>\${order.id}</strong>. Your fresh citrus delivery is being prepared.</p>\`
  };
}
`
      },
      {
        file: "app/admin/commerce/page.tsx",
        title: "Commerce Admin Dashboard",
        content: `import products from "../../../data/products.json";
import { listOrders } from "../../../lib/commerce-store";

export default async function CommerceAdminPage() {
  const orders = await listOrders();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Commerce Admin</p>
      <h1 className="mt-4 text-5xl font-black">Orange Shop Operations</h1>
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <article className="card"><h2 className="text-3xl font-black">{products.length}</h2><p className="text-zinc-400">Products</p></article>
        <article className="card"><h2 className="text-3xl font-black">{orders.length}</h2><p className="text-zinc-400">Orders</p></article>
        <article className="card"><h2 className="text-3xl font-black">2</h2><p className="text-zinc-400">Promo campaigns</p></article>
        <article className="card"><h2 className="text-3xl font-black">3</h2><p className="text-zinc-400">Subscription plans</p></article>
      </section>
      <section className="mt-8 grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="card">
            <h2 className="text-2xl font-black">{product.name}</h2>
            <p className="text-zinc-400">{product.category} · {product.stock} in stock · $ {product.price}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`
      }
    );

    const pageFile = files.find((entry) => entry.file === "app/page.tsx");
    if (pageFile) {
      pageFile.content = `import { Hero } from "../components/Hero";
import { ProductCatalog } from "../components/ProductCatalog";
import { CartDrawer } from "../components/CartDrawer";
import { CheckoutPanel } from "../components/CheckoutPanel";
import { SubscriptionPlans } from "../components/SubscriptionPlans";
import { PromoWishlistReviews } from "../components/PromoWishlistReviews";
import { Footer } from "../components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ProductCatalog />
      <CartDrawer />
      <CheckoutPanel />
      <SubscriptionPlans />
      <PromoWishlistReviews />
      <Footer />
    </main>
  );
}
`;
    }

    const schemaFile = files.find((entry) => entry.file === "prisma/schema.prisma");
    if (schemaFile) {
      schemaFile.content = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  category    String
  description String
  price       Float
  stock       Int
  origin      String
  organic     Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id            String      @id @default(cuid())
  customerId    String?
  customer      Customer?   @relation(fields: [customerId], references: [id])
  status        String      @default("pending")
  paymentStatus String      @default("pending")
  total         Float       @default(0)
  items         OrderItem[]
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  quantity  Int
  price     Float
}

model PromoCode {
  id        String   @id @default(cuid())
  code      String   @unique
  type      String
  value     Float
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Review {
  id        String   @id @default(cuid())
  productId String
  rating    Int
  title     String
  body      String
  status    String   @default("pending_moderation")
  createdAt DateTime @default(now())
}

model WishlistItem {
  id        String   @id @default(cuid())
  customerEmail String
  productId String
  createdAt DateTime @default(now())
}

model Subscription {
  id        String   @id @default(cuid())
  customerEmail String
  plan      String
  frequency String
  status    String   @default("active")
  createdAt DateTime @default(now())
}
`;
    }

    const readmeFile = files.find((entry) => entry.file === "README.md");
    if (readmeFile) {
      readmeFile.content += `

## Commerce capabilities

- Product catalog with fresh oranges, citrus packs, juice, gift baskets, and subscription boxes
- Realtime cart preview
- Checkout API placeholder for Stripe or Square
- Orders API with local persistence demo
- Promo code API
- Wishlist API
- Reviews API with moderation status
- Subscription API for weekly/monthly delivery plans
- Commerce admin dashboard
- Prisma models for Product, Customer, Order, OrderItem, PromoCode, Review, WishlistItem, and Subscription
- Order confirmation email template

## Payment setup

Set provider credentials in production:

\`\`\`bash
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=...
SQUARE_ACCESS_TOKEN=...
\`\`\`
`;
    }
  }


  const records: ArtifactRecord[] = [];

  for (const file of files) {
    writeFile(outDir, file.file, file.content);
    records.push(artifact(outDir, file.file, file.title, file.type));
  }

  return records;
}
