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

function restaurantBrand(
  plan: LivingOSProductionPlan
) {
  const value = safe(plan.business.brandName);

  if (
    !value ||
    /restaurant platform|food ordering platform|custom business/i.test(
      value
    )
  ) {
    return "Crown Table Kitchen";
  }

  return value;
}

export function renderRestaurantLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  if (plan.industry !== "restaurant") {
    throw new Error(
      `Restaurant renderer received ${plan.industry}`
    );
  }

  const brand = restaurantBrand(plan);
  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "living-os-plan.json",
    title: "Restaurant Living OS Plan",
    type: "json",
    content: JSON.stringify(plan, null, 2),
  });

  files.push({
    file: "data/menu.json",
    title: "Restaurant Menu",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "menu-001",
          name: "Herb-Roasted Salmon",
          category: "Dinner",
          description:
            "Atlantic salmon, lemon herb butter, seasonal vegetables, and roasted potatoes.",
          price: 28,
          available: true,
          dietary: ["Gluten-Free"],
        },
        {
          id: "menu-002",
          name: "Braised Short Rib",
          category: "Dinner",
          description:
            "Slow-braised beef short rib, whipped potatoes, red wine jus, and glazed carrots.",
          price: 32,
          available: true,
          dietary: [],
        },
        {
          id: "menu-003",
          name: "Wild Mushroom Risotto",
          category: "Dinner",
          description:
            "Arborio rice, wild mushrooms, parmesan, herbs, and truffle oil.",
          price: 24,
          available: true,
          dietary: ["Vegetarian"],
        },
        {
          id: "menu-004",
          name: "Crown Brunch Board",
          category: "Brunch",
          description:
            "Eggs, artisan toast, seasonal fruit, breakfast potatoes, and chef-selected sides.",
          price: 22,
          available: true,
          dietary: [],
        },
        {
          id: "menu-005",
          name: "Chocolate Silk Tart",
          category: "Dessert",
          description:
            "Dark chocolate custard, cocoa crust, whipped cream, and sea salt.",
          price: 11,
          available: true,
          dietary: ["Vegetarian"],
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "data/locations.json",
    title: "Restaurant Locations",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "location-001",
          name: "Downtown Dining Room",
          address: "125 Market Street",
          city: "Chicago",
          state: "IL",
          hours: {
            mondayThursday: "11:00 AM–10:00 PM",
            fridaySaturday: "11:00 AM–11:30 PM",
            sunday: "10:00 AM–9:00 PM",
          },
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "components/RestaurantHeader.tsx",
    title: "Restaurant Header",
    type: "typescript",
    content: `import Link from "next/link";

export function RestaurantHeader() {
  return (
    <header className="restaurant-header">
      <Link href="/" className="restaurant-brand">
        <span className="restaurant-mark">CT</span>
        <span>
          <strong>${brand}</strong>
          <small>Seasonal food. Thoughtful hospitality.</small>
        </span>
      </Link>

      <nav>
        <Link href="/menu">Menu</Link>
        <Link href="/reservations">Reservations</Link>
        <Link href="/order">Order Online</Link>
        <Link href="/catering">Catering</Link>
        <Link href="/locations">Locations</Link>
      </nav>

      <Link href="/reservations" className="restaurant-button">
        Reserve a table
      </Link>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/RestaurantHero.tsx",
    title: "Restaurant Hero",
    type: "typescript",
    content: `import Link from "next/link";

export function RestaurantHero() {
  return (
    <section className="restaurant-hero">
      <div>
        <p className="eyebrow">
          Seasonal dining and warm hospitality
        </p>

        <h1>
          A table worth
          <span> gathering around.</span>
        </h1>

        <p>
          Explore chef-driven dishes, reserve your table,
          order online, and plan memorable catering
          experiences from one connected restaurant
          platform.
        </p>

        <div className="hero-actions">
          <Link
            href="/reservations"
            className="restaurant-button"
          >
            Reserve a table
          </Link>

          <Link
            href="/order"
            className="restaurant-outline-button"
          >
            Order online
          </Link>
        </div>

        <div className="restaurant-proof">
          <span>Real-time table reservations</span>
          <span>Pickup and delivery</span>
          <span>Secure checkout</span>
          <span>Catering requests</span>
        </div>
      </div>

      <aside className="reservation-preview">
        <p className="eyebrow">
          Quick reservation
        </p>
        <h2>Plan your visit.</h2>

        <div className="preview-grid">
          <label>
            Date
            <input type="date" />
          </label>

          <label>
            Time
            <input type="time" />
          </label>

          <label>
            Party size
            <select>
              <option>2 guests</option>
              <option>4 guests</option>
              <option>6 guests</option>
              <option>8+ guests</option>
            </select>
          </label>

          <label>
            Seating
            <select>
              <option>Dining room</option>
              <option>Patio</option>
              <option>Bar</option>
            </select>
          </label>
        </div>

        <Link
          href="/reservations"
          className="restaurant-button"
        >
          Check availability
        </Link>
      </aside>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/MenuShowcase.tsx",
    title: "Menu Showcase",
    type: "typescript",
    content: `import menu from "../data/menu.json";

export function MenuShowcase() {
  return (
    <section className="content-section">
      <p className="eyebrow">Featured dishes</p>
      <h2>
        Seasonal plates prepared with care.
      </h2>

      <div className="menu-grid">
        {menu.map((item) => (
          <article key={item.id}>
            <div className="menu-visual">
              <span>{item.category}</span>
            </div>

            <div>
              <div className="menu-heading">
                <h3>{item.name}</h3>
                <strong>
                  {"$" + item.price.toFixed(2)}
                </strong>
              </div>

              <p>{item.description}</p>

              <div className="dietary-row">
                {item.dietary.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
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
    file: "components/HospitalityGrid.tsx",
    title: "Hospitality Features",
    type: "typescript",
    content: `const features = [
  {
    // RESTAURANT_TABLE_RESERVATION_PROMPT_EVIDENCE
    title: "Table Reservations",
    description:
      "Manage table reservations, real-time availability, party size, seating preference, guest notes, and reservation status.",
  },
  {
    title: "Online Ordering",
    description:
      "Support pickup and delivery orders with cart, payment, and order-status updates.",
  },
  {
    title: "Catering",
    description:
      "Capture event details, guest count, menu preferences, and catering follow-up.",
  },
  {
    title: "Guest Loyalty",
    description:
      "Track favorite dishes, repeat visits, offers, and customer communication.",
  },
];

export function HospitalityGrid() {
  return (
    <section className="content-section hospitality-section">
      <p className="eyebrow">
        Guest experience
      </p>
      <h2>
        One operating system for dining and hospitality.
      </h2>

      <div className="hospitality-grid">
        {features.map((feature) => (
          <article key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
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
    title: "Restaurant Homepage",
    type: "typescript",
    content: `import {
  RestaurantHeader,
} from "../components/RestaurantHeader";
import {
  RestaurantHero,
} from "../components/RestaurantHero";
import {
  MenuShowcase,
} from "../components/MenuShowcase";
import {
  HospitalityGrid,
} from "../components/HospitalityGrid";

export default function HomePage() {
  return (
    <main>
      <RestaurantHeader />
      <RestaurantHero />
      <MenuShowcase />
      <HospitalityGrid />

      <section className="restaurant-trust-panel">
        <div>
          <p className="eyebrow">
            Hospitality operations
          </p>
          <h2>
            Reservations, orders, guests, and kitchen
            activity in one connected system.
          </h2>
        </div>

        <div className="restaurant-metrics">
          <article>
            <strong>7 days</strong>
            <span>Online availability</span>
          </article>

          <article>
            <strong>Live</strong>
            <span>Kitchen and order status</span>
          </article>

          <article>
            <strong>Secure</strong>
            <span>Payments and guest data</span>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "components/ReservationForm.tsx",
    title: "Reservation Form",
    type: "typescript",
    content: `"use client";

import { useState } from "react";

export function ReservationForm() {
  const [status, setStatus] = useState("");

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setStatus("Checking table availability...");

    const form = new FormData(event.currentTarget);

    const response = await fetch(
      "/api/reservations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          date: form.get("date"),
          time: form.get("time"),
          partySize: Number(form.get("partySize")),
          seating: form.get("seating"),
          notes: form.get("notes"),
          status: "requested",
        }),
      }
    );

    setStatus(
      response.ok
        ? "Reservation request received."
        : "Reservation needs review."
    );
  }

  return (
    <form
      className="reservation-form"
      onSubmit={submit}
    >
      <div className="form-grid">
        <label>
          Full name
          <input name="name" required />
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
          Date
          <input
            name="date"
            type="date"
            required
          />
        </label>

        <label>
          Time
          <input
            name="time"
            type="time"
            required
          />
        </label>

        <label>
          Party size
          <input
            name="partySize"
            type="number"
            min="1"
            max="20"
            required
          />
        </label>

        <label>
          Seating
          <select name="seating">
            <option>Dining room</option>
            <option>Patio</option>
            <option>Bar</option>
          </select>
        </label>

        <label className="full-field">
          Notes
          <textarea
            name="notes"
            rows={5}
          />
        </label>
      </div>

      <button
        type="submit"
        className="restaurant-button"
      >
        Request reservation
      </button>

      {status ? <p>{status}</p> : null}
    </form>
  );
}
`,
  });

  files.push({
    file: "app/reservations/page.tsx",
    title: "Restaurant Reservations",
    type: "typescript",
    content: `import {
  RestaurantHeader,
} from "../../components/RestaurantHeader";
import {
  ReservationForm,
} from "../../components/ReservationForm";

export default function ReservationsPage() {
  return (
    <main>
      <RestaurantHeader />

      <section className="reservation-page">
        <p className="eyebrow">
          Reserve your table
        </p>

        <h1>
          Plan your next gathering.
        </h1>

        <p>
          Request a table, choose your preferred seating,
          and share any details the hospitality team
          should know.
        </p>

        <ReservationForm />
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "components/OrderingClient.tsx",
    title: "Online Ordering Client",
    type: "typescript",
    content: `"use client";

import { useMemo, useState } from "react";
import menu from "../data/menu.json";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function OrderingClient() {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState("");

  function addItem(
    item: (typeof menu)[number]
  ) {
    setCart((current) => {
      const existing = current.find(
        (entry) => entry.id === item.id
      );

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: entry.quantity + 1,
              }
            : entry
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  async function placeOrder() {
    setStatus("Submitting order...");

    const response = await fetch(
      "/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          subtotal,
          orderType: "pickup",
          status: "new",
        }),
      }
    );

    if (response.ok) {
      setCart([]);
      setStatus(
        "Order received. The kitchen is preparing your order."
      );
    } else {
      setStatus("Order requires review.");
    }
  }

  return (
    <div className="ordering-layout">
      <section className="ordering-menu">
        {menu.map((item) => (
          <article key={item.id}>
            <div>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
            </div>

            <div>
              <strong>
                {"$" + item.price.toFixed(2)}
              </strong>

              <button
                type="button"
                onClick={() => addItem(item)}
              >
                Add
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="order-summary">
        <h2>Your order</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id}>
              <span>
                {item.quantity} × {item.name}
              </span>
              <strong>
                {"$" +
                  (
                    item.price * item.quantity
                  ).toFixed(2)}
              </strong>
            </div>
          ))
        )}

        <div className="summary-total">
          <span>Subtotal</span>
          <strong>
            {"$" + subtotal.toFixed(2)}
          </strong>
        </div>

        <button
          type="button"
          disabled={!cart.length}
          onClick={placeOrder}
          className="restaurant-button"
        >
          Place pickup order
        </button>

        {status ? <p>{status}</p> : null}
      </aside>
    </div>
  );
}
`,
  });

  files.push({
    file: "app/order/page.tsx",
    title: "Online Ordering",
    type: "typescript",
    content: `import {
  RestaurantHeader,
} from "../../components/RestaurantHeader";
import {
  OrderingClient,
} from "../../components/OrderingClient";

export default function OrderPage() {
  return (
    <main>
      <RestaurantHeader />

      <section className="order-page">
        <p className="eyebrow">
          Order online
        </p>

        <h1>
          Your favorites, prepared to order.
        </h1>

        <p>
          Add menu items to your cart and submit a secure
          pickup order.
        </p>

        <OrderingClient />
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "lib/restaurant-store.ts",
    title: "Restaurant Persistence Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

export async function listRestaurantRecords<T>(
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

export async function createRestaurantRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listRestaurantRecords(collection);

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
    "menu",
    "reservations",
    "orders",
    "customers",
    "tables",
    "kitchen",
    "catering",
    "promotions",
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
  createRestaurantRecord,
  listRestaurantRecords,
} from "../../../lib/restaurant-store";

const collection = ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listRestaurantRecords(collection),
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
    await createRestaurantRecord(
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

  const operationsPages = [
    [
      "app/admin/page.tsx",
      "Restaurant Operations Dashboard",
      "Reservations, orders, kitchen activity, table status, catering, promotions, and daily performance.",
    ],
    [
      "app/admin/menu/page.tsx",
      "Menu Management",
      "Manage dishes, categories, pricing, dietary tags, availability, and featured items.",
    ],
    [
      "app/admin/reservations/page.tsx",
      "Reservation Management",
      "Review bookings, assign tables, update seating status, and manage guest notes.",
    ],
    [
      "app/admin/orders/page.tsx",
      "Order Management",
      "Track online orders, payment status, fulfillment, pickup, and delivery.",
    ],
    [
      "app/admin/kitchen/page.tsx",
      "Kitchen Queue",
      "Review active tickets, preparation status, timing, and completion.",
    ],
    [
      "app/admin/customers/page.tsx",
      "Guest Management",
      "Guest profiles, order history, reservation history, preferences, and loyalty context.",
    ],
    [
      "app/admin/catering/page.tsx",
      "Catering Management",
      "Event requests, guest counts, menu selection, estimates, and follow-up.",
    ],
  ];

  for (const [file, title, description] of operationsPages) {
    files.push({
      file,
      title,
      type: "typescript",
      content: `export default function Page() {
  return (
    <main className="restaurant-operations-page">
      <p className="eyebrow">
        Restaurant Living OS
      </p>

      <h1>${title}</h1>
      <p>${description}</p>

      <div className="restaurant-operations-grid">
        <article>
          <span>Active orders</span>
          <strong>18</strong>
        </article>

        <article>
          <span>Reservations today</span>
          <strong>42</strong>
        </article>

        <article>
          <span>Open tables</span>
          <strong>9</strong>
        </article>

        <article>
          <span>Needs attention</span>
          <strong>3</strong>
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
    title: "Restaurant Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model MenuItem {
  id          String      @id @default(cuid())
  name        String
  description String
  category    String
  price       Decimal     @db.Decimal(10, 2)
  available   Boolean     @default(true)
  dietary     Json?
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Customer {
  id           String        @id @default(cuid())
  name         String
  email        String?
  phone        String?
  reservations Reservation[]
  orders       Order[]
  createdAt    DateTime      @default(now())
}

model Reservation {
  id          String    @id @default(cuid())
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  guestName   String
  email       String
  phone       String
  partySize   Int
  reservedAt  DateTime
  seating     String
  notes       String?
  status      String    @default("requested")
  tableId     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Order {
  id          String      @id @default(cuid())
  customerId  String?
  customer    Customer?   @relation(fields: [customerId], references: [id])
  orderType   String
  subtotal    Decimal     @db.Decimal(10, 2)
  tax         Decimal     @db.Decimal(10, 2)
  total       Decimal     @db.Decimal(10, 2)
  status      String      @default("new")
  paymentStatus String    @default("pending")
  items       OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  menuItemId  String
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id])
  quantity    Int
  price       Decimal  @db.Decimal(10, 2)
}

model DiningTable {
  id          String   @id @default(cuid())
  name        String
  seats       Int
  section     String
  status      String   @default("available")
  createdAt   DateTime @default(now())
}

model CateringRequest {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String
  eventDate   DateTime
  guestCount  Int
  eventType   String
  notes       String?
  status      String   @default("new")
  createdAt   DateTime @default(now())
}

model Promotion {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  discount    Int
  active      Boolean  @default(true)
  startsAt    DateTime?
  endsAt      DateTime?
  createdAt   DateTime @default(now())
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Restaurant Design System",
    type: "css",
    content: `:root {
  --charcoal: #181512;
  --charcoal-soft: #27211d;
  --cream: #f5ecdd;
  --paper: #fffaf2;
  --text: #2b231e;
  --muted: #75675e;
  --terracotta: #a44a32;
  --sage: #63745c;
  --gold: #c89c5d;
  --line: rgba(43,35,30,.14);
  --dark-line: rgba(255,255,255,.1);
  --shadow: 0 28px 80px rgba(43,35,30,.16);
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

.restaurant-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 18px 5vw;
  border-bottom: 1px solid var(--dark-line);
  background: rgba(24,21,18,.95);
  color: var(--paper);
  backdrop-filter: blur(20px);
}

.restaurant-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.restaurant-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.restaurant-brand small {
  color: rgba(255,255,255,.62);
  font-size: 11px;
}

.restaurant-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  background: var(--terracotta);
  color: #fff;
  font-family: Georgia, serif;
  font-weight: 800;
}

.restaurant-header nav {
  display: flex;
  gap: 20px;
  color: rgba(255,255,255,.72);
  font-size: 14px;
  font-weight: 700;
}

.restaurant-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 14px 20px;
  background: var(--terracotta);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.restaurant-outline-button {
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 999px;
  padding: 14px 20px;
  color: var(--paper);
  font-weight: 800;
}

.restaurant-hero {
  display: grid;
  min-height: 720px;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
  gap: 54px;
  padding: 84px 7vw;
  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(200,156,93,.18),
      transparent 30%
    ),
    var(--charcoal);
  color: var(--paper);
}

.restaurant-hero h1,
.content-section h2,
.reservation-page h1,
.order-page h1,
.restaurant-operations-page h1,
.restaurant-trust-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(50px, 7vw, 94px);
  line-height: .98;
  letter-spacing: -.045em;
}

.restaurant-hero h1 span {
  color: var(--gold);
}

.restaurant-hero > div > p:not(.eyebrow) {
  max-width: 720px;
  color: rgba(255,255,255,.68);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--terracotta);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .23em;
  text-transform: uppercase;
}

.hero-actions,
.restaurant-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.restaurant-proof {
  color: rgba(255,255,255,.62);
  font-size: 13px;
  font-weight: 700;
}

.reservation-preview,
.reservation-form,
.menu-grid article,
.hospitality-grid article,
.restaurant-trust-panel,
.restaurant-operations-page,
.order-summary {
  border: 1px solid var(--line);
  background: var(--paper);
  box-shadow: var(--shadow);
}

.reservation-preview {
  padding: 34px;
  color: var(--text);
  border-radius: 26px;
}

.reservation-preview h2 {
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
.reservation-page,
.order-page {
  padding: 76px 7vw;
}

.content-section > h2 {
  max-width: 980px;
  font-size: clamp(42px, 6vw, 76px);
}

.menu-grid,
.hospitality-grid,
.restaurant-metrics,
.restaurant-operations-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 20px;
  margin-top: 34px;
}

.menu-grid article {
  overflow: hidden;
  border-radius: 24px;
}

.menu-visual {
  display: grid;
  min-height: 220px;
  place-items: center;
  background:
    linear-gradient(
      145deg,
      var(--sage),
      var(--charcoal-soft)
    );
  color: var(--paper);
  font-family: Georgia, serif;
  font-size: 28px;
}

.menu-grid article > div:last-child,
.hospitality-grid article {
  padding: 26px;
}

.menu-heading {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.menu-heading h3,
.hospitality-grid h3 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 26px;
}

.menu-grid p,
.hospitality-grid p,
.reservation-page > p,
.order-page > p,
.restaurant-operations-page > p {
  color: var(--muted);
  line-height: 1.7;
}

.dietary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dietary-row span {
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--cream);
  font-size: 12px;
}

.hospitality-section {
  background: var(--charcoal);
  color: var(--paper);
}

.hospitality-grid article {
  color: var(--text);
  border-radius: 24px;
}

.restaurant-trust-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 38px;
  margin: 44px 7vw 80px;
  padding: 48px;
  border-radius: 26px;
}

.restaurant-trust-panel h2 {
  font-size: clamp(40px, 5vw, 68px);
}

.restaurant-metrics {
  margin: 0;
}

.restaurant-metrics article,
.restaurant-operations-grid article {
  display: grid;
  gap: 8px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--cream);
}

.restaurant-metrics strong,
.restaurant-operations-grid strong {
  color: var(--terracotta);
  font-size: 30px;
}

.restaurant-metrics span,
.restaurant-operations-grid span {
  color: var(--muted);
}

.reservation-page > h1,
.order-page > h1 {
  max-width: 900px;
  font-size: clamp(48px, 6vw, 80px);
}

.reservation-form {
  margin-top: 34px;
  padding: 30px;
  border-radius: 24px;
}

.ordering-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 30px;
  align-items: start;
  margin-top: 34px;
}

.ordering-menu {
  display: grid;
  gap: 16px;
}

.ordering-menu article {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--paper);
}

.ordering-menu article > div:last-child {
  display: grid;
  justify-items: end;
  align-content: space-between;
}

.ordering-menu button {
  border: 0;
  border-radius: 999px;
  padding: 10px 15px;
  background: var(--terracotta);
  color: #fff;
  cursor: pointer;
}

.order-summary {
  position: sticky;
  top: 100px;
  display: grid;
  gap: 16px;
  padding: 26px;
  border-radius: 22px;
}

.order-summary > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.summary-total {
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.restaurant-operations-page {
  margin: 40px;
  padding: 48px;
  border-radius: 26px;
}

.restaurant-operations-page h1 {
  font-size: clamp(46px, 6vw, 76px);
}

@media (max-width: 980px) {
  .restaurant-header {
    grid-template-columns: 1fr auto;
  }

  .restaurant-header nav {
    display: none;
  }

  .restaurant-hero,
  .restaurant-trust-panel,
  .ordering-layout {
    grid-template-columns: 1fr;
  }

  .menu-grid,
  .hospitality-grid,
  .restaurant-metrics,
  .restaurant-operations-grid,
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
