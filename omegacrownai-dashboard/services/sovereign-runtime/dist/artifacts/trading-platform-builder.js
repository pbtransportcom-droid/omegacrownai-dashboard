import fs from "fs";
import path from "path";
function writeFile(outDir, file, content) {
    const filePath = path.join(outDir, file);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return filePath;
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
export function isTradingPlatformPrompt(prompt) {
    const source = positivePromptSource(prompt);
    return [
        "king trading system",
        "stock prediction",
        "trading",
        "trade",
        "portfolio",
        "broker",
        "alpaca",
        "watchlist",
        "signal",
        "scanner",
        "forecast",
        "market",
        "risk controls",
        "backtest",
        "trade journal",
        "paper trading",
    ].some((term) => source.includes(term));
}
export async function buildTradingPlatformArtifacts(run, outDir) {
    const now = new Date().toISOString();
    const files = [
        {
            file: "index.html",
            title: "Trading Platform Preview",
            type: "html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>King Trading System | AI Market Command Center</title>
  <meta name="description" content="AI trading command center with signals, portfolio tracking, risk rules, watchlists, trade journal, and broker-ready workflows." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="page-shell">
    <nav class="nav">
      <strong>King Trading System</strong>
      <div>
        <a href="#signals">Signals</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#risk">Risk</a>
        <a href="#journal">Journal</a>
      </div>
      <a class="nav-cta" href="#signals">Open Command Center</a>
    </nav>

    <section class="hero">
      <p class="eyebrow">AI market command center</p>
      <h1>Predict, monitor, and manage trades from one sovereign dashboard.</h1>
      <p class="lede">King Trading System combines signal review, portfolio exposure, risk controls, watchlists, backtest readiness, broker configuration, and trade journaling in one deployable package.</p>
      <div class="hero-actions">
        <a class="primary" href="#signals">Review Signals</a>
        <a class="secondary" href="#risk">Inspect Risk Rules</a>
      </div>
      <div class="hero-proof">
        <span>AI signals</span>
        <span>Portfolio exposure</span>
        <span>Risk controls</span>
        <span>Trade journal</span>
      </div>
    </section>

    <section id="signals" class="section">
      <p class="eyebrow">Signal Review</p>
      <h2>Ranked market ideas with confidence, trend, and risk context.</h2>
      <div class="grid">
        <article><h3>AAPL</h3><p>Momentum improving. Confidence: 82%. Suggested review: wait for volume confirmation.</p></article>
        <article><h3>NVDA</h3><p>Trend remains strong. Confidence: 78%. Suggested review: watch resistance and position size.</p></article>
        <article><h3>SPY</h3><p>Broad market filter. Confidence: 71%. Suggested review: risk-on only above moving average.</p></article>
      </div>
    </section>

    <section id="portfolio" class="section">
      <p class="eyebrow">Portfolio Tracker</p>
      <h2>Monitor allocation, realized P/L, open risk, and watchlist movement.</h2>
      <div class="metrics">
        <span>Equity exposure: 62%</span>
        <span>Cash buffer: 38%</span>
        <span>Max risk per trade: 1.5%</span>
        <span>Open positions: 4</span>
      </div>
    </section>

    <section id="risk" class="split">
      <div>
        <p class="eyebrow">Risk Rules</p>
        <h2>Guardrails before execution.</h2>
      </div>
      <div class="steps">
        <span>1. Confirm market regime</span>
        <span>2. Validate signal confidence</span>
        <span>3. Calculate position size</span>
        <span>4. Log thesis before entry</span>
      </div>
    </section>

    <section id="journal" class="section">
      <p class="eyebrow">Trade Journal</p>
      <h2>Turn every decision into reviewable data.</h2>
      <div class="grid">
        <article><h3>Entry thesis</h3><p>Capture why the trade exists before execution.</p></article>
        <article><h3>Exit review</h3><p>Record what changed and whether the setup remained valid.</p></article>
        <article><h3>Performance tags</h3><p>Classify trades by setup, risk, outcome, and lesson learned.</p></article>
      </div>
    </section>

    <footer>
      <strong>King Trading System</strong>
      <span>Signals, portfolio intelligence, risk controls, and trading workflow automation.</span>
    </footer>
  </main>
</body>
</html>`,
        },
        {
            file: "styles.css",
            title: "Trading Styles",
            type: "css",
            content: `:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#050816;color:#f7fbff}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,#17366f,#050816 38%,#02030a);color:#f7fbff}.page-shell{width:min(1180px,92vw);margin:auto}.nav{position:sticky;top:18px;z-index:10;margin-top:18px;display:flex;justify-content:space-between;align-items:center;gap:16px;border:1px solid rgba(112,188,255,.25);background:rgba(5,8,22,.82);backdrop-filter:blur(16px);border-radius:24px;padding:16px 20px;box-shadow:0 24px 90px rgba(0,0,0,.34)}.nav div{display:flex;gap:16px}.nav a{color:#c8e7ff;text-decoration:none;font-weight:850}.nav-cta,.primary{background:#2ee6a6!important;color:#03100b!important;border-radius:999px;padding:12px 18px;text-decoration:none;font-weight:950}.hero{padding:115px 0 78px;text-align:center}.eyebrow{margin:0 0 12px;color:#2ee6a6;font-size:.76rem;font-weight:950;letter-spacing:.26em;text-transform:uppercase}.hero h1{max-width:1000px;margin:0 auto;font-size:clamp(3rem,7vw,6.5rem);line-height:.92;letter-spacing:-.075em}.lede{max-width:780px;margin:24px auto;color:#b8c7df;font-size:1.18rem;line-height:1.8}.hero-actions,.hero-proof,.metrics{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:28px}.secondary{border:1px solid rgba(112,188,255,.35);border-radius:999px;padding:12px 18px;color:#c8e7ff;text-decoration:none;font-weight:950}.hero-proof span,.metrics span,.steps span{border:1px solid rgba(112,188,255,.22);background:rgba(255,255,255,.06);border-radius:16px;padding:13px 16px;color:#dbefff;font-weight:850}.section,.split{padding:76px 0}.section h2,.split h2{margin:0 0 24px;font-size:clamp(2rem,4vw,3.8rem);letter-spacing:-.055em}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.grid article,.split{border:1px solid rgba(112,188,255,.18);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.035));border-radius:30px;padding:28px;box-shadow:0 24px 90px rgba(0,0,0,.25)}.grid h3{font-size:1.7rem;margin:0 0 10px}.grid p,.split span,footer{color:#b8c7df;line-height:1.7}.split{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px}.steps{display:grid;gap:12px}footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid rgba(112,188,255,.18);padding:34px 0 54px}@media(max-width:820px){.nav,.nav div,footer{display:grid}.grid,.split{grid-template-columns:1fr}.hero{text-align:left}.hero-actions,.hero-proof,.metrics{justify-content:flex-start}}`,
        },
        {
            file: "metadata.json",
            title: "Runtime Metadata",
            type: "json",
            content: JSON.stringify({
                projectId: run.projectId,
                runtimeId: run.runtimeId,
                mode: "trading",
                product: "King Trading System",
                title: "King Trading System AI Market Command Center",
                generatedAt: now,
                engine: "sovereign-runtime",
            }, null, 2),
        },
        {
            file: "package.json",
            title: "Package Manifest",
            type: "json",
            content: `{
  "name": "king-trading-system",
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
            title: "Trading App Page",
            content: `import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { SignalReview } from "../components/SignalReview";
import { PortfolioTracker } from "../components/PortfolioTracker";
import { RiskControls } from "../components/RiskControls";
import { TradeJournal } from "../components/TradeJournal";
import { BrokerSetup } from "../components/BrokerSetup";
import { Footer } from "../components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <SignalReview />
      <PortfolioTracker />
      <RiskControls />
      <TradeJournal />
      <BrokerSetup />
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
  title: "King Trading System | AI Market Command Center",
  description: "AI trading platform with signals, portfolio tracking, broker setup, risk controls, and trade journal workflows.",
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
    <nav className="mx-auto mt-5 flex w-[min(1160px,92vw)] items-center justify-between rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-4 shadow-2xl backdrop-blur">
      <strong className="text-xl">King Trading System</strong>
      <div className="hidden gap-5 text-sm font-bold text-cyan-100 md:flex">
        <a href="#signals">Signals</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#risk">Risk</a>
        <a href="#journal">Journal</a>
      </div>
      <a href="#signals" className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950">Open Command Center</a>
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
    <section className="mx-auto grid w-[min(1160px,92vw)] gap-8 py-24 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">AI market command center</p>
      <h1 className="mx-auto max-w-5xl text-6xl font-black tracking-[-0.075em] md:text-8xl">
        Predict, monitor, and manage trades from one sovereign dashboard.
      </h1>
      <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-300">
        Review AI signals, track portfolio exposure, enforce risk rules, prepare broker workflows, and log every trade decision.
      </p>
    </section>
  );
}
`,
        },
        {
            file: "components/SignalReview.tsx",
            title: "Signal Review",
            content: `const signals = [
  ["AAPL", "Bullish", "82%", "Momentum improving. Wait for volume confirmation."],
  ["NVDA", "Watch", "78%", "Trend strong. Monitor resistance and position size."],
  ["SPY", "Filter", "71%", "Broad market regime check before risk-on entries."]
];

export function SignalReview() {
  return (
    <section id="signals" className="mx-auto grid w-[min(1160px,92vw)] gap-6 py-20">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Signal Review</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.055em]">Ranked market ideas with context.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {signals.map(([ticker, bias, confidence, note]) => (
          <article key={ticker} className="rounded-3xl border border-cyan-300/20 bg-white/5 p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">{bias}</p>
            <h3 className="mt-3 text-4xl font-black">{ticker}</h3>
            <p className="mt-2 text-emerald-300">Confidence {confidence}</p>
            <p className="mt-3 leading-7 text-slate-300">{note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`,
        },
        {
            file: "components/PortfolioTracker.tsx",
            title: "Portfolio Tracker",
            content: `export function PortfolioTracker() {
  return (
    <section id="portfolio" className="mx-auto grid w-[min(1160px,92vw)] gap-4 py-20 md:grid-cols-4">
      {[
        ["Equity Exposure", "62%"],
        ["Cash Buffer", "38%"],
        ["Risk Per Trade", "1.5%"],
        ["Open Positions", "4"]
      ].map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-cyan-300/20 bg-white/5 p-6">
          <p className="text-sm text-slate-300">{label}</p>
          <h3 className="mt-2 text-4xl font-black text-white">{value}</h3>
        </article>
      ))}
    </section>
  );
}
`,
        },
        {
            file: "components/RiskControls.tsx",
            title: "Risk Controls",
            content: `export function RiskControls() {
  return (
    <section id="risk" className="mx-auto grid w-[min(1160px,92vw)] gap-6 rounded-[2rem] border border-cyan-300/20 bg-white/5 p-8 md:grid-cols-2">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Risk Controls</p>
        <h2 className="mt-3 text-5xl font-black tracking-[-0.055em]">Guardrails before execution.</h2>
      </div>
      <div className="grid gap-3">
        {["Confirm market regime", "Validate signal confidence", "Calculate position size", "Log thesis before entry"].map((item) => (
          <span key={item} className="rounded-2xl border border-cyan-300/20 bg-slate-950/60 p-4 font-bold text-slate-200">{item}</span>
        ))}
      </div>
    </section>
  );
}
`,
        },
        {
            file: "components/TradeJournal.tsx",
            title: "Trade Journal",
            content: `export function TradeJournal() {
  return (
    <section id="journal" className="mx-auto grid w-[min(1160px,92vw)] gap-4 py-20 md:grid-cols-3">
      {[
        ["Entry thesis", "Capture setup logic before a position is opened."],
        ["Exit review", "Record what changed and whether the setup remained valid."],
        ["Performance tags", "Classify trades by setup, risk, outcome, and lesson learned."]
      ].map(([title, copy]) => (
        <article key={title} className="rounded-3xl border border-cyan-300/20 bg-white/5 p-6">
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="mt-3 leading-7 text-slate-300">{copy}</p>
        </article>
      ))}
    </section>
  );
}
`,
        },
        {
            file: "components/BrokerSetup.tsx",
            title: "Broker Setup",
            content: `export function BrokerSetup() {
  return (
    <section className="mx-auto w-[min(1160px,92vw)] rounded-[2rem] border border-cyan-300/20 bg-white/5 p-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Broker Ready</p>
      <h2 className="mt-3 text-5xl font-black tracking-[-0.055em]">Prepared for paper trading and broker configuration.</h2>
      <p className="mt-4 max-w-3xl leading-8 text-slate-300">Environment variables are included for broker keys, market data providers, and paper trading mode.</p>
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
    <footer className="mx-auto flex w-[min(1160px,92vw)] justify-between border-t border-cyan-300/20 py-10 text-slate-300">
      <strong className="text-white">King Trading System</strong>
      <span>AI signals, portfolio intelligence, risk controls, and trade workflow automation.</span>
    </footer>
  );
}
`,
        },
        {
            file: "app/admin/page.tsx",
            title: "Trading Admin Command Center",
            content: `export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">Admin</p>
      <h1 className="mt-4 text-5xl font-black">Trading Command Center</h1>
      <p className="mt-4 text-slate-300">Review signals, provider health, broker configuration, portfolio exposure, and risk-control events.</p>
    </main>
  );
}
`,
        },
        {
            file: "app/api/signals/route.ts",
            title: "Signals API",
            content: `import { NextResponse } from "next/server";

const signals = [
  { ticker: "AAPL", bias: "bullish", confidence: 82, note: "Momentum improving. Confirm volume." },
  { ticker: "NVDA", bias: "watch", confidence: 78, note: "Trend strong. Watch resistance." },
  { ticker: "SPY", bias: "filter", confidence: 71, note: "Market regime filter." }
];

export async function GET() {
  return NextResponse.json({ signals });
}
`,
        },
        {
            file: "app/api/trades/route.ts",
            title: "Trades API",
            content: `import { NextResponse } from "next/server";

const trades: any[] = [];

export async function GET() {
  return NextResponse.json({ trades });
}

export async function POST(request: Request) {
  const body = await request.json();
  const trade = {
    id: "TRADE-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "journaled",
    createdAt: new Date().toISOString(),
    ...body,
  };
  trades.push(trade);
  return NextResponse.json({ trade }, { status: 201 });
}
`,
        },
        {
            file: "lib/trading-store.ts",
            title: "Trading Store",
            content: `export type TradingSignal = {
  ticker: string;
  bias: string;
  confidence: number;
  note: string;
};

export type TradeJournalEntry = {
  id: string;
  ticker: string;
  direction: "long" | "short";
  thesis: string;
  riskPercent: number;
  status: "planned" | "open" | "closed";
};

export const demoSignals: TradingSignal[] = [];
export const demoTrades: TradeJournalEntry[] = [];
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

model TradingSignal {
  id          String   @id @default(cuid())
  ticker      String
  bias        String
  confidence  Int
  note        String?
  createdAt   DateTime @default(now())
}

model TradeJournalEntry {
  id          String   @id @default(cuid())
  ticker      String
  direction   String
  thesis      String
  riskPercent Float
  status      String   @default("planned")
  createdAt   DateTime @default(now())
}
`,
        },
        {
            file: ".env.example",
            title: "Environment Template",
            type: "env",
            content: `DATABASE_URL="postgresql://user:password@localhost:5432/king_trading"
BROKER_PROVIDER="paper"
ALPACA_API_KEY=""
ALPACA_SECRET_KEY=""
MARKET_DATA_PROVIDER="demo"
TRADING_MODE="paper"
MAX_RISK_PER_TRADE="1.5"
`,
        },
        {
            file: "README.md",
            title: "Delivery README",
            type: "markdown",
            content: `# King Trading System

Prompt-led AI trading platform package with signal review, portfolio tracker, risk controls, trade journal, broker setup, API routes, Prisma schema, and deployment files.

## Included
- Trading command center homepage
- Signal review
- Portfolio tracker
- Risk controls
- Trade journal
- Broker setup
- Admin command center
- Signals API
- Trades API
- Prisma trading schema
- Smoke test
- Docker files

## Local setup
\`\`\`bash
npm install
npm run build
npm run dev
\`\`\`

## Safety note
This package is software infrastructure and workflow automation. It does not provide financial advice or guarantee trading performance.
`,
        },
        {
            file: "scripts/smoke-test.ts",
            title: "Smoke Test Script",
            content: `console.log("King Trading System package smoke test ready.");
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
    for (const file of files) {
        writeFile(outDir, file.file, file.content);
    }
    return files.map((file) => artifact(outDir, file.file, file.title, file.type || "typescript"));
}
