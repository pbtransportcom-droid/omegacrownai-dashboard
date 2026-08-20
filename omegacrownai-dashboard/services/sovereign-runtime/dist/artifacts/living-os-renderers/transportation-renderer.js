function safe(value) {
    return String(value || "")
        .replace(/[<>&]/g, "")
        .trim();
}
function brandName(plan) {
    const value = safe(plan.business.brandName);
    if (!value ||
        /transportation platform|custom business/i.test(value)) {
        return "Princess Benjamin Transportation Company";
    }
    return value;
}
export function renderTransportationLivingOS(plan) {
    if (plan.industry !== "transportation") {
        throw new Error(`Transportation renderer received ${plan.industry}`);
    }
    const brand = brandName(plan);
    const files = [];
    files.push({
        file: "living-os-plan.json",
        title: "Transportation Living OS Plan",
        type: "json",
        content: JSON.stringify(plan, null, 2),
    });
    files.push({
        file: "data/fleet.json",
        title: "Fleet Data",
        type: "json",
        content: JSON.stringify([
            {
                id: "fleet-001",
                name: "Executive Sedan",
                category: "Sedan",
                passengers: 3,
                luggage: 3,
                hourlyRate: 95,
                airportRate: 135,
                status: "available",
            },
            {
                id: "fleet-002",
                name: "Luxury SUV",
                category: "SUV",
                passengers: 6,
                luggage: 6,
                hourlyRate: 135,
                airportRate: 185,
                status: "available",
            },
            {
                id: "fleet-003",
                name: "Executive Sprinter",
                category: "Sprinter",
                passengers: 12,
                luggage: 12,
                hourlyRate: 195,
                airportRate: 275,
                status: "assigned",
            },
        ], null, 2),
    });
    files.push({
        file: "data/service-areas.json",
        title: "Transportation Service Areas",
        type: "json",
        content: JSON.stringify([
            "Chicago O'Hare International Airport",
            "Chicago Midway International Airport",
            "Downtown Chicago",
            "North Shore",
            "Northwest Suburbs",
            "Corporate Transportation",
            "Long-Distance Chauffeur Service",
        ], null, 2),
    });
    files.push({
        file: "components/TransportationHeader.tsx",
        title: "Transportation Header",
        type: "typescript",
        content: `import Link from "next/link";

export function TransportationHeader() {
  return (
    <header className="transport-header">
      <Link href="/" className="transport-brand">
        <span className="crown-mark">PB</span>
        <span>
          <strong>${brand}</strong>
          <small>Your journey, our royal priority.</small>
        </span>
      </Link>

      <nav>
        <Link href="/services">Services</Link>
        <Link href="/fleet">Fleet</Link>
        <Link href="/airports">Airports</Link>
        <Link href="/corporate">Corporate</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <Link href="/booking" className="gold-button">
        Reserve a ride
      </Link>
    </header>
  );
}
`,
    });
    files.push({
        file: "components/TransportationHero.tsx",
        title: "Transportation Hero",
        type: "typescript",
        content: `import Link from "next/link";

export function TransportationHero() {
  return (
    <section className="transport-hero">
      <div className="hero-copy">
        <p className="eyebrow">
          Chicago airport and executive transportation
        </p>

        <h1>
          Arrive with confidence.
          <span> Travel with distinction.</span>
        </h1>

        <p>
          Premium airport transfers, corporate
          transportation, chauffeur service, and group
          travel throughout Chicago and surrounding areas.
        </p>

        <div className="hero-actions">
          <Link href="/booking" className="gold-button">
            Book transportation
          </Link>

          <a href="tel:+17735101467" className="outline-button">
            Call +1 (773) 510-1467
          </a>
        </div>

        <div className="service-proof">
          <span>24/7 dispatch</span>
          <span>Flight monitoring</span>
          <span>Professional chauffeurs</span>
          <span>Secure payments</span>
        </div>
      </div>

      <aside className="booking-preview">
        <p className="eyebrow">Instant reservation</p>
        <h2>Plan your next ride.</h2>

        <div className="preview-grid">
          <label>
            Pickup
            <input placeholder="O'Hare Terminal 5" />
          </label>

          <label>
            Destination
            <input placeholder="Downtown Chicago" />
          </label>

          <label>
            Date
            <input type="date" />
          </label>

          <label>
            Passengers
            <select>
              <option>1–3</option>
              <option>4–6</option>
              <option>7–12</option>
            </select>
          </label>
        </div>

        <Link href="/booking" className="gold-button">
          View vehicle options
        </Link>
      </aside>
    </section>
  );
}
`,
    });
    files.push({
        file: "components/FleetShowcase.tsx",
        title: "Fleet Showcase",
        type: "typescript",
        content: `import fleet from "../data/fleet.json";

export function FleetShowcase() {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Our fleet</p>
          <h2>Refined vehicles for every journey.</h2>
        </div>
      </div>

      <div className="fleet-grid">
        {fleet.map((vehicle) => (
          <article key={vehicle.id} className="fleet-card">
            <div className="vehicle-visual">
              <span>{vehicle.category}</span>
            </div>

            <div>
              <h3>{vehicle.name}</h3>
              <p>
                Up to {vehicle.passengers} passengers ·
                {vehicle.luggage} luggage
              </p>

              <div className="vehicle-price">
                <strong>
                  From {"$" + vehicle.airportRate}
                </strong>
                <a href="/booking">Select vehicle</a>
              </div>
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
        file: "components/ServiceGrid.tsx",
        title: "Transportation Services",
        type: "typescript",
        content: `const services = [
  {
    title: "Airport Transfers",
    description:
      "Meet-and-greet service, flight monitoring, terminal coordination, and luggage assistance.",
  },
  {
    title: "Corporate Transportation",
    description:
      "Executive travel, recurring accounts, centralized billing, and travel-manager visibility.",
  },
  {
    title: "Hourly Chauffeur",
    description:
      "Flexible hourly service for meetings, events, shopping, and multi-stop itineraries.",
  },
  {
    title: "Group Transportation",
    description:
      "Luxury SUVs and executive sprinters for families, teams, and event travel.",
  },
];

export function ServiceGrid() {
  return (
    <section className="content-section service-section">
      <p className="eyebrow">Transportation services</p>
      <h2>Professional service for every occasion.</h2>

      <div className="service-grid">
        {services.map((service) => (
          <article key={service.title}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href="/booking">Request service</a>
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
        title: "Transportation Homepage",
        type: "typescript",
        content: `import {
  TransportationHeader,
} from "../components/TransportationHeader";
import {
  TransportationHero,
} from "../components/TransportationHero";
import {
  ServiceGrid,
} from "../components/ServiceGrid";
import {
  FleetShowcase,
} from "../components/FleetShowcase";

export default function HomePage() {
  return (
    <main>
      <TransportationHeader />
      <TransportationHero />
      <ServiceGrid />
      <FleetShowcase />

      <section className="trust-panel">
        <div>
          <p className="eyebrow">Royal service standard</p>
          <h2>Every reservation is actively managed.</h2>
        </div>

        <div className="trust-grid">
          <article>
            <strong>24/7</strong>
            <span>Dispatch support</span>
          </article>

          <article>
            <strong>2</strong>
            <span>Chicago airports served</span>
          </article>

          <article>
            <strong>100%</strong>
            <span>Professional chauffeur oversight</span>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
    });
    files.push({
        file: "components/BookingForm.tsx",
        title: "Transportation Booking Form",
        type: "typescript",
        content: `"use client";

import { useMemo, useState } from "react";
import fleet from "../data/fleet.json";

export function BookingForm() {
  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    passengers: 1,
    vehicleId: "fleet-001",
    flightNumber: "",
    name: "",
    email: "",
    phone: "",
  });

  const [status, setStatus] = useState("");

  const vehicle = useMemo(
    () =>
      fleet.find(
        (item) => item.id === form.vehicleId
      ) || fleet[0],
    [form.vehicleId]
  );

  const estimate =
    vehicle.airportRate +
    Math.max(0, form.passengers - 3) * 15;

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setStatus("Submitting reservation...");

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        estimatedTotal: estimate,
        status: "requested",
      }),
    });

    setStatus(
      response.ok
        ? "Reservation received. Dispatch will confirm shortly."
        : "Reservation requires review."
    );
  }

  function update(
    field: keyof typeof form,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Pickup location
          <input
            required
            value={form.pickup}
            onChange={(event) =>
              update("pickup", event.target.value)
            }
          />
        </label>

        <label>
          Destination
          <input
            required
            value={form.destination}
            onChange={(event) =>
              update("destination", event.target.value)
            }
          />
        </label>

        <label>
          Date
          <input
            required
            type="date"
            value={form.date}
            onChange={(event) =>
              update("date", event.target.value)
            }
          />
        </label>

        <label>
          Time
          <input
            required
            type="time"
            value={form.time}
            onChange={(event) =>
              update("time", event.target.value)
            }
          />
        </label>

        <label>
          Passengers
          <input
            min="1"
            max="12"
            type="number"
            value={form.passengers}
            onChange={(event) =>
              update(
                "passengers",
                Number(event.target.value)
              )
            }
          />
        </label>

        <label>
          Vehicle
          <select
            value={form.vehicleId}
            onChange={(event) =>
              update("vehicleId", event.target.value)
            }
          >
            {fleet.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Flight number
          <input
            value={form.flightNumber}
            onChange={(event) =>
              update(
                "flightNumber",
                event.target.value
              )
            }
          />
        </label>

        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(event) =>
              update("name", event.target.value)
            }
          />
        </label>

        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              update("email", event.target.value)
            }
          />
        </label>

        <label>
          Phone
          <input
            required
            value={form.phone}
            onChange={(event) =>
              update("phone", event.target.value)
            }
          />
        </label>
      </div>

      <aside className="booking-summary">
        <span>Estimated service</span>
        <strong>{"$" + estimate.toFixed(2)}</strong>
        <p>{vehicle.name}</p>
        <button type="submit" className="gold-button">
          Request reservation
        </button>
        {status ? <p>{status}</p> : null}
      </aside>
    </form>
  );
}
`,
    });
    files.push({
        file: "app/booking/page.tsx",
        title: "Transportation Booking",
        type: "typescript",
        content: `import {
  TransportationHeader,
} from "../../components/TransportationHeader";
import {
  BookingForm,
} from "../../components/BookingForm";

export default function BookingPage() {
  return (
    <main>
      <TransportationHeader />

      <section className="booking-page">
        <p className="eyebrow">Reserve transportation</p>
        <h1>Plan a premium journey.</h1>
        <p>
          Submit your itinerary for airport, corporate,
          hourly, or group transportation.
        </p>

        <BookingForm />
      </section>
    </main>
  );
}
`,
    });
    files.push({
        file: "lib/transport-store.ts",
        title: "Transportation Persistence",
        type: "typescript",
        content: `import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

export async function listTransportRecords<T>(
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

export async function createTransportRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listTransportRecords(collection);

  const record = {
    ...input,
    id:
      collection +
      "-" +
      Date.now(),
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
        "bookings",
        "dispatch",
        "fleet",
        "drivers",
        "customers",
        "availability",
        "pricing",
        "invoices",
        "payments",
        "notifications",
    ];
    for (const route of apiRoutes) {
        files.push({
            file: `app/api/${route}/route.ts`,
            title: `${route} API`,
            type: "typescript",
            content: `import { NextResponse } from "next/server";
import {
  createTransportRecord,
  listTransportRecords,
} from "../../../lib/transport-store";

const collection = ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listTransportRecords(collection),
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
    await createTransportRecord(
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
            "app/customer/page.tsx",
            "Customer Portal",
            "Bookings, receipts, saved travelers, payment methods, and ride history.",
        ],
        [
            "app/dispatcher/page.tsx",
            "Dispatcher Console",
            "Live reservations, driver assignment, flight monitoring, and service status.",
        ],
        [
            "app/driver/page.tsx",
            "Driver Portal",
            "Assigned trips, passenger contact, navigation details, and trip status.",
        ],
        [
            "app/admin/fleet/page.tsx",
            "Fleet Management",
            "Vehicle availability, maintenance, documents, pricing, and assignments.",
        ],
        [
            "app/admin/bookings/page.tsx",
            "Booking Management",
            "Reservation review, assignment, payment status, and customer communication.",
        ],
        [
            "app/admin/customers/page.tsx",
            "Customer Management",
            "Traveler profiles, corporate accounts, booking history, and service preferences.",
        ],
        [
            "app/admin/invoices/page.tsx",
            "Invoice Management",
            "Corporate billing, invoice status, receipts, and payment reconciliation.",
        ],
    ];
    for (const [file, title, description] of portalPages) {
        files.push({
            file,
            title,
            type: "typescript",
            content: `export default function Page() {
  return (
    <main className="operations-page">
      <p className="eyebrow">
        Transportation Living OS
      </p>

      <h1>${title}</h1>
      <p>${description}</p>

      <div className="operations-grid">
        <article>
          <span>Active</span>
          <strong>12</strong>
        </article>

        <article>
          <span>Pending</span>
          <strong>5</strong>
        </article>

        <article>
          <span>Completed today</span>
          <strong>28</strong>
        </article>

        <article>
          <span>Needs attention</span>
          <strong>2</strong>
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
        title: "Transportation Database Schema",
        type: "prisma",
        content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id          String    @id @default(cuid())
  name        String
  email       String    @unique
  phone       String
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

model Driver {
  id          String    @id @default(cuid())
  name        String
  email       String    @unique
  phone       String
  status      String    @default("available")
  license     String
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

model Vehicle {
  id          String    @id @default(cuid())
  name        String
  category    String
  passengers  Int
  luggage     Int
  status      String    @default("available")
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

model Booking {
  id             String    @id @default(cuid())
  customerId     String
  customer       Customer  @relation(fields: [customerId], references: [id])
  driverId       String?
  driver         Driver?   @relation(fields: [driverId], references: [id])
  vehicleId      String?
  vehicle        Vehicle?  @relation(fields: [vehicleId], references: [id])
  pickup         String
  destination    String
  pickupAt       DateTime
  flightNumber   String?
  passengers     Int
  estimatedTotal Decimal   @db.Decimal(10, 2)
  status         String    @default("requested")
  paymentStatus  String    @default("pending")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model CorporateAccount {
  id            String    @id @default(cuid())
  companyName   String
  billingEmail  String
  billingTerms  String
  status        String    @default("active")
  createdAt     DateTime  @default(now())
}

model Invoice {
  id            String    @id @default(cuid())
  bookingId     String
  total         Decimal   @db.Decimal(10, 2)
  status        String    @default("open")
  dueAt         DateTime?
  createdAt     DateTime  @default(now())
}

model DispatchEvent {
  id            String    @id @default(cuid())
  bookingId     String
  type          String
  message       String
  createdAt     DateTime  @default(now())
}
`,
    });
    files.push({
        file: "app/globals.css",
        title: "Premium Transportation Design System",
        type: "css",
        content: `:root {
  --black: #050709;
  --surface: #0d1117;
  --surface-soft: #151b23;
  --white: #f8fafc;
  --muted: #aab3bf;
  --gold: #d7ad62;
  --gold-light: #f2d59a;
  --line: rgba(255,255,255,.1);
  --shadow: 0 30px 90px rgba(0,0,0,.45);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(215,173,98,.15),
      transparent 28%
    ),
    var(--black);
  color: var(--white);
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
select {
  font: inherit;
}

.transport-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 28px;
  padding: 18px 5vw;
  border-bottom: 1px solid var(--line);
  background: rgba(5,7,9,.9);
  backdrop-filter: blur(20px);
}

.transport-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.transport-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.transport-brand small {
  color: var(--muted);
  font-size: 11px;
}

.crown-mark {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
  background: var(--gold);
  color: var(--black);
  font-weight: 950;
}

.transport-header nav {
  display: flex;
  gap: 20px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
}

.gold-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 14px 20px;
  background: linear-gradient(
    135deg,
    var(--gold-light),
    var(--gold)
  );
  color: var(--black);
  font-weight: 900;
  cursor: pointer;
}

.outline-button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 14px 20px;
  font-weight: 800;
}

.transport-hero {
  display: grid;
  min-height: 700px;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
  gap: 54px;
  padding: 80px 7vw;
}

.hero-copy h1,
.section-heading h2,
.service-section h2,
.booking-page h1,
.operations-page h1,
.trust-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(50px, 7vw, 96px);
  line-height: .95;
  letter-spacing: -.05em;
}

.hero-copy h1 span {
  color: var(--gold);
}

.hero-copy > p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
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
.service-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.service-proof {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.booking-preview,
.booking-form,
.fleet-card,
.service-grid article,
.trust-panel,
.operations-page {
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.booking-preview {
  padding: 34px;
}

.booking-preview h2 {
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
.form-grid select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-soft);
  color: var(--white);
}

.content-section,
.booking-page {
  padding: 72px 7vw;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.fleet-grid,
.service-grid,
.operations-grid,
.trust-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 20px;
  margin-top: 32px;
}

.fleet-card,
.service-grid article {
  overflow: hidden;
}

.vehicle-visual {
  display: grid;
  min-height: 230px;
  place-items: center;
  background:
    linear-gradient(
      145deg,
      #1d2632,
      #080b10
    );
  color: var(--gold);
  font-size: 28px;
  font-weight: 900;
}

.fleet-card > div:last-child,
.service-grid article {
  padding: 24px;
}

.vehicle-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-price a,
.service-grid a {
  color: var(--gold);
  font-weight: 800;
}

.service-section > h2 {
  max-width: 900px;
}

.service-grid p,
.fleet-card p,
.booking-page > p,
.operations-page > p {
  color: var(--muted);
  line-height: 1.7;
}

.trust-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 40px 7vw 80px;
  padding: 48px;
}

.trust-grid {
  margin: 0;
}

.trust-grid article,
.operations-grid article {
  display: grid;
  gap: 8px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.03);
}

.trust-grid strong,
.operations-grid strong {
  font-size: 30px;
  color: var(--gold);
}

.trust-grid span,
.operations-grid span {
  color: var(--muted);
}

.booking-form {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 30px;
  margin-top: 34px;
  padding: 30px;
}

.booking-summary {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 24px;
  border-radius: 20px;
  background: var(--surface-soft);
}

.booking-summary strong {
  font-size: 36px;
  color: var(--gold);
}

.operations-page {
  margin: 40px;
  padding: 48px;
}

.operations-page h1 {
  font-size: clamp(46px, 6vw, 76px);
}

@media (max-width: 980px) {
  .transport-header {
    grid-template-columns: 1fr auto;
  }

  .transport-header nav {
    display: none;
  }

  .transport-hero,
  .trust-panel,
  .booking-form {
    grid-template-columns: 1fr;
  }

  .fleet-grid,
  .service-grid,
  .operations-grid,
  .trust-grid {
    grid-template-columns: 1fr;
  }
}
`,
    });
    return files;
}
