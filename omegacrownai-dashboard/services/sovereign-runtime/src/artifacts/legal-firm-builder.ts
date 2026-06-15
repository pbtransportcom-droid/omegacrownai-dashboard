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
  return filePath;
}

function artifact(outDir: string, file: string, title: string, type = "typescript"): ArtifactRecord {
  return {
    type,
    title,
    path: path.join(outDir, file),
    status: "generated",
  };
}

function positivePromptSource(prompt: string) {
  return String(prompt || "")
    .toLowerCase()
    .replace(/do not build[^.\n]*/g, " ")
    .replace(/do not create[^.\n]*/g, " ")
    .replace(/do not make[^.\n]*/g, " ")
    .replace(/not a[^.\n]*/g, " ")
    .replace(/without[^.\n]*/g, " ");
}

export function isLegalFirmPrompt(prompt: string) {
  const source = positivePromptSource(prompt);
  return [
    "law firm",
    "legal",
    "attorney",
    "lawyer",
    "practice areas",
    "consultation intake",
    "case inquiry",
    "case review",
    "client portal",
    "matter intake",
    "conflict check",
  ].some((term) => source.includes(term));
}

export async function buildLegalFirmArtifacts(run: any, outDir: string) {
  const now = new Date().toISOString();

  const files: Array<{ file: string; title: string; type?: string; content: string }> = [
    {
      file: "index.html",
      title: "Legal Firm Preview",
      type: "html",
      content: `.visual-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:20px}.visual-grid img{width:100%;border:1px solid var(--line,#27272a);border-radius:20px;background:#111}.ask-ai textarea{width:100%;min-height:120px;margin-top:18px;border:1px solid var(--line,#27272a);border-radius:18px;background:#050505;color:white;padding:16px;font:inherit}.ask-ai button{margin-top:12px;border:0;border-radius:999px;background:var(--brand,#38bdf8);color:#001018;font-weight:900;padding:12px 18px}<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apex Legal Group | Consultation Intake and Client Portal</title>
  <meta name="description" content="A professional law firm website with practice areas, attorney profiles, consultation intake, client portal, and admin case review." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="page-shell">
    <nav class="nav">
      <strong>Apex Legal Group</strong>
      <div>
        <a href="#practice">Practice Areas</a>
        <a href="#attorneys">Attorneys</a>
        <a href="#consultation">Consultation</a>
        <a href="#portal">Client Portal</a>
      </div>
      <a class="nav-cta" href="#consultation">Request Consultation</a>
    </nav>

    <section class="hero" id="consultation">
      <p class="eyebrow">Strategic legal support</p>
      <h1>Modern legal intake for clients who need clear next steps.</h1>
      <p class="lede">Apex Legal Group helps clients submit inquiries, review practice areas, meet attorneys, and start a secure consultation workflow.</p>
      <div class="hero-actions">
        <a class="primary" href="#consultation">Start Case Inquiry</a>
        <a class="secondary" href="#practice">View Practice Areas</a>
      </div>
      <div class="hero-proof">
        <span>Consultation intake</span>
        <span>Attorney profiles</span>
        <span>Client portal</span>
        <span>Admin case review</span>
      </div>
    </section>

    <section id="practice" class="section">
      <p class="eyebrow">Practice Areas</p>
      <h2>Focused legal services with clear intake workflows.</h2>
      <div class="grid">
        <article><h3>Business Law</h3><p>Entity guidance, contract review, operational agreements, and advisory support.</p></article>
        <article><h3>Family Law</h3><p>Consultation-first support for sensitive personal matters and next-step planning.</p></article>
        <article><h3>Real Estate Law</h3><p>Transaction review, property disputes, document preparation, and closing guidance.</p></article>
        <article><h3>Immigration Law</h3><p>Case intake, document readiness, appointment tracking, and client updates.</p></article>
      </div>
    </section>

    <section id="attorneys" class="section">
      <p class="eyebrow">Attorneys</p>
      <h2>Experienced counsel organized by client need.</h2>
      <div class="grid">
        <article><h3>Jordan Miles</h3><p>Managing Attorney — Business Law and contracts.</p></article>
        <article><h3>Amara Chen</h3><p>Senior Attorney — Family and client advocacy matters.</p></article>
        <article><h3>Elena Brooks</h3><p>Associate Attorney — Real estate and document review.</p></article>
      </div>
    </section>

    <section class="split">
      <div>
        <p class="eyebrow">Consultation Intake</p>
        <h2>Capture the right details before the first call.</h2>
      </div>
      <div class="steps">
        <span>1. Select matter type</span>
        <span>2. Submit contact and urgency</span>
        <span>3. Add case notes and documents</span>
        <span>4. Admin team reviews inquiry</span>
      </div>
    </section>

    <section id="portal" class="section">
      <p class="eyebrow">Client Portal</p>
      <h2>Give clients a clear place to track their inquiry.</h2>
      <div class="grid">
        <article><h3>Inquiry status</h3><p>Clients can see whether their request is new, under review, scheduled, or closed.</p></article>
        <article><h3>Secure notes</h3><p>Clients can add follow-up details before the consultation.</p></article>
        <article><h3>Appointment readiness</h3><p>Admins can prepare next steps and assign internal review owners.</p></article>
      </div>
    </section>

    <section class="section">
      <p class="eyebrow">Admin Review</p>
      <h2>Review, triage, and assign client inquiries.</h2>
      <div class="grid">
        <article><h3>New inquiries</h3><p>Sort consultation requests by matter type, urgency, and readiness.</p></article>
        <article><h3>Conflict check workflow</h3><p>Prepare internal checks before assigning a consultation.</p></article>
        <article><h3>Attorney assignment</h3><p>Route each matter to the right practice lead.</p></article>
      </div>
    </section>

    <footer>
      <strong>Apex Legal Group</strong>
      <span>Professional legal intake, client communication, and case review workflows.</span>
    </footer>
    <section class="panel visual-preview">
      <p class="eyebrow">Generated Visual Assets</p>
      <h2>Legal Client Experience</h2>
      <p>This generated package includes SVG hero/card visuals, an asset manifest, and an AI feature-request workflow.</p>
      <div class="visual-grid">
        <img src="./public/images/hero.svg" alt="Legal Client Experience hero visual" />
        <img src="./public/images/feature-1.svg" alt="Consultation Intake visual" />
        <img src="./public/images/feature-2.svg" alt="Case Review visual" />
        <img src="./public/images/admin.svg" alt="Legal Admin Dashboard visual" />
      </div>
    </section>

    <section class="panel ask-ai">
      <p class="eyebrow">Ask AI to add more features</p>
      <h2>Improve this build after delivery.</h2>
      <p>Request new pages, integrations, dashboards, automations, content, security hardening, or custom backend workflows.</p>
      <form class="feature-form">
        <textarea aria-label="Feature request" placeholder="Example: Add a customer portal, SMS alerts, advanced reporting, and role-based admin permissions."></textarea>
        <button type="button">Save feature request</button>
      </form>
    </section>

  </main>
</body>
</html>`,
    },
    {
      file: "styles.css",
      title: "Legal Website Styles",
      type: "css",
      content: `:root{color-scheme:light dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f7f5f0;color:#171717}*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#fffaf0,#fff 42%,#f7f5f0);color:#171717}.page-shell{width:min(1160px,92vw);margin:auto}.nav{position:sticky;top:18px;z-index:10;margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid #e7d8b8;background:rgba(255,255,255,.9);backdrop-filter:blur(16px);border-radius:22px;padding:16px 20px;box-shadow:0 20px 60px rgba(84,60,20,.08)}.nav div{display:flex;gap:16px}.nav a{color:#4b3b24;text-decoration:none;font-weight:800}.nav-cta,.primary{background:#7c4a03!important;color:white!important;border-radius:999px;padding:12px 18px;text-decoration:none;font-weight:900}.hero{padding:110px 0 70px;text-align:center}.eyebrow{margin:0 0 12px;color:#7c4a03;font-size:.76rem;font-weight:950;letter-spacing:.24em;text-transform:uppercase}.hero h1{max-width:960px;margin:0 auto;font-size:clamp(3rem,7vw,6.2rem);line-height:.94;letter-spacing:-.07em}.lede{max-width:760px;margin:24px auto;color:#62513b;font-size:1.2rem;line-height:1.8}.hero-actions,.hero-proof{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}.secondary{border:1px solid #dec894;border-radius:999px;padding:12px 18px;text-decoration:none;color:#7c4a03;font-weight:900}.hero-proof span,.steps span{border:1px solid #eadbb7;background:white;border-radius:16px;padding:13px 16px;color:#4b3b24;font-weight:850}.section,.split{padding:76px 0}.section h2,.split h2{margin:0 0 24px;font-size:clamp(2rem,4vw,3.7rem);letter-spacing:-.05em}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.grid article,.split{border:1px solid #eadbb7;background:white;border-radius:28px;padding:28px;box-shadow:0 24px 70px rgba(84,60,20,.08)}.grid h3{font-size:1.5rem;margin:0 0 10px}.grid p,.split span,footer{color:#62513b;line-height:1.7}.split{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px}.steps{display:grid;gap:12px}footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid #eadbb7;padding:34px 0 54px}@media(max-width:800px){.nav,.nav div,footer{display:grid}.grid,.split{grid-template-columns:1fr}.hero{text-align:left}.hero-actions,.hero-proof{justify-content:flex-start}}`,
    },
    {
      file: "metadata.json",
      title: "Runtime Metadata",
      type: "json",
      content: JSON.stringify(
        {
          projectId: run.projectId,
          runtimeId: run.runtimeId,
          mode: "legal",
          product: "Legal Firm Website",
          title: "Apex Legal Group Website and Intake System",
          generatedAt: now,
          engine: "sovereign-runtime",
        },
        null,
        2
      ),
    },
    {
      file: "package.json",
      title: "Package Manifest",
      type: "json",
      content: `{
  "name": "apex-legal-group-intake",
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
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "typescript": "latest",
    "tsx": "latest"
  }
}`,
    },
    {
      file: "app/page.tsx",
      title: "Legal App Page",
      content: `import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { PracticeAreas } from "../components/PracticeAreas";
import { AttorneyProfiles } from "../components/AttorneyProfiles";
import { ConsultationIntake } from "../components/ConsultationIntake";
import { ClientPortal } from "../components/ClientPortal";
import { Testimonials } from "../components/Testimonials";
import { Footer } from "../components/Footer";
import { AskAIFeatures } from "../components/AskAIFeatures";

export default function Page() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <Navbar />
      <Hero />
      <PracticeAreas />
      <AttorneyProfiles />
      <ConsultationIntake />
      <ClientPortal />
      <Testimonials />
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
  title: "Apex Legal Group | Consultation Intake",
  description: "Professional legal website with practice areas, attorney profiles, client inquiry intake, and admin review.",
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
    <nav className="mx-auto flex w-[min(1120px,92vw)] items-center justify-between rounded-3xl border border-amber-100 bg-white/90 p-4 text-stone-950 shadow-sm backdrop-blur">
      <strong className="text-xl">Apex Legal Group</strong>
      <div className="hidden gap-5 text-sm font-bold text-stone-600 md:flex">
        <a href="#practice">Practice Areas</a>
        <a href="#attorneys">Attorneys</a>
        <a href="#consultation">Consultation</a>
        <a href="#portal">Client Portal</a>
      </div>
      <a href="#consultation" className="rounded-full bg-amber-800 px-5 py-3 text-sm font-black text-white">Request Consultation</a>
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
      <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-800">Strategic legal support</p>
      <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-[-0.07em] text-stone-950 md:text-8xl">
        Legal intake built for trust, clarity, and fast review.
      </h1>
      <p className="mx-auto max-w-3xl text-lg leading-8 text-stone-600">
        Capture matter details, present practice areas, introduce attorneys, and route inquiries into an admin case review workflow.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a className="rounded-full bg-amber-800 px-6 py-4 font-black text-white" href="#consultation">Start Case Inquiry</a>
        <a className="rounded-full border border-amber-200 px-6 py-4 font-black text-amber-900" href="#practice">View Practice Areas</a>
      </div>
    </section>
  );
}
`,
    },
    {
      file: "components/PracticeAreas.tsx",
      title: "Practice Areas",
      content: `const areas = [
  ["Business Law", "Entity setup, contract review, operating agreements, and legal advisory support."],
  ["Family Law", "Consultation-first support for sensitive personal matters and next-step planning."],
  ["Real Estate Law", "Transaction review, document preparation, property disputes, and closing guidance."],
  ["Immigration Law", "Matter intake, appointment preparation, document readiness, and client updates."]
];

export function PracticeAreas() {
  return (
    <section id="practice" className="mx-auto grid w-[min(1120px,92vw)] gap-8 py-20">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-800">Practice Areas</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.05em] text-stone-950">Focused legal services with clear intake workflows.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {areas.map(([title, copy]) => (
          <article key={title} className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-stone-950">{title}</h3>
            <p className="mt-3 leading-7 text-stone-600">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      file: "components/AttorneyProfiles.tsx",
      title: "Attorney Profiles",
      content: `const attorneys = [
  ["Jordan Miles", "Managing Attorney", "Business Law and contract strategy"],
  ["Amara Chen", "Senior Attorney", "Family law and client advocacy"],
  ["Elena Brooks", "Associate Attorney", "Real estate document review"]
];

export function AttorneyProfiles() {
  return (
    <section id="attorneys" className="mx-auto grid w-[min(1120px,92vw)] gap-8 py-20">
      <h2 className="text-5xl font-black tracking-[-0.05em] text-stone-950">Attorney profiles built for client confidence.</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {attorneys.map(([name, role, focus]) => (
          <article key={name} className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-800">{role}</p>
            <h3 className="mt-3 text-3xl font-black text-stone-950">{name}</h3>
            <p className="mt-3 text-stone-600">{focus}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
    },
    {
      file: "components/ConsultationIntake.tsx",
      title: "Consultation Intake",
      content: `"use client";

export function ConsultationIntake() {
  return (
    <section id="consultation" className="mx-auto grid w-[min(1120px,92vw)] gap-6 rounded-[2rem] border border-amber-100 bg-white p-8 shadow-sm md:grid-cols-2">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-800">Consultation Intake</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.05em] text-stone-950">Start with the details that matter.</h2>
        <p className="mt-4 leading-8 text-stone-600">Collect matter type, urgency, contact details, notes, and preferred consultation window before admin review.</p>
      </div>
      <form className="grid gap-3">
        <input className="rounded-2xl border border-amber-100 p-4" placeholder="Full name" />
        <input className="rounded-2xl border border-amber-100 p-4" placeholder="Email address" />
        <select className="rounded-2xl border border-amber-100 p-4">
          <option>Business Law</option>
          <option>Family Law</option>
          <option>Real Estate Law</option>
          <option>Immigration Law</option>
        </select>
        <textarea className="min-h-32 rounded-2xl border border-amber-100 p-4" placeholder="Briefly describe your matter" />
        <button className="rounded-2xl bg-amber-800 p-4 font-black text-white" type="button">Submit Inquiry</button>
      </form>
    </section>
  );
}
`,
    },
    {
      file: "components/ClientPortal.tsx",
      title: "Client Portal",
      content: `export function ClientPortal() {
  return (
    <section id="portal" className="mx-auto grid w-[min(1120px,92vw)] gap-4 py-20 md:grid-cols-3">
      {[
        ["Inquiry status", "Track whether a request is new, under review, scheduled, or closed."],
        ["Secure notes", "Add follow-up details before the consultation review."],
        ["Document readiness", "Prepare supporting details and appointment requirements."]
      ].map(([title, copy]) => (
        <article key={title} className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-stone-950">{title}</h3>
          <p className="mt-3 leading-7 text-stone-600">{copy}</p>
        </article>
      ))}
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
        "The intake process helped us explain our issue clearly before the consultation.",
        "Attorney profiles made it easier to understand who would review our matter.",
        "The client portal gave us a simple place to track next steps."
      ].map((quote) => (
        <article key={quote} className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <p className="leading-7 text-stone-700">“{quote}”</p>
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
    <footer className="mx-auto flex w-[min(1120px,92vw)] justify-between border-t border-amber-100 py-10 text-stone-600">
      <strong className="text-stone-950">Apex Legal Group</strong>
      <span>Legal intake, client communication, and admin review workflows.</span>
    </footer>
  );
}
`,
    },
    {
      file: "app/admin/page.tsx",
      title: "Admin Case Review",
      content: `export default function AdminPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-8 text-stone-950">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-800">Admin</p>
      <h1 className="mt-4 text-5xl font-black">Legal Intake Dashboard</h1>
      <p className="mt-4 text-stone-600">Review client inquiries, matter type, urgency, consultation notes, conflict-check readiness, and attorney assignment.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-amber-100 bg-white p-6"><h2 className="text-2xl font-black">New Inquiries</h2><p className="mt-2 text-stone-600">Matter submissions awaiting review.</p></article>
        <article className="rounded-3xl border border-amber-100 bg-white p-6"><h2 className="text-2xl font-black">Conflict Checks</h2><p className="mt-2 text-stone-600">Internal review before assignment.</p></article>
        <article className="rounded-3xl border border-amber-100 bg-white p-6"><h2 className="text-2xl font-black">Attorney Assignment</h2><p className="mt-2 text-stone-600">Route matters by practice area.</p></article>
      </div>
    </main>
  );
}
`,
    },
    {
      file: "app/customer/page.tsx",
      title: "Client Portal Page",
      content: `export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-8 text-stone-950">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-800">Client Portal</p>
      <h1 className="mt-4 text-5xl font-black">My Legal Inquiry</h1>
      <p className="mt-4 text-stone-600">Track inquiry status, consultation readiness, follow-up notes, and requested documents.</p>
    </main>
  );
}
`,
    },
    {
      file: "app/api/case-inquiries/route.ts",
      title: "Case Inquiry API",
      content: `import { NextResponse } from "next/server";

const inquiries: any[] = [];

export async function GET() {
  return NextResponse.json({ inquiries });
}

export async function POST(request: Request) {
  const body = await request.json();
  const inquiry = {
    id: "CASE-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "new",
    createdAt: new Date().toISOString(),
    ...body,
  };
  inquiries.push(inquiry);
  return NextResponse.json({ inquiry }, { status: 201 });
}
`,
    },
    {
      file: "lib/case-inquiry-store.ts",
      title: "Case Inquiry Store",
      content: `export type CaseInquiry = {
  id: string;
  fullName: string;
  email: string;
  matterType: string;
  urgency?: string;
  notes?: string;
  status: "new" | "reviewing" | "scheduled" | "closed";
  createdAt: string;
};

export const demoCaseInquiries: CaseInquiry[] = [];
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

model CaseInquiry {
  id          String   @id @default(cuid())
  fullName    String
  email       String
  matterType  String
  urgency     String?
  notes       String?
  status      String   @default("new")
  createdAt   DateTime @default(now())
}
`,
    },
    {
      file: ".env.example",
      title: "Environment Template",
      type: "env",
      content: `DATABASE_URL="postgresql://user:password@localhost:5432/legal_intake"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
CASE_INQUIRY_NOTIFICATION_EMAIL="intake@example.com"
`,
    },
    {
      file: "README.md",
      title: "Delivery README",
      type: "markdown",
      content: `# Apex Legal Group Website and Intake System

Prompt-led legal firm website package with practice areas, attorney profiles, consultation intake, client portal, admin case review, API route, Prisma schema, and deployment files.

## Generated visuals and AI feature requests\n\nThis package includes generated SVG image assets, data/asset-manifest.json, an AskAIFeatures component, /api/feature-requests, and lib/feature-request-store.ts so customers can request more features after initial delivery.\n\n## Included
- Homepage
- Practice areas
- Attorney profiles
- Consultation intake form
- Client portal
- Admin case review dashboard
- Case inquiry API route
- Prisma CaseInquiry schema
- Smoke test
- Docker files

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
      content: `console.log("Legal firm intake package smoke test ready.");
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


  files.push(
    {
      file: "components/AskAIFeatures.tsx",
      title: "Ask AI Feature Request Panel",
      content: `"use client";

import { useState } from "react";

export function AskAIFeatures() {
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState("Ready");

  async function submit() {
    setStatus("Saving request...");
    const response = await fetch("/api/feature-requests", {
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
    },
    {
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
    },
    {
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
    },
    {
      file: "data/asset-manifest.json",
      title: "Generated Asset Manifest",
      type: "json",
      content: JSON.stringify({
        generatedAt: new Date().toISOString(),
        domain: "legal",
        imagePrompt: "Create polished, production-ready Legal Client Experience visuals with branded hero imagery, feature cards, admin dashboard graphics, and responsive web composition.",
        assets: [
          "public/images/hero.svg",
          "public/images/feature-1.svg",
          "public/images/feature-2.svg",
          "public/images/admin.svg"
        ]
      }, null, 2)
    },
    {
      file: "public/images/hero.svg",
      title: "Generated Hero Visual",
      type: "image",
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">⚖️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Legal Client Experience</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    },
    {
      file: "public/images/feature-1.svg",
      title: "Generated Feature Visual One",
      type: "image",
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">⚖️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Consultation Intake</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    },
    {
      file: "public/images/feature-2.svg",
      title: "Generated Feature Visual Two",
      type: "image",
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">⚖️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Case Review</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    },
    {
      file: "public/images/admin.svg",
      title: "Generated Admin Visual",
      type: "image",
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">⚖️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Legal Admin Dashboard</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    }
  );


  for (const file of files) {
    writeFile(outDir, file.file, file.content);
  }

  return files.map((file) => artifact(outDir, file.file, file.title, file.type || "typescript"));
}
