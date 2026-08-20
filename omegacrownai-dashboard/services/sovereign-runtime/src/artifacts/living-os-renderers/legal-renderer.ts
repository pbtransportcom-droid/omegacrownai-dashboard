import type {
  LivingOSProductionPlan,
} from "../living-os-planner.js";

import type {
  LivingOSRenderedFile,
} from "./bookstore-renderer.js";

function safe(value: unknown) {
  return String(value || "")
    .replace(/[<>&]/g, "")
    .trim();
}

function legalBrand(plan: LivingOSProductionPlan) {
  const value = safe(plan.business.brandName);

  if (
    !value ||
    /legal platform|law firm platform|custom business/i.test(
      value
    )
  ) {
    return "Sterling & Crown Legal";
  }

  return value;
}

export function renderLegalLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  if (plan.industry !== "legal") {
    throw new Error(
      `Legal renderer received ${plan.industry}`
    );
  }

  const brand = legalBrand(plan);
  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "living-os-plan.json",
    title: "Legal Living OS Plan",
    type: "json",
    content: JSON.stringify(plan, null, 2),
  });

  files.push({
    file: "data/practice-areas.json",
    title: "Legal Practice Areas",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "business-law",
          name: "Business Law",
          description:
            "Business formation, contracts, governance, disputes, and strategic legal counsel.",
        },
        {
          id: "personal-injury",
          name: "Personal Injury",
          description:
            "Case evaluation, evidence review, negotiation, and litigation support.",
        },
        {
          id: "family-law",
          name: "Family Law",
          description:
            "Divorce, custody, support, mediation, and family legal planning.",
        },
        {
          id: "estate-planning",
          name: "Estate Planning",
          description:
            "Wills, trusts, probate guidance, powers of attorney, and legacy planning.",
        },
        {
          id: "real-estate",
          name: "Real Estate Law",
          description:
            "Transactions, leases, closings, title matters, and property disputes.",
        },
        {
          id: "employment",
          name: "Employment Law",
          description:
            "Workplace agreements, disputes, compliance, and employee or employer representation.",
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "data/attorneys.json",
    title: "Attorney Profiles",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "attorney-001",
          name: "Alexandra Sterling",
          title: "Managing Attorney",
          practiceAreas: [
            "Business Law",
            "Real Estate Law",
          ],
          yearsExperience: 18,
          barAdmissions: [
            "Illinois",
            "Federal Court",
          ],
        },
        {
          id: "attorney-002",
          name: "Marcus Crown",
          title: "Senior Trial Attorney",
          practiceAreas: [
            "Personal Injury",
            "Employment Law",
          ],
          yearsExperience: 14,
          barAdmissions: [
            "Illinois",
            "Indiana",
          ],
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "components/LegalHeader.tsx",
    title: "Legal Header",
    type: "typescript",
    content: `import Link from "next/link";

export function LegalHeader() {
  return (
    <header className="legal-header">
      <Link href="/" className="legal-brand">
        <span className="legal-mark">S&C</span>
        <span>
          <strong>${brand}</strong>
          <small>Trusted counsel. Clear direction.</small>
        </span>
      </Link>

      <nav>
        <Link href="/practice-areas">Practice Areas</Link>
        <Link href="/attorneys">Attorneys</Link>
        <Link href="/results">Results</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <Link href="/consultation" className="legal-button">
        Request consultation
      </Link>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/LegalHero.tsx",
    title: "Legal Hero",
    type: "typescript",
    content: `import Link from "next/link";

export function LegalHero() {
  return (
    <section className="legal-hero">
      <div>
        <p className="eyebrow">
          Strategic legal representation
        </p>

        <h1>
          Serious counsel for
          <span> consequential matters.</span>
        </h1>

        <p>
          Clear legal guidance, responsive communication,
          and experienced representation for individuals,
          families, and businesses.
        </p>

        <div className="hero-actions">
          <Link
            href="/consultation"
            className="legal-button"
          >
            Schedule a consultation
          </Link>

          <Link
            href="/practice-areas"
            className="legal-outline-button"
          >
            Explore practice areas
          </Link>
        </div>

        <div className="legal-proof">
          <span>Confidential intake</span>
          <span>Experienced counsel</span>
          <span>Clear case updates</span>
          <span>Secure client portal</span>
        </div>
      </div>

      <aside className="case-intake-preview">
        <p className="eyebrow">Confidential case review</p>
        <h2>Tell us how we can help.</h2>

        <div className="preview-grid">
          <label>
            Legal matter
            <select>
              <option>Business Law</option>
              <option>Personal Injury</option>
              <option>Family Law</option>
              <option>Estate Planning</option>
            </select>
          </label>

          <label>
            Preferred contact
            <select>
              <option>Email</option>
              <option>Phone</option>
            </select>
          </label>

          <label className="full-field">
            Brief summary
            <textarea
              placeholder="Describe your legal matter"
              rows={5}
            />
          </label>
        </div>

        <Link href="/consultation" className="legal-button">
          Begin confidential intake
        </Link>
      </aside>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/PracticeAreaGrid.tsx",
    title: "Practice Area Grid",
    type: "typescript",
    content: `import practiceAreas from "../data/practice-areas.json";

export function PracticeAreaGrid() {
  return (
    <section className="content-section">
      <p className="eyebrow">Practice areas</p>
      <h2>Focused experience across complex legal needs.</h2>

      <div className="practice-grid">
        {practiceAreas.map((area) => (
          <article key={area.id}>
            <span>{area.name}</span>
            <p>{area.description}</p>
            <a href={"/practice-areas/" + area.id}>
              Learn more
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/AttorneyShowcase.tsx",
    title: "Attorney Showcase",
    type: "typescript",
    content: `import attorneys from "../data/attorneys.json";

export function AttorneyShowcase() {
  return (
    <section className="content-section attorney-section">
      <p className="eyebrow">Our attorneys</p>
      <h2>Experienced advocates. Personal attention.</h2>

      <div className="attorney-grid">
        {attorneys.map((attorney) => (
          <article key={attorney.id}>
            <div className="attorney-avatar">
              {attorney.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>

            <h3>{attorney.name}</h3>
            <strong>{attorney.title}</strong>
            <p>
              {attorney.yearsExperience} years of
              experience
            </p>

            <div>
              {attorney.practiceAreas.map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/page.tsx",
    title: "Legal Homepage",
    type: "typescript",
    content: `import {
  LegalHeader,
} from "../components/LegalHeader";
import {
  LegalHero,
} from "../components/LegalHero";
import {
  PracticeAreaGrid,
} from "../components/PracticeAreaGrid";
import {
  AttorneyShowcase,
} from "../components/AttorneyShowcase";

export default function HomePage() {
  return (
    <main>
      <LegalHeader />
      <LegalHero />
      <PracticeAreaGrid />
      <AttorneyShowcase />

      <section className="legal-trust-panel">
        <div>
          <p className="eyebrow">
            Client-centered representation
          </p>
          <h2>
            Legal matters managed with care,
            discipline, and transparency.
          </h2>
        </div>

        <div className="legal-metrics">
          <article>
            <strong>24h</strong>
            <span>Typical intake response</span>
          </article>

          <article>
            <strong>Secure</strong>
            <span>Document and message portal</span>
          </article>

          <article>
            <strong>Clear</strong>
            <span>Case status communication</span>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "components/ConsultationForm.tsx",
    title: "Consultation Intake Form",
    type: "typescript",
    content: `"use client";

import { useState } from "react";

export function ConsultationForm() {
  const [status, setStatus] = useState("");

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setStatus("Submitting confidential intake...");

    const form = new FormData(event.currentTarget);

    const response = await fetch(
      "/api/intake",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          matterType: form.get("matterType"),
          urgency: form.get("urgency"),
          opposingParty: form.get("opposingParty"),
          summary: form.get("summary"),
          consent: form.get("consent") === "on",
          status: "new",
        }),
      }
    );

    setStatus(
      response.ok
        ? "Your confidential intake was received."
        : "Your intake requires review."
    );
  }

  return (
    <form className="consultation-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Full name
          <input name="name" required />
        </label>

        <label>
          Email
          <input name="email" type="email" required />
        </label>

        <label>
          Phone
          <input name="phone" required />
        </label>

        <label>
          Legal matter
          <select name="matterType" required>
            <option>Business Law</option>
            <option>Personal Injury</option>
            <option>Family Law</option>
            <option>Estate Planning</option>
            <option>Real Estate Law</option>
            <option>Employment Law</option>
          </select>
        </label>

        <label>
          Urgency
          <select name="urgency">
            <option>Routine</option>
            <option>Time-sensitive</option>
            <option>Immediate</option>
          </select>
        </label>

        <label>
          Opposing party
          <input name="opposingParty" />
        </label>

        <label className="full-field">
          Matter summary
          <textarea
            name="summary"
            rows={8}
            required
          />
        </label>

        <label className="consent-field full-field">
          <input name="consent" type="checkbox" required />
          I understand that submitting this form does not
          create an attorney-client relationship.
        </label>
      </div>

      <button type="submit" className="legal-button">
        Submit confidential intake
      </button>

      {status ? <p>{status}</p> : null}
    </form>
  );
}
`,
  });

  files.push({
    file: "app/consultation/page.tsx",
    title: "Legal Consultation Intake",
    type: "typescript",
    content: `import {
  LegalHeader,
} from "../../components/LegalHeader";
import {
  ConsultationForm,
} from "../../components/ConsultationForm";

export default function ConsultationPage() {
  return (
    <main>
      <LegalHeader />

      <section className="consultation-page">
        <p className="eyebrow">
          Confidential consultation
        </p>

        <h1>Start with a focused case review.</h1>

        <p>
          Share the essential facts securely so the legal
          team can review conflicts, urgency, and the next
          appropriate step.
        </p>

        <ConsultationForm />
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "lib/legal-store.ts",
    title: "Legal Persistence Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

export async function listLegalRecords<T>(
  collection: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(
        path.join(directory, collection + ".json"),
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

export async function createLegalRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listLegalRecords(collection);

  const record = {
    ...input,
    id: collection + "-" + Date.now(),
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);

  await fs.mkdir(directory, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(directory, collection + ".json"),
    JSON.stringify(records, null, 2)
  );

  return record;
}
`,
  });

  const apiRoutes = [
    "intake",
    "cases",
    "clients",
    "documents",
    "appointments",
    "messages",
    "tasks",
    "billing",
    "conflicts",
  ];

  for (const route of apiRoutes) {
    files.push({
      file: `app/api/${route}/route.ts`,
      title: `${route} API`,
      type: "typescript",
      content: `import { NextResponse } from "next/server";
import {
  createLegalRecord,
  listLegalRecords,
} from "../../../lib/legal-store";

const collection = ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listLegalRecords(collection),
  });
}

export async function POST(request: Request) {
  const input = await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "A JSON object is required.",
      },
      { status: 400 }
    );
  }

  const record =
    await createLegalRecord(
      collection,
      input
    );

  return NextResponse.json(
    {
      ok: true,
      record,
    },
    { status: 201 }
  );
}
`,
    });
  }

  const portalPages = [
    [
      "app/client/page.tsx",
      "Client Portal",
      "Secure messages, documents, appointments, invoices, and matter status.",
    ],
    [
      "app/admin/page.tsx",
      "Legal Operations Dashboard",
      "New intake, active matters, deadlines, billing, conflicts, and team workload.",
    ],
    [
      "app/admin/intake/page.tsx",
      "Intake Review",
      "Review prospective clients, conflicts, urgency, matter type, and assignment.",
    ],
    [
      "app/admin/cases/page.tsx",
      "Case Management",
      "Matter status, responsible attorneys, deadlines, documents, tasks, and communication.",
    ],
    [
      "app/admin/clients/page.tsx",
      "Client Management",
      "Client records, contact details, matters, billing, portal access, and communication history.",
    ],
    [
      "app/admin/documents/page.tsx",
      "Document Management",
      "Secure uploads, document categories, matter association, versions, and review status.",
    ],
    [
      "app/admin/billing/page.tsx",
      "Legal Billing",
      "Time entries, invoices, retainers, payment status, and outstanding balances.",
    ],
  ];

  for (const [file, title, description] of portalPages) {
    files.push({
      file,
      title,
      type: "typescript",
      content: `export default function Page() {
  return (
    <main className="legal-operations-page">
      <p className="eyebrow">
        Legal Living OS
      </p>

      <h1>${title}</h1>
      <p>${description}</p>

      <div className="legal-operations-grid">
        <article>
          <span>New</span>
          <strong>8</strong>
        </article>

        <article>
          <span>Active</span>
          <strong>34</strong>
        </article>

        <article>
          <span>Deadlines this week</span>
          <strong>11</strong>
        </article>

        <article>
          <span>Needs review</span>
          <strong>5</strong>
        </article>
      </div>
    </main>
  );
}
`,
    });
  }

  files.push({
    file: "prisma/schema.prisma",
    title: "Legal Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Client {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  phone       String
  matters     Matter[]
  createdAt   DateTime @default(now())
}

model Attorney {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  role        String
  matters     Matter[]
  createdAt   DateTime @default(now())
}

model Matter {
  id            String     @id @default(cuid())
  title         String
  practiceArea  String
  status        String     @default("intake")
  clientId      String
  client        Client     @relation(fields: [clientId], references: [id])
  attorneyId    String?
  attorney      Attorney?  @relation(fields: [attorneyId], references: [id])
  documents     Document[]
  tasks         LegalTask[]
  appointments Appointment[]
  invoices      Invoice[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Intake {
  id             String   @id @default(cuid())
  name           String
  email          String
  phone          String
  matterType     String
  urgency        String
  opposingParty  String?
  summary        String
  conflictStatus String   @default("pending")
  status         String   @default("new")
  createdAt      DateTime @default(now())
}

model Document {
  id        String   @id @default(cuid())
  matterId  String
  matter    Matter   @relation(fields: [matterId], references: [id])
  name      String
  category  String
  storageKey String
  status    String   @default("active")
  createdAt DateTime @default(now())
}

model LegalTask {
  id        String   @id @default(cuid())
  matterId  String
  matter    Matter   @relation(fields: [matterId], references: [id])
  title     String
  dueAt     DateTime?
  status    String   @default("open")
  createdAt DateTime @default(now())
}

model Appointment {
  id        String   @id @default(cuid())
  matterId  String
  matter    Matter   @relation(fields: [matterId], references: [id])
  startsAt  DateTime
  type      String
  status    String   @default("scheduled")
  createdAt DateTime @default(now())
}

model Invoice {
  id        String   @id @default(cuid())
  matterId  String
  matter    Matter   @relation(fields: [matterId], references: [id])
  amount    Decimal  @db.Decimal(10, 2)
  status    String   @default("open")
  dueAt     DateTime?
  createdAt DateTime @default(now())
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Legal Design System",
    type: "css",
    content: `:root {
  --navy: #081522;
  --navy-soft: #102438;
  --cream: #f4efe4;
  --white: #fffdf8;
  --text: #16202a;
  --muted: #65717c;
  --gold: #b99455;
  --gold-light: #dcc18d;
  --line: rgba(8,21,34,.14);
  --dark-line: rgba(255,255,255,.12);
  --shadow: 0 28px 80px rgba(8,21,34,.16);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--cream);
  color: var(--text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.legal-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 18px 5vw;
  border-bottom: 1px solid var(--dark-line);
  background: rgba(8,21,34,.95);
  color: var(--white);
  backdrop-filter: blur(20px);
}

.legal-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.legal-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.legal-brand small {
  color: rgba(255,255,255,.65);
  font-size: 11px;
}

.legal-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid var(--gold);
  color: var(--gold-light);
  font-family: Georgia, serif;
  font-weight: 800;
}

.legal-header nav {
  display: flex;
  gap: 20px;
  color: rgba(255,255,255,.72);
  font-size: 14px;
  font-weight: 700;
}

.legal-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  padding: 14px 20px;
  background: var(--gold);
  color: var(--navy);
  font-weight: 900;
  cursor: pointer;
}

.legal-outline-button {
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 4px;
  padding: 14px 20px;
  color: var(--white);
  font-weight: 800;
}

.legal-hero {
  display: grid;
  min-height: 720px;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
  gap: 54px;
  padding: 84px 7vw;
  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(185,148,85,.18),
      transparent 30%
    ),
    var(--navy);
  color: var(--white);
}

.legal-hero h1,
.content-section h2,
.consultation-page h1,
.legal-operations-page h1,
.legal-trust-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(50px, 7vw, 94px);
  line-height: .98;
  letter-spacing: -.04em;
}

.legal-hero h1 span {
  color: var(--gold-light);
}

.legal-hero > div > p:not(.eyebrow) {
  max-width: 720px;
  color: rgba(255,255,255,.7);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--gold);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .24em;
  text-transform: uppercase;
}

.hero-actions,
.legal-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.legal-proof {
  color: rgba(255,255,255,.62);
  font-size: 13px;
  font-weight: 700;
}

.case-intake-preview,
.consultation-form,
.practice-grid article,
.attorney-grid article,
.legal-trust-panel,
.legal-operations-page {
  border: 1px solid var(--line);
  background: var(--white);
  box-shadow: var(--shadow);
}

.case-intake-preview {
  padding: 34px;
  color: var(--text);
}

.case-intake-preview h2 {
  font-family: Georgia, serif;
  font-size: 40px;
}

.preview-grid,
.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0,1fr));
  gap: 16px;
  margin: 24px 0;
}

.preview-grid label,
.form-grid label {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-weight: 700;
}

.preview-grid input,
.preview-grid select,
.preview-grid textarea,
.form-grid input,
.form-grid select,
.form-grid textarea {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--line);
  background: #fff;
}

.full-field {
  grid-column: 1 / -1;
}

.content-section,
.consultation-page {
  padding: 76px 7vw;
}

.content-section > h2 {
  max-width: 960px;
  font-size: clamp(42px, 6vw, 76px);
}

.practice-grid,
.attorney-grid,
.legal-metrics,
.legal-operations-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 20px;
  margin-top: 34px;
}

.practice-grid article,
.attorney-grid article {
  padding: 28px;
}

.practice-grid article > span {
  font-family: Georgia, serif;
  font-size: 27px;
}

.practice-grid p,
.attorney-grid p,
.consultation-page > p,
.legal-operations-page > p {
  color: var(--muted);
  line-height: 1.7;
}

.practice-grid a {
  color: var(--navy);
  font-weight: 900;
}

.attorney-section {
  background: var(--navy);
  color: var(--white);
}

.attorney-grid article {
  color: var(--text);
}

.attorney-avatar {
  display: grid;
  width: 90px;
  height: 90px;
  place-items: center;
  border-radius: 50%;
  background: var(--navy);
  color: var(--gold-light);
  font-family: Georgia, serif;
  font-size: 27px;
}

.attorney-grid article > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attorney-grid article > div:last-child span {
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--cream);
  font-size: 12px;
}

.legal-trust-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 38px;
  margin: 44px 7vw 80px;
  padding: 48px;
}

.legal-trust-panel h2 {
  font-size: clamp(40px, 5vw, 68px);
}

.legal-metrics {
  margin: 0;
}

.legal-metrics article,
.legal-operations-grid article {
  display: grid;
  gap: 8px;
  padding: 20px;
  border: 1px solid var(--line);
  background: var(--cream);
}

.legal-metrics strong,
.legal-operations-grid strong {
  color: var(--navy);
  font-size: 30px;
}

.legal-metrics span,
.legal-operations-grid span {
  color: var(--muted);
}

.consultation-page > h1 {
  max-width: 900px;
  font-size: clamp(48px, 6vw, 80px);
}

.consultation-form {
  margin-top: 34px;
  padding: 30px;
}

.consent-field {
  display: flex !important;
  grid-template-columns: auto 1fr;
  align-items: start;
}

.consent-field input {
  width: auto;
  margin-top: 3px;
}

.legal-operations-page {
  margin: 40px;
  padding: 48px;
}

.legal-operations-page h1 {
  font-size: clamp(46px, 6vw, 76px);
}

@media (max-width: 980px) {
  .legal-header {
    grid-template-columns: 1fr auto;
  }

  .legal-header nav {
    display: none;
  }

  .legal-hero,
  .legal-trust-panel {
    grid-template-columns: 1fr;
  }

  .practice-grid,
  .attorney-grid,
  .legal-metrics,
  .legal-operations-grid,
  .form-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .full-field {
    grid-column: auto;
  }
}
`,
  });

  return files;
}
