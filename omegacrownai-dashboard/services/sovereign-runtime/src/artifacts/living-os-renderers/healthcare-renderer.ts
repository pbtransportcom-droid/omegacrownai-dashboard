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

function healthcareBrand(
  plan: LivingOSProductionPlan
) {
  const value = safe(plan.business.brandName);

  if (
    !value ||
    /healthcare platform|clinic platform|medical platform|custom business/i.test(
      value
    )
  ) {
    return "CrownCare Medical Group";
  }

  return value;
}

export function renderHealthcareLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  if (plan.industry !== "healthcare") {
    throw new Error(
      `Healthcare renderer received ${plan.industry}`
    );
  }

  const brand = healthcareBrand(plan);
  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "living-os-plan.json",
    title: "Healthcare Living OS Plan",
    type: "json",
    content: JSON.stringify(plan, null, 2),
  });

  files.push({
    file: "data/services.json",
    title: "Healthcare Services",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "primary-care",
          name: "Primary Care",
          description:
            "Preventive visits, chronic-condition support, annual exams, and coordinated care.",
        },
        {
          id: "urgent-care",
          name: "Urgent Care",
          description:
            "Same-day assessment for non-emergency illnesses, injuries, and time-sensitive concerns.",
        },
        {
          id: "telehealth",
          name: "Telehealth",
          description:
            "Secure virtual appointments for follow-up care, consultations, and routine needs.",
        },
        {
          id: "pediatrics",
          name: "Pediatrics",
          description:
            "Well-child visits, developmental guidance, vaccinations, and pediatric care.",
        },
        {
          id: "womens-health",
          name: "Women's Health",
          description:
            "Preventive screenings, wellness visits, and coordinated women's healthcare.",
        },
        {
          id: "behavioral-health",
          name: "Behavioral Health",
          description:
            "Confidential mental-health support, care plans, and follow-up services.",
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "data/providers.json",
    title: "Provider Profiles",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "provider-001",
          name: "Dr. Amelia Carter",
          title: "Family Medicine Physician",
          specialties: [
            "Primary Care",
            "Preventive Medicine",
          ],
          availability: [
            "Monday",
            "Wednesday",
            "Friday",
          ],
        },
        {
          id: "provider-002",
          name: "Dr. Daniel Brooks",
          title: "Internal Medicine Physician",
          specialties: [
            "Chronic Care",
            "Adult Medicine",
          ],
          availability: [
            "Tuesday",
            "Thursday",
            "Saturday",
          ],
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "components/HealthcareHeader.tsx",
    title: "Healthcare Header",
    type: "typescript",
    content: `import Link from "next/link";

export function HealthcareHeader() {
  return (
    <header className="health-header">
      <Link href="/" className="health-brand">
        <span className="health-mark">CC</span>
        <span>
          <strong>${brand}</strong>
          <small>Compassionate care, clearly coordinated.</small>
        </span>
      </Link>

      <nav>
        <Link href="/services">Services</Link>
        <Link href="/providers">Providers</Link>
        <Link href="/locations">Locations</Link>
        <Link href="/patient-resources">Resources</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <Link href="/appointments" className="health-button">
        Request appointment
      </Link>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/HealthcareHero.tsx",
    title: "Healthcare Hero",
    type: "typescript",
    content: `import Link from "next/link";

export function HealthcareHero() {
  return (
    <section className="health-hero">
      <div>
        <p className="eyebrow">
          Modern, patient-centered care
        </p>

        <h1>
          Healthcare that feels
          <span> personal, coordinated, and clear.</span>
        </h1>

        <p>
          Book appointments, meet trusted providers,
          manage care information, and receive secure
          follow-up through one connected patient
          experience.
        </p>

        <div className="hero-actions">
          <Link
            href="/appointments"
            className="health-button"
          >
            Request an appointment
          </Link>

          <Link
            href="/providers"
            className="health-outline-button"
          >
            Find a provider
          </Link>
        </div>

        <div className="health-proof">
          <span>Secure patient portal</span>
          <span>Telehealth available</span>
          <span>Coordinated follow-up</span>
          <span>Accessible care information</span>
        </div>
      </div>

      <aside className="appointment-preview">
        <p className="eyebrow">
          Appointment request
        </p>
        <h2>Find the right care.</h2>

        <div className="preview-grid">
          <label>
            Service
            <select>
              <option>Primary Care</option>
              <option>Urgent Care</option>
              <option>Telehealth</option>
              <option>Pediatrics</option>
            </select>
          </label>

          <label>
            Visit type
            <select>
              <option>In person</option>
              <option>Telehealth</option>
            </select>
          </label>

          <label>
            Preferred date
            <input type="date" />
          </label>

          <label>
            Insurance
            <input placeholder="Insurance provider" />
          </label>
        </div>

        <Link
          href="/appointments"
          className="health-button"
        >
          Continue appointment request
        </Link>
      </aside>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/HealthcareServiceGrid.tsx",
    title: "Healthcare Service Grid",
    type: "typescript",
    content: `import services from "../data/services.json";

export function HealthcareServiceGrid() {
  return (
    <section className="content-section">
      <p className="eyebrow">Care services</p>
      <h2>
        Convenient care for everyday and ongoing needs.
      </h2>

      <div className="health-service-grid">
        {services.map((service) => (
          <article key={service.id}>
            <span>{service.name}</span>
            <p>{service.description}</p>
            <a href={"/services/" + service.id}>
              View service
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
    file: "components/ProviderShowcase.tsx",
    title: "Provider Showcase",
    type: "typescript",
    content: `import providers from "../data/providers.json";

export function ProviderShowcase() {
  return (
    <section className="content-section provider-section">
      <p className="eyebrow">Meet our providers</p>
      <h2>
        Experienced clinicians who listen and coordinate.
      </h2>

      <div className="provider-grid">
        {providers.map((provider) => (
          <article key={provider.id}>
            <div className="provider-avatar">
              {provider.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>

            <h3>{provider.name}</h3>
            <strong>{provider.title}</strong>

            <div>
              {provider.specialties.map((specialty) => (
                <span key={specialty}>
                  {specialty}
                </span>
              ))}
            </div>

            <a href={"/providers/" + provider.id}>
              View profile
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
    file: "app/page.tsx",
    title: "Healthcare Homepage",
    type: "typescript",
    content: `import {
  HealthcareHeader,
} from "../components/HealthcareHeader";
import {
  HealthcareHero,
} from "../components/HealthcareHero";
import {
  HealthcareServiceGrid,
} from "../components/HealthcareServiceGrid";
import {
  ProviderShowcase,
} from "../components/ProviderShowcase";

export default function HomePage() {
  return (
    <main>
      <HealthcareHeader />
      <HealthcareHero />
      <HealthcareServiceGrid />
      <ProviderShowcase />

      <section className="health-trust-panel">
        <div>
          <p className="eyebrow">
            Connected patient experience
          </p>
          <h2>
            Care plans, appointments, communication,
            and follow-up in one secure system.
          </h2>
        </div>

        <div className="health-metrics">
          <article>
            <strong>24/7</strong>
            <span>Patient portal access</span>
          </article>

          <article>
            <strong>Secure</strong>
            <span>Protected health information</span>
          </article>

          <article>
            <strong>Fast</strong>
            <span>Appointment and message routing</span>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "components/AppointmentRequestForm.tsx",
    title: "Appointment Request Form",
    type: "typescript",
    content: `"use client";

import { useState } from "react";

export function AppointmentRequestForm() {
  const [status, setStatus] = useState("");

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setStatus("Submitting appointment request...");

    const form = new FormData(event.currentTarget);

    const response = await fetch(
      "/api/appointments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: form.get("patientName"),
          email: form.get("email"),
          phone: form.get("phone"),
          dateOfBirth: form.get("dateOfBirth"),
          service: form.get("service"),
          visitType: form.get("visitType"),
          preferredDate: form.get("preferredDate"),
          preferredTime: form.get("preferredTime"),
          insuranceProvider:
            form.get("insuranceProvider"),
          reason: form.get("reason"),
          consent: form.get("consent") === "on",
          status: "requested",
        }),
      }
    );

    setStatus(
      response.ok
        ? "Appointment request received. The care team will follow up."
        : "Appointment request requires review."
    );
  }

  return (
    <form
      className="appointment-form"
      onSubmit={submit}
    >
      <div className="form-grid">
        <label>
          Patient name
          <input name="patientName" required />
        </label>

        <label>
          Date of birth
          <input
            name="dateOfBirth"
            type="date"
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            required
          />
        </label>

        <label>
          Phone
          <input name="phone" required />
        </label>

        <label>
          Service
          <select name="service" required>
            <option>Primary Care</option>
            <option>Urgent Care</option>
            <option>Telehealth</option>
            <option>Pediatrics</option>
            <option>Women's Health</option>
            <option>Behavioral Health</option>
          </select>
        </label>

        <label>
          Visit type
          <select name="visitType">
            <option>In person</option>
            <option>Telehealth</option>
          </select>
        </label>

        <label>
          Preferred date
          <input
            name="preferredDate"
            type="date"
            required
          />
        </label>

        <label>
          Preferred time
          <input
            name="preferredTime"
            type="time"
            required
          />
        </label>

        <label className="full-field">
          Insurance provider
          <input name="insuranceProvider" />
        </label>

        <label className="full-field">
          Reason for visit
          <textarea
            name="reason"
            rows={7}
            required
          />
        </label>

        <label className="consent-field full-field">
          <input
            name="consent"
            type="checkbox"
            required
          />
          I consent to being contacted regarding this
          appointment request.
        </label>
      </div>

      <button
        type="submit"
        className="health-button"
      >
        Submit appointment request
      </button>

      {status ? <p>{status}</p> : null}
    </form>
  );
}
`,
  });

  files.push({
    file: "app/appointments/page.tsx",
    title: "Appointment Request Page",
    type: "typescript",
    content: `import {
  HealthcareHeader,
} from "../../components/HealthcareHeader";
import {
  AppointmentRequestForm,
} from "../../components/AppointmentRequestForm";

export default function AppointmentsPage() {
  return (
    <main>
      <HealthcareHeader />

      <section className="appointment-page">
        <p className="eyebrow">
          Request an appointment
        </p>

        <h1>
          Tell us what care you need.
        </h1>

        <p>
          Submit your preferred service, appointment
          details, and visit reason securely for care-team
          review.
        </p>

        <AppointmentRequestForm />
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "lib/healthcare-store.ts",
    title: "Healthcare Persistence Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

export async function listHealthcareRecords<T>(
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

export async function createHealthcareRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listHealthcareRecords(collection);

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
    "appointments",
    "patients",
    "providers",
    "care-plans",
    "messages",
    "documents",
    "prescriptions",
    "billing",
    "insurance",
    "telehealth",
  ];

  for (const route of apiRoutes) {
    files.push({
      file: `app/api/${route}/route.ts`,
      title: `${route} API`,
      type: "typescript",
      content: `import { NextResponse } from "next/server";
import {
  createHealthcareRecord,
  listHealthcareRecords,
} from "../../../lib/healthcare-store";

const collection = ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listHealthcareRecords(collection),
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
    await createHealthcareRecord(
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
      "app/patient/page.tsx",
      "Patient Portal",
      "Appointments, messages, care plans, documents, prescriptions, and billing.",
    ],
    [
      "app/provider/page.tsx",
      "Provider Workspace",
      "Patient schedule, clinical tasks, care plans, secure messages, and documentation.",
    ],
    [
      "app/admin/page.tsx",
      "Healthcare Operations Dashboard",
      "Appointments, providers, patient access, billing, care coordination, and operational alerts.",
    ],
    [
      "app/admin/appointments/page.tsx",
      "Appointment Management",
      "Review appointment requests, assign providers, confirm times, and manage visit status.",
    ],
    [
      "app/admin/patients/page.tsx",
      "Patient Management",
      "Patient demographics, portal status, care history, documents, communication, and billing context.",
    ],
    [
      "app/admin/providers/page.tsx",
      "Provider Management",
      "Provider profiles, schedules, specialties, capacity, and availability.",
    ],
    [
      "app/admin/billing/page.tsx",
      "Healthcare Billing",
      "Claims, invoices, insurance information, patient responsibility, and payment status.",
    ],
  ];

  for (const [file, title, description] of portalPages) {
    files.push({
      file,
      title,
      type: "typescript",
      content: `export default function Page() {
  return (
    <main className="health-operations-page">
      <p className="eyebrow">
        Healthcare Living OS
      </p>

      <h1>${title}</h1>
      <p>${description}</p>

      <div className="health-operations-grid">
        <article>
          <span>Today</span>
          <strong>24</strong>
        </article>

        <article>
          <span>Pending requests</span>
          <strong>9</strong>
        </article>

        <article>
          <span>Active care plans</span>
          <strong>146</strong>
        </article>

        <article>
          <span>Needs attention</span>
          <strong>4</strong>
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
    title: "Healthcare Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Patient {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  phone         String
  dateOfBirth   DateTime
  appointments  Appointment[]
  carePlans     CarePlan[]
  messages      Message[]
  createdAt     DateTime      @default(now())
}

model Provider {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  title         String
  specialty     String
  appointments  Appointment[]
  carePlans     CarePlan[]
  createdAt     DateTime      @default(now())
}

model Appointment {
  id             String    @id @default(cuid())
  patientId      String
  patient        Patient   @relation(fields: [patientId], references: [id])
  providerId     String?
  provider       Provider? @relation(fields: [providerId], references: [id])
  service        String
  visitType      String
  startsAt       DateTime
  reason         String
  status         String    @default("requested")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model CarePlan {
  id             String    @id @default(cuid())
  patientId      String
  patient        Patient   @relation(fields: [patientId], references: [id])
  providerId     String
  provider       Provider  @relation(fields: [providerId], references: [id])
  title          String
  goals          Json
  status         String    @default("active")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Message {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  senderRole  String
  subject     String
  body        String
  status      String   @default("unread")
  createdAt   DateTime @default(now())
}

model Prescription {
  id          String   @id @default(cuid())
  patientId   String
  providerId  String
  medication  String
  dosage      String
  status      String   @default("active")
  createdAt   DateTime @default(now())
}

model InsuranceRecord {
  id          String   @id @default(cuid())
  patientId   String
  provider    String
  memberId    String
  groupNumber String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
}

model Invoice {
  id          String   @id @default(cuid())
  patientId   String
  total       Decimal  @db.Decimal(10, 2)
  insurancePaid Decimal @db.Decimal(10, 2)
  patientDue  Decimal  @db.Decimal(10, 2)
  status      String   @default("open")
  createdAt   DateTime @default(now())
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Healthcare Design System",
    type: "css",
    content: `:root {
  --blue: #174a67;
  --blue-soft: #eaf4f8;
  --teal: #247a74;
  --teal-light: #7fc7bd;
  --white: #ffffff;
  --background: #f5fafb;
  --text: #18313d;
  --muted: #627985;
  --line: rgba(23,74,103,.14);
  --shadow: 0 26px 70px rgba(23,74,103,.14);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--background);
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

.health-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 18px 5vw;
  border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,.94);
  backdrop-filter: blur(20px);
}

.health-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.health-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.health-brand small {
  color: var(--muted);
  font-size: 11px;
}

.health-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 16px;
  background: var(--blue);
  color: #fff;
  font-weight: 900;
}

.health-header nav {
  display: flex;
  gap: 20px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
}

.health-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 14px 20px;
  background: var(--teal);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.health-outline-button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 14px 20px;
  background: var(--white);
  font-weight: 800;
}

.health-hero {
  display: grid;
  min-height: 700px;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
  gap: 54px;
  padding: 82px 7vw;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(127,199,189,.2),
      transparent 32%
    ),
    var(--blue-soft);
}

.health-hero h1,
.content-section h2,
.appointment-page h1,
.health-operations-page h1,
.health-trust-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(50px, 7vw, 92px);
  line-height: .98;
  letter-spacing: -.045em;
}

.health-hero h1 span {
  color: var(--teal);
}

.health-hero > div > p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--teal);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .22em;
  text-transform: uppercase;
}

.hero-actions,
.health-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.health-proof {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.appointment-preview,
.appointment-form,
.health-service-grid article,
.provider-grid article,
.health-trust-panel,
.health-operations-page {
  border: 1px solid var(--line);
  border-radius: 26px;
  background: var(--white);
  box-shadow: var(--shadow);
}

.appointment-preview {
  padding: 34px;
}

.appointment-preview h2 {
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
.form-grid input,
.form-grid select,
.form-grid textarea {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}

.full-field {
  grid-column: 1 / -1;
}

.content-section,
.appointment-page {
  padding: 76px 7vw;
}

.content-section > h2 {
  max-width: 980px;
  font-size: clamp(42px, 6vw, 76px);
}

.health-service-grid,
.provider-grid,
.health-metrics,
.health-operations-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 20px;
  margin-top: 34px;
}

.health-service-grid article,
.provider-grid article {
  padding: 28px;
}

.health-service-grid article > span {
  font-family: Georgia, serif;
  font-size: 27px;
}

.health-service-grid p,
.provider-grid p,
.appointment-page > p,
.health-operations-page > p {
  color: var(--muted);
  line-height: 1.7;
}

.health-service-grid a,
.provider-grid a {
  color: var(--teal);
  font-weight: 900;
}

.provider-section {
  background: var(--blue);
  color: #fff;
}

.provider-grid article {
  color: var(--text);
}

.provider-avatar {
  display: grid;
  width: 88px;
  height: 88px;
  place-items: center;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  font-family: Georgia, serif;
  font-size: 26px;
}

.provider-grid article > div:last-of-type {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.provider-grid article > div:last-of-type span {
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--blue-soft);
  font-size: 12px;
}

.health-trust-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 38px;
  margin: 44px 7vw 80px;
  padding: 48px;
}

.health-trust-panel h2 {
  font-size: clamp(40px, 5vw, 68px);
}

.health-metrics {
  margin: 0;
}

.health-metrics article,
.health-operations-grid article {
  display: grid;
  gap: 8px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--blue-soft);
}

.health-metrics strong,
.health-operations-grid strong {
  color: var(--blue);
  font-size: 30px;
}

.health-metrics span,
.health-operations-grid span {
  color: var(--muted);
}

.appointment-page > h1 {
  max-width: 900px;
  font-size: clamp(48px, 6vw, 80px);
}

.appointment-form {
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

.health-operations-page {
  margin: 40px;
  padding: 48px;
}

.health-operations-page h1 {
  font-size: clamp(46px, 6vw, 76px);
}

@media (max-width: 980px) {
  .health-header {
    grid-template-columns: 1fr auto;
  }

  .health-header nav {
    display: none;
  }

  .health-hero,
  .health-trust-panel {
    grid-template-columns: 1fr;
  }

  .health-service-grid,
  .provider-grid,
  .health-metrics,
  .health-operations-grid,
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
