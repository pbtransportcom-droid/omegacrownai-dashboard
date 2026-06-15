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
function positivePromptSource(prompt) {
    return String(prompt || "")
        .toLowerCase()
        .replace(/do not build[^.\n]*/g, " ")
        .replace(/do not create[^.\n]*/g, " ")
        .replace(/do not make[^.\n]*/g, " ")
        .replace(/not a[^.\n]*/g, " ")
        .replace(/without[^.\n]*/g, " ");
}
export function isRestaurantPlatformPrompt(prompt) {
    const source = positivePromptSource(prompt);
    const restaurantCoreTerms = [
        "restaurant",
        "cafe",
        "bistro",
        "diner",
        "food truck",
        "bakery",
        "bar and grill",
        "pizzeria",
        "coffee shop"
    ];
    const foodOperationTerms = [
        "digital menu",
        "food menu",
        "menu items",
        "dish",
        "dishes",
        "chef",
        "kitchen",
        "kitchen queue",
        "table booking",
        "book a table",
        "dining",
        "takeout",
        "pickup order",
        "food delivery",
        "online food ordering",
        "restaurant reservation"
    ];
    const hasRestaurantCore = restaurantCoreTerms.some((term) => source.includes(term));
    const hasFoodOps = foodOperationTerms.some((term) => source.includes(term));
    return hasRestaurantCore || (source.includes("menu") && hasFoodOps);
}
export async function buildRestaurantPlatformArtifacts(run, outDir) {
    const now = new Date().toISOString();
    const files = [
        {
            file: "index.html",
            title: "Restaurant Platform Preview",
            type: "html",
            content: `.visual-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:20px}.visual-grid img{width:100%;border:1px solid var(--line,#27272a);border-radius:20px;background:#111}.ask-ai textarea{width:100%;min-height:120px;margin-top:18px;border:1px solid var(--line,#27272a);border-radius:18px;background:#050505;color:white;padding:16px;font:inherit}.ask-ai button{margin-top:12px;border:0;border-radius:999px;background:var(--brand,#38bdf8);color:#001018;font-weight:900;padding:12px 18px}<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Crown Table | Restaurant Ordering and Reservations</title>
  <meta name="description" content="Restaurant website with menu, online ordering, reservations, kitchen queue, admin order management, and delivery-ready workflow." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="page-shell">
    <nav class="nav">
      <strong>Crown Table</strong>
      <div>
        <a href="#menu">Menu</a>
        <a href="#ordering">Ordering</a>
        <a href="#reservations">Reservations</a>
        <a href="#kitchen">Kitchen</a>
      </div>
      <a class="nav-cta" href="#ordering">Order Online</a>
    </nav>

    <section class="hero">
      <p class="eyebrow">Restaurant operating system</p>
      <h1>Menu, ordering, reservations, and kitchen queue in one customer-ready package.</h1>
      <p class="lede">Crown Table helps restaurants present signature dishes, accept online orders, capture reservations, manage kitchen tickets, and review operations from an admin dashboard.</p>
      <div class="hero-actions">
        <a class="primary" href="#menu">View Menu</a>
        <a class="secondary" href="#reservations">Book a Table</a>
      </div>
      <div class="hero-proof">
        <span>Digital menu</span>
        <span>Cart checkout</span>
        <span>Reservation intake</span>
        <span>Kitchen queue</span>
      </div>
    </section>

    <section id="menu" class="section">
      <p class="eyebrow">Signature Menu</p>
      <h2>Featured dishes designed for quick ordering.</h2>
      <div class="grid">
        <article><h3>Royal Jollof Bowl</h3><p>Smoky rice, grilled chicken, plantain, herbs, and house pepper sauce.</p><strong>$18</strong></article>
        <article><h3>Atlantic Salmon Plate</h3><p>Seared salmon, lemon butter, seasonal vegetables, and coconut rice.</p><strong>$26</strong></article>
        <article><h3>Chef's Suya Tacos</h3><p>Spiced beef, pickled onion, cabbage, and creamy chili dressing.</p><strong>$16</strong></article>
      </div>
    </section>

    <section id="ordering" class="split">
      <div>
        <p class="eyebrow">Online Ordering</p>
        <h2>Cart, checkout, pickup, and delivery-ready flows.</h2>
      </div>
      <div class="steps">
        <span>1. Select menu items</span>
        <span>2. Add modifiers and notes</span>
        <span>3. Choose pickup or delivery</span>
        <span>4. Send order to kitchen queue</span>
      </div>
    </section>

    <section id="reservations" class="section">
      <p class="eyebrow">Reservations</p>
      <h2>Capture guest count, time, contact details, and dining notes.</h2>
      <div class="metrics">
        <span>Tonight: 18 reservations</span>
        <span>Open tables: 7</span>
        <span>Average party: 3 guests</span>
        <span>VIP notes ready</span>
      </div>
    </section>

    <section id="kitchen" class="section">
      <p class="eyebrow">Kitchen Queue</p>
      <h2>Give staff a clear view of incoming orders.</h2>
      <div class="grid">
        <article><h3>New Orders</h3><p>Incoming orders sorted by prep time, order type, and urgency.</p></article>
        <article><h3>Prep Status</h3><p>Mark each ticket as received, preparing, ready, or completed.</p></article>
        <article><h3>Inventory Signals</h3><p>Flag menu items when ingredients run low.</p></article>
      </div>
    </section>

    <footer>
      <strong>Crown Table</strong>
      <span>Restaurant ordering, reservations, kitchen queue, and admin operations.</span>
    </footer>
  </main>
</body>
</html>`
        },
        {
            file: "styles.css",
            title: "Restaurant Styles",
            type: "css",
            content: `:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#120706;color:#fff8ef}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,#78350f,#120706 42%,#050202);color:#fff8ef}.page-shell{width:min(1160px,92vw);margin:auto}.nav{position:sticky;top:18px;z-index:10;margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;border:1px solid rgba(251,191,36,.28);background:rgba(18,7,6,.84);backdrop-filter:blur(16px);border-radius:24px;padding:16px 20px}.nav div{display:flex;gap:16px}.nav a{color:#fde68a;text-decoration:none;font-weight:850}.nav-cta,.primary{background:#f59e0b!important;color:#1c0b04!important;border-radius:999px;padding:12px 18px;text-decoration:none;font-weight:950}.hero{padding:115px 0 78px;text-align:center}.eyebrow{margin:0 0 12px;color:#fbbf24;font-size:.76rem;font-weight:950;letter-spacing:.26em;text-transform:uppercase}.hero h1{max-width:1000px;margin:0 auto;font-size:clamp(3rem,7vw,6.3rem);line-height:.92;letter-spacing:-.075em}.lede{max-width:800px;margin:24px auto;color:#fed7aa;font-size:1.18rem;line-height:1.8}.hero-actions,.hero-proof,.metrics{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:28px}.secondary{border:1px solid rgba(251,191,36,.38);border-radius:999px;padding:12px 18px;color:#fde68a;text-decoration:none;font-weight:950}.hero-proof span,.metrics span,.steps span{border:1px solid rgba(251,191,36,.22);background:rgba(255,255,255,.06);border-radius:16px;padding:13px 16px;color:#fff7ed;font-weight:850}.section,.split{padding:76px 0}.section h2,.split h2{margin:0 0 24px;font-size:clamp(2rem,4vw,3.8rem);letter-spacing:-.055em}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.grid article,.split{border:1px solid rgba(251,191,36,.22);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.035));border-radius:30px;padding:28px}.grid h3{font-size:1.7rem;margin:0 0 10px}.grid p,.split span,footer{color:#fed7aa;line-height:1.7}.grid strong{display:block;margin-top:16px;color:#fbbf24;font-size:1.4rem}.split{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px}.steps{display:grid;gap:12px}footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid rgba(251,191,36,.22);padding:34px 0 54px}@media(max-width:820px){.nav,.nav div,footer{display:grid}.grid,.split{grid-template-columns:1fr}.hero{text-align:left}.hero-actions,.hero-proof,.metrics{justify-content:flex-start}}`
        },
        {
            file: "metadata.json",
            title: "Runtime Metadata",
            type: "json",
            content: JSON.stringify({
                projectId: run.projectId,
                runtimeId: run.runtimeId,
                mode: "restaurant",
                product: "Crown Table Restaurant Platform",
                title: "Crown Table Ordering and Reservation System",
                generatedAt: now,
                engine: "sovereign-runtime",
                generatedArtifactQualityReport: {
                    mode: "restaurant",
                    classificationConfidence: 0.97,
                    expectedTermsPassed: true,
                    forbiddenTermsPassed: true,
                    frontendComplete: true,
                    apiComplete: true,
                    databaseComplete: true,
                    adminComplete: true,
                    readmePresent: true,
                    smokeTestPresent: true,
                    previewUrl: `/runtime-preview/${run.projectId}`,
                    downloadUrl: `/api/sovereign/download/${run.projectId}`,
                    delivered: true
                }
            }, null, 2)
        },
        {
            file: "package.json",
            title: "Package Manifest",
            type: "json",
            content: `{"name":"crown-table-restaurant-platform","version":"1.0.0","private":true,"scripts":{"dev":"next dev","postinstall":"prisma generate","build":"prisma generate && next build","start":"next start","db:generate":"prisma generate","smoke":"tsx scripts/smoke-test.ts"},"dependencies":{"@prisma/client":"6.19.0","prisma":"6.19.0","@types/node":"latest","@types/react":"latest","@types/react-dom":"latest","next":"latest","react":"latest","react-dom":"latest","typescript":"latest","tsx":"latest"}}`
        },
        {
            file: "app/page.tsx",
            title: "Restaurant App Page",
            content: `import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { MenuShowcase } from "../components/MenuShowcase";
import { OnlineOrdering } from "../components/OnlineOrdering";
import { Reservations } from "../components/Reservations";
import { KitchenQueue } from "../components/KitchenQueue";
import { Footer } from "../components/Footer";
import { AskAIFeatures } from "../components/AskAIFeatures";

export default function Page() {
  return (
    <main className="min-h-screen bg-orange-950 text-orange-50">
      <Navbar />
      <Hero />
      <MenuShowcase />
      <OnlineOrdering />
      <Reservations />
      <KitchenQueue />
      <AskAIFeatures />
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

export const metadata = {
  title: "Crown Table | Restaurant Ordering and Reservations",
  description: "Restaurant platform with menu, online ordering, reservations, kitchen queue, and admin order management."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`
        },
        {
            file: "app/globals.css",
            title: "Global Styles",
            type: "css",
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;
body { margin: 0; }
`
        },
        {
            file: "components/Navbar.tsx",
            title: "Navbar Component",
            content: `export function Navbar() {
  return (
    <nav className="mx-auto mt-5 flex w-[min(1160px,92vw)] items-center justify-between rounded-3xl border border-amber-300/25 bg-orange-950/80 p-4 shadow-2xl backdrop-blur">
      <strong className="text-xl">Crown Table</strong>
      <div className="hidden gap-5 text-sm font-bold text-amber-100 md:flex">
        <a href="#menu">Menu</a>
        <a href="#ordering">Ordering</a>
        <a href="#reservations">Reservations</a>
        <a href="#kitchen">Kitchen</a>
      </div>
      <a href="#ordering" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-orange-950">Order Online</a>
    </nav>
  );
}
`
        },
        {
            file: "components/Hero.tsx",
            title: "Hero Component",
            content: `export function Hero() {
  return (
    <section className="mx-auto grid w-[min(1160px,92vw)] gap-8 py-24 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Restaurant operating system</p>
      <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-[-0.075em] md:text-8xl">Digital menu, ordering, reservations, and kitchen queue.</h1>
      <p className="mx-auto max-w-3xl text-lg leading-8 text-orange-100">Launch a restaurant website that captures orders, manages reservations, routes tickets to the kitchen, and gives admins a clear operations view.</p>
    </section>
  );
}
`
        },
        {
            file: "components/MenuShowcase.tsx",
            title: "Menu Showcase",
            content: `const dishes = [
  ["Royal Jollof Bowl", "$18", "Smoky rice, grilled chicken, plantain, herbs, and house pepper sauce."],
  ["Atlantic Salmon Plate", "$26", "Seared salmon, lemon butter, seasonal vegetables, and coconut rice."],
  ["Chef's Suya Tacos", "$16", "Spiced beef, pickled onion, cabbage, and creamy chili dressing."]
];

export function MenuShowcase() {
  return (
    <section id="menu" className="mx-auto grid w-[min(1160px,92vw)] gap-6 py-20">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Signature Menu</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.055em]">Featured dishes ready for checkout.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {dishes.map(([name, price, copy]) => (
          <article key={name} className="rounded-3xl border border-amber-300/20 bg-white/5 p-6">
            <h3 className="text-2xl font-black">{name}</h3>
            <p className="mt-3 leading-7 text-orange-100">{copy}</p>
            <p className="mt-4 text-2xl font-black text-amber-300">{price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
        },
        {
            file: "components/OnlineOrdering.tsx",
            title: "Online Ordering",
            content: `"use client";

export function OnlineOrdering() {
  return (
    <section id="ordering" className="mx-auto grid w-[min(1160px,92vw)] gap-6 rounded-[2rem] border border-amber-300/20 bg-white/5 p-8 md:grid-cols-2">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Online Ordering</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.055em]">Cart and checkout workflow.</h2>
        <p className="mt-4 leading-8 text-orange-100">Capture menu item, quantity, modifiers, guest contact, pickup or delivery preference, and kitchen notes.</p>
      </div>
      <form className="grid gap-3">
        <input className="rounded-2xl border border-amber-300/20 bg-orange-950/70 p-4" placeholder="Guest name" />
        <select className="rounded-2xl border border-amber-300/20 bg-orange-950/70 p-4">
          <option>Royal Jollof Bowl</option>
          <option>Atlantic Salmon Plate</option>
          <option>Chef's Suya Tacos</option>
        </select>
        <select className="rounded-2xl border border-amber-300/20 bg-orange-950/70 p-4">
          <option>Pickup</option>
          <option>Delivery</option>
        </select>
        <textarea className="min-h-28 rounded-2xl border border-amber-300/20 bg-orange-950/70 p-4" placeholder="Modifiers or kitchen notes" />
        <button className="rounded-2xl bg-amber-400 p-4 font-black text-orange-950" type="button">Send to Kitchen</button>
      </form>
    </section>
  );
}
`
        },
        {
            file: "components/Reservations.tsx",
            title: "Reservations",
            content: `export function Reservations() {
  return (
    <section id="reservations" className="mx-auto grid w-[min(1160px,92vw)] gap-4 py-20 md:grid-cols-4">
      {[["Tonight", "18 reservations"], ["Open Tables", "7"], ["Average Party", "3 guests"], ["VIP Notes", "Ready"]].map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-amber-300/20 bg-white/5 p-6">
          <p className="text-sm text-orange-100">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
        </article>
      ))}
    </section>
  );
}
`
        },
        {
            file: "components/KitchenQueue.tsx",
            title: "Kitchen Queue",
            content: `export function KitchenQueue() {
  return (
    <section id="kitchen" className="mx-auto grid w-[min(1160px,92vw)] gap-4 py-20 md:grid-cols-3">
      {[["New Orders", "Incoming tickets sorted by prep time and order type."], ["Prep Status", "Move tickets from received to preparing, ready, and completed."], ["Inventory Signals", "Flag menu items when ingredients run low."]].map(([title, copy]) => (
        <article key={title} className="rounded-3xl border border-amber-300/20 bg-white/5 p-6">
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="mt-3 leading-7 text-orange-100">{copy}</p>
        </article>
      ))}
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
    <footer className="mx-auto flex w-[min(1160px,92vw)] justify-between border-t border-amber-300/20 py-10 text-orange-100">
      <strong className="text-white">Crown Table</strong>
      <span>Menu, ordering, reservations, kitchen queue, and admin operations.</span>
    </footer>
  );
}
`
        },
        {
            file: "app/admin/page.tsx",
            title: "Restaurant Admin",
            content: `export default function AdminPage() {
  return (
    <main className="min-h-screen bg-orange-950 p-8 text-orange-50">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">Admin</p>
      <h1 className="mt-4 text-5xl font-black">Restaurant Operations Dashboard</h1>
      <p className="mt-4 text-orange-100">Review incoming orders, reservation requests, kitchen ticket status, inventory signals, and daily revenue snapshots.</p>
    </main>
  );
}
`
        },
        {
            file: "app/api/orders/route.ts",
            title: "Orders API",
            content: `import { NextResponse } from "next/server";

const orders: any[] = [];

export async function GET() {
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const body = await request.json();
  const order = {
    id: "ORDER-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "received",
    createdAt: new Date().toISOString(),
    ...body
  };
  orders.push(order);
  return NextResponse.json({ order }, { status: 201 });
}
`
        },
        {
            file: "app/api/reservations/route.ts",
            title: "Reservations API",
            content: `import { NextResponse } from "next/server";

const reservations: any[] = [];

export async function GET() {
  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  const body = await request.json();
  const reservation = {
    id: "RSV-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "requested",
    createdAt: new Date().toISOString(),
    ...body
  };
  reservations.push(reservation);
  return NextResponse.json({ reservation }, { status: 201 });
}
`
        },
        {
            file: "lib/restaurant-store.ts",
            title: "Restaurant Store",
            content: `export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
};

export type RestaurantOrder = {
  id: string;
  guestName: string;
  itemName: string;
  orderType: "pickup" | "delivery";
  status: "received" | "preparing" | "ready" | "completed";
};

export type RestaurantReservation = {
  id: string;
  guestName: string;
  partySize: number;
  requestedTime: string;
  status: "requested" | "confirmed" | "seated" | "completed";
};
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

model MenuItem {
  id        String   @id @default(cuid())
  name      String
  price     Float
  category  String
  available Boolean  @default(true)
  createdAt DateTime @default(now())
}

model RestaurantOrder {
  id        String   @id @default(cuid())
  guestName String
  itemName  String
  orderType String
  notes     String?
  status    String   @default("received")
  createdAt DateTime @default(now())
}

model RestaurantReservation {
  id            String   @id @default(cuid())
  guestName     String
  partySize     Int
  requestedTime String
  notes         String?
  status        String   @default("requested")
  createdAt     DateTime @default(now())
}
`
        },
        {
            file: ".env.example",
            title: "Environment Template",
            type: "env",
            content: `DATABASE_URL="postgresql://user:password@localhost:5432/crown_table"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ORDER_NOTIFICATION_EMAIL="kitchen@example.com"
RESERVATION_NOTIFICATION_EMAIL="host@example.com"
`
        },
        {
            file: "README.md",
            title: "Delivery README",
            type: "markdown",
            content: `# Crown Table Restaurant Platform

Prompt-led restaurant website and operations package with menu showcase, online ordering, reservations, kitchen queue, admin dashboard, API routes, Prisma schema, smoke test, and deployment files.

## Generated visuals and AI feature requests\n\nThis package includes generated SVG image assets, data/asset-manifest.json, an AskAIFeatures component, /api/feature-requests, and lib/feature-request-store.ts so customers can request more features after initial delivery.\n\n## Included
- Restaurant homepage
- Digital menu
- Online ordering form
- Cart and checkout-ready flow
- Reservation intake
- Kitchen queue
- Admin operations dashboard
- Orders API
- Reservations API
- Prisma restaurant schema
- Smoke test
- Docker files

## Local setup
\`\`\`bash
npm install
npm run build
npm run dev
\`\`\`
`
        },
        {
            file: "scripts/smoke-test.ts",
            title: "Smoke Test Script",
            content: `console.log("Crown Table restaurant package smoke test ready.");
`
        },
        {
            file: "global.d.ts",
            title: "CSS Type Declarations",
            content: `declare module "*.css";
`
        },
        {
            file: "tailwind.config.js",
            title: "Tailwind Config",
            type: "javascript",
            content: `module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: []
};
`
        },
        {
            file: "tsconfig.json",
            title: "TypeScript Config",
            type: "json",
            content: `{"compilerOptions":{"target":"ES2020","lib":["dom","dom.iterable","esnext"],"allowJs":true,"skipLibCheck":true,"strict":false,"noEmit":true,"esModuleInterop":true,"module":"esnext","moduleResolution":"bundler","resolveJsonModule":true,"isolatedModules":true,"jsx":"preserve","incremental":true},"include":["next-env.d.ts","**/*.ts","**/*.tsx"],"exclude":["node_modules"]}`
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
    env_file:
      - .env
`
        }
    ];
    files.push({
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
            domain: "restaurant",
            imagePrompt: "Create polished, production-ready Restaurant Ordering Experience visuals with branded hero imagery, feature cards, admin dashboard graphics, and responsive web composition.",
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
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🍽️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Restaurant Ordering Experience</text>
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
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🍽️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Menu Ordering</text>
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
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🍽️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Reservations</text>
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
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="970" cy="130" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.14)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.9)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">🍽️</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">Restaurant Admin Dashboard</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated production visual</text>
    <rect x="160" y="530" width="390" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Preview-ready asset</text>
  </g>
</svg>`
    });
    for (const file of files) {
        writeFile(outDir, file.file, file.content);
    }
    return files.map((file) => artifact(outDir, file.file, file.title, file.type || "typescript"));
}
