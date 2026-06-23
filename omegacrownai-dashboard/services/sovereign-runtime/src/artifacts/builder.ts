import fs from "fs";
import path from "path";
import { buildSaasLandingArtifacts, isSaasLandingPrompt } from "./saas-landing-builder.js";
import { buildLegalFirmArtifacts, isLegalFirmPrompt } from "./legal-firm-builder.js";
import { buildTradingPlatformArtifacts, isTradingPlatformPrompt } from "./trading-platform-builder.js";
import { buildRestaurantPlatformArtifacts, isRestaurantPlatformPrompt } from "./restaurant-platform-builder.js";
import { buildUniversalAnythingArtifacts, isUniversalAnythingPrompt } from "./universal-anything-builder.js";
import { buildFinancePlatformArtifacts, isFinancePlatformPrompt } from "./finance-platform-builder.js";



function ensureSmokeTestFileOnDisk(outDir: string) {
  const scriptsDir = path.join(outDir, "scripts");
  const smokeFile = path.join(scriptsDir, "smoke-test.mjs");
  const fullstackSmokeFile = path.join(scriptsDir, "fullstack-smoke.mjs");

  if (fs.existsSync(smokeFile) || fs.existsSync(fullstackSmokeFile)) {
    return;
  }

  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.writeFileSync(smokeFile, `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = ["index.html", "metadata.json", "README.md"];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error("Missing required file: " + file);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const refs = Array.from(html.matchAll(/(?:src|href)=["']([^"']+\\.(?:svg|png|jpg|jpeg|webp|gif|json|css|js))["']/gi)).map((match) => match[1]);

for (const ref of refs) {
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:") || ref.startsWith("#")) continue;

  const normalized = ref
    .replace(/^\\/runtime-preview\\/[^/]+\\//, "")
    .replace(/^\\.\\//, "")
    .replace(/^\\/+/, "");

  if (!fs.existsSync(path.join(root, normalized))) {
    throw new Error("Missing referenced asset: " + ref + " -> " + normalized);
  }
}

const manifestPath = path.join(root, "data", "asset-manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];

  for (const asset of assets) {
    if (!asset || typeof asset.file !== "string") continue;

    const normalized = asset.file
      .replace(/^\\/runtime-preview\\/[^/]+\\//, "")
      .replace(/^\\.\\//, "")
      .replace(/^\\/+/, "");

    if (!fs.existsSync(path.join(root, normalized))) {
      throw new Error("Missing manifest asset: " + asset.file + " -> " + normalized);
    }
  }
}

console.log("Generated artifact smoke test passed");`);
}

function ensureArtifactSmokeTest(artifacts: any[]) {
  const hasSmoke = artifacts.some((artifact) => artifact.file === "scripts/smoke-test.mjs" || artifact.file === "scripts/fullstack-smoke.mjs");
  if (hasSmoke) return artifacts;

  artifacts.push({
    file: "scripts/smoke-test.mjs",
    title: "Generated Artifact Smoke Test",
    type: "javascript",
    content: `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = ["index.html", "metadata.json", "README.md"];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error("Missing required file: " + file);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const refs = Array.from(
  html.matchAll(/(?:src|href)=["']([^"']+\\.(?:svg|png|jpg|jpeg|webp|gif|json|css|js))["']/gi)
).map((match) => match[1]);

for (const ref of refs) {
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:") || ref.startsWith("#")) {
    continue;
  }

  const normalized = ref
    .replace(/^\\/runtime-preview\\/[^/]+\\//, "")
    .replace(/^\\.\\//, "")
    .replace(/^\\/+/, "");

  if (!fs.existsSync(path.join(root, normalized))) {
    throw new Error("Missing referenced asset: " + ref + " -> " + normalized);
  }
}

if (fs.existsSync(path.join(root, "data", "asset-manifest.json"))) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "data", "asset-manifest.json"), "utf8"));
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  for (const asset of assets) {
    if (!asset || typeof asset.file !== "string") continue;
    const normalized = asset.file
      .replace(/^\\/runtime-preview\\/[^/]+\\//, "")
      .replace(/^\\.\\//, "")
      .replace(/^\\/+/, "");
    if (!fs.existsSync(path.join(root, normalized))) {
      throw new Error("Missing manifest asset: " + asset.file + " -> " + normalized);
    }
  }
}

console.log("Generated artifact smoke test passed");`
  });

  const packageArtifact = artifacts.find((artifact) => artifact.file === "package.json");
  if (packageArtifact?.content && !packageArtifact.content.includes('"smoke"')) {
    try {
      const pkg = JSON.parse(packageArtifact.content);
      pkg.scripts = {
        smoke: "node scripts/smoke-test.mjs",
        ...(pkg.scripts || {})
      };
      packageArtifact.content = JSON.stringify(pkg, null, 2);
    } catch {
      // Leave non-JSON package artifacts untouched; the smoke file still exists.
    }
  }

  return ensureArtifactSmokeTest(artifacts);
}


function write(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function isTransportPrompt(prompt: string) {
  const source = String(prompt || "").toLowerCase();
  return [
    "limo",
    "limousine",
    "black car",
    "chauffeur",
    "airport transfer",
    "airport pickup",
    "airport transportation",
    "fleet",
    "ride booking",
    "transportation company",
    "sedan service",
    "executive suv",
    "o'hare",
    "ord airport",
    "midway airport"
  ].some((term) => source.includes(term));
}

function slug(text: string) {
  return String(text || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
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

function hasAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term));
}

function detectPromptMode(prompt: string, fallbackMode: string) {
  const source = positivePromptSource(prompt);

  if (hasAny(source, ["stock", "trading", "trade", "portfolio", "broker", "alpaca", "watchlist", "signal", "scanner", "forecast", "market", "risk controls"])) {
    return "trading";
  }

  if (hasAny(source, ["restaurant", "menu", "ordering", "food", "kitchen", "reservation", "dining", "chef", "cart", "checkout"])) {
    return "restaurant";
  }

  if (hasAny(source, ["law firm", "legal", "attorney", "lawyer", "case intake", "consultation", "practice area", "case inquiry"])) {
    return "legal";
  }

  if (hasAny(source, ["shop", "store", "ecommerce", "e-commerce", "product catalog", "cart", "checkout", "inventory", "fulfillment"])) {
    return "ecommerce";
  }

  if (hasAny(source, ["transport", "black car", "airport transfer", "limo", "chauffeur", "ride booking", "fleet dispatch", "limousine"])) {
    return "transport";
  }

  return fallbackMode || "website";
}

function profileName(mode: string) {
  return String(mode || "Production")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function domainProfile(mode: string) {
  const profiles: Record<string, any> = {
    trading: {
      navPrimary: "Signals",
      navSecondary: "Portfolio",
      navTertiary: "Risk",
      cta: "Open Trading Desk",
      heroPrimary: "Review Market Engine",
      heroSecondary: "View Signals",
      featureTitle: "Trading Intelligence Modules",
      featureFile: "components/TradingIntelligence.tsx",
      featureComponent: "TradingIntelligence",
      actionTitle: "Trading Strategy Intake Component",
      actionFile: "components/TradingStrategyForm.tsx",
      actionComponent: "TradingStrategyForm",
      actionHeading: "Configure market strategy",
      actionDescription: "Capture symbols, timeframe, risk limits, portfolio rules, broker provider, watchlist, and signal preferences.",
      areaTitle: "Trading Coverage",
      areaHeading: "Signals, watchlists, portfolio analysis, risk controls, broker readiness, journaling, and forecast quality checks",
      testimonialTitle: "Built for disciplined market operators",
      adminTitle: "Trading Command Center",
      leadModel: "TradingStrategyLead",
      leadFile: "trading-strategy-leads.json",
      notificationEnv: "TRADING_NOTIFICATION_EMAIL",
      smokeService: "Trading Strategy",
      modeItemOne: "Signal Scanner",
      modeItemTwo: "Portfolio Risk",
      modeItemThree: "Broker Readiness",
    },
    restaurant: {
      navPrimary: "Menu",
      navSecondary: "Orders",
      navTertiary: "Kitchen",
      cta: "Start Order",
      heroPrimary: "Review Ordering Flow",
      heroSecondary: "View Menu",
      featureTitle: "Restaurant Ordering Modules",
      featureFile: "components/MenuSections.tsx",
      featureComponent: "MenuSections",
      actionTitle: "Order Intake Component",
      actionFile: "components/OrderForm.tsx",
      actionComponent: "OrderForm",
      actionHeading: "Create an order",
      actionDescription: "Capture menu items, customer details, pickup or delivery preference, payment readiness, and kitchen notes.",
      areaTitle: "Restaurant Operations",
      areaHeading: "Menu, cart, checkout, kitchen queue, reservations, inventory, customer records, and order notifications",
      testimonialTitle: "Built for fast restaurant operations",
      adminTitle: "Restaurant Operations Dashboard",
      leadModel: "RestaurantOrderLead",
      leadFile: "restaurant-order-leads.json",
      notificationEnv: "RESTAURANT_NOTIFICATION_EMAIL",
      smokeService: "Restaurant Order",
      modeItemOne: "Menu Catalog",
      modeItemTwo: "Kitchen Queue",
      modeItemThree: "Order Checkout",
    },
    legal: {
      navPrimary: "Practice Areas",
      navSecondary: "Consultations",
      navTertiary: "Intake",
      cta: "Request Consultation",
      heroPrimary: "Review Intake Flow",
      heroSecondary: "View Practice Areas",
      featureTitle: "Legal Practice Modules",
      featureFile: "components/PracticeAreas.tsx",
      featureComponent: "PracticeAreas",
      actionTitle: "Consultation Intake Component",
      actionFile: "components/ConsultationForm.tsx",
      actionComponent: "ConsultationForm",
      actionHeading: "Request legal consultation",
      actionDescription: "Capture matter type, client contact, urgency, consultation notes, conflicts-check readiness, and follow-up workflow.",
      areaTitle: "Legal Operations",
      areaHeading: "Practice areas, attorney profiles, consultation intake, case notes, client portal, admin review, and secure follow-up",
      testimonialTitle: "Built for professional client trust",
      adminTitle: "Legal Intake Dashboard",
      leadModel: "LegalConsultationLead",
      leadFile: "legal-consultation-leads.json",
      notificationEnv: "LEGAL_NOTIFICATION_EMAIL",
      smokeService: "Legal Consultation",
      modeItemOne: "Practice Areas",
      modeItemTwo: "Consultation Intake",
      modeItemThree: "Case Review Queue",
    },
    ecommerce: {
      navPrimary: "Catalog",
      navSecondary: "Cart",
      navTertiary: "Orders",
      cta: "Shop Products",
      heroPrimary: "Review Storefront",
      heroSecondary: "View Catalog",
      featureTitle: "Storefront Commerce Modules",
      featureFile: "components/ProductCatalog.tsx",
      featureComponent: "ProductCatalog",
      actionTitle: "Checkout Component",
      actionFile: "components/CheckoutForm.tsx",
      actionComponent: "CheckoutForm",
      actionHeading: "Start checkout",
      actionDescription: "Capture cart items, customer details, payment readiness, inventory status, and fulfillment notes.",
      areaTitle: "Commerce Operations",
      areaHeading: "Product catalog, cart, checkout, inventory, orders, customer accounts, fulfillment, and admin reporting",
      testimonialTitle: "Built for conversion-ready commerce",
      adminTitle: "Ecommerce Operations Dashboard",
      leadModel: "StoreOrderLead",
      leadFile: "store-order-leads.json",
      notificationEnv: "STORE_NOTIFICATION_EMAIL",
      smokeService: "Store Order",
      modeItemOne: "Product Catalog",
      modeItemTwo: "Checkout Flow",
      modeItemThree: "Order Fulfillment",
    },
  };

  return profiles[mode] || {};
}


function modeProfile(mode: string, prompt: string, isTransport: boolean) {
  if (isTransport) {
    return {
      navPrimary: "Fleet",
      navSecondary: "Service Area",
      navTertiary: "Reviews",
      cta: "Reserve Black Car",
      heroPrimary: "Reserve Black Car",
      heroSecondary: "View Fleet",
      featureTitle: "Executive Fleet",
      featureFile: "components/Fleet.tsx",
      featureComponent: "Fleet",
      actionTitle: "Booking Form Component",
      actionFile: "components/BookingForm.tsx",
      actionComponent: "BookingForm",
      actionHeading: "Reserve Your Ride",
      actionDescription: "Request an executive ride with pickup, drop-off, schedule, contact details, quote, booking, and payment intent readiness.",
      areaTitle: "Service Area",
      areaHeading: "O Hare airport, Midway, downtown Chicago, suburbs, hotels, events, and executive travel coverage.",
      testimonialTitle: "Trusted by executives, families, and airport travelers",
      adminTitle: "Transportation Admin Command Center",
      leadModel: "BookingLead",
      leadFile: "booking-leads.json",
      notificationEnv: "ADMIN_NOTIFICATION_EMAIL",
      smokeService: "Airport Transfer",
    };
  }

  const profiles: Record<string, any> = {
    website: {
      navPrimary: "Pages",
      navSecondary: "Launch",
      navTertiary: "Trust",
      cta: "Start Launch",
      heroPrimary: "Review Site Plan",
      heroSecondary: "View Sections",
      featureTitle: "Website Sections",
      featureFile: "components/Sections.tsx",
      featureComponent: "Sections",
      actionTitle: "Lead Capture Component",
      actionFile: "components/LeadCaptureForm.tsx",
      actionComponent: "LeadCaptureForm",
      actionHeading: "Capture launch-ready leads",
      actionDescription: "Collect customer interest, project goals, timeline, and contact details.",
      areaTitle: "Launch Coverage",
      areaHeading: "Pages, copy, conversion sections, SEO basics, and launch checklist",
      testimonialTitle: "Built for customer trust",
      adminTitle: "Website Launch Dashboard",
      leadModel: "WebsiteLead",
      leadFile: "website-leads.json",
      notificationEnv: "LEAD_NOTIFICATION_EMAIL",
      smokeService: "Website Launch",
      modeItemOne: "Homepage Sections",
      modeItemTwo: "Lead Capture",
      modeItemThree: "Launch Checklist",
    },
    app: {
      navPrimary: "Dashboard",
      navSecondary: "Users",
      navTertiary: "Analytics",
      cta: "Open Dashboard",
      heroPrimary: "Review App Plan",
      heroSecondary: "View Modules",
      featureTitle: "Dashboard Modules",
      featureFile: "components/DashboardModules.tsx",
      featureComponent: "DashboardModules",
      actionTitle: "Onboarding Component",
      actionFile: "components/OnboardingForm.tsx",
      actionComponent: "OnboardingForm",
      actionHeading: "Create your SaaS workspace",
      actionDescription: "Capture user onboarding, workspace setup, role, billing readiness, and product goals.",
      areaTitle: "Application Modules",
      areaHeading: "Dashboard, onboarding, analytics, admin, settings, and launch support",
      testimonialTitle: "Designed for SaaS delivery",
      adminTitle: "SaaS Operations Dashboard",
      leadModel: "WorkspaceLead",
      leadFile: "workspace-leads.json",
      notificationEnv: "WORKSPACE_NOTIFICATION_EMAIL",
      smokeService: "SaaS Workspace",
      modeItemOne: "Dashboard",
      modeItemTwo: "Analytics",
      modeItemThree: "Billing Readiness",
    },
    automation: {
      navPrimary: "Workflows",
      navSecondary: "Agents",
      navTertiary: "Audit",
      cta: "Run Workflow",
      heroPrimary: "Review Workflow",
      heroSecondary: "View Agents",
      featureTitle: "Automation Workflows",
      featureFile: "components/WorkflowMap.tsx",
      featureComponent: "WorkflowMap",
      actionTitle: "Workflow Intake Component",
      actionFile: "components/WorkflowIntakeForm.tsx",
      actionComponent: "WorkflowIntakeForm",
      actionHeading: "Define your automation workflow",
      actionDescription: "Capture triggers, actions, owners, systems, approval steps, and success criteria.",
      areaTitle: "Automation Scope",
      areaHeading: "Triggers, agents, actions, schedules, approval paths, and audit logs",
      testimonialTitle: "Built for repeatable operations",
      adminTitle: "Automation Control Dashboard",
      leadModel: "WorkflowLead",
      leadFile: "workflow-leads.json",
      notificationEnv: "WORKFLOW_NOTIFICATION_EMAIL",
      smokeService: "Workflow Automation",
      modeItemOne: "Trigger Map",
      modeItemTwo: "Agent Workflow",
      modeItemThree: "Audit Log",
    },
    marketing: {
      navPrimary: "Campaigns",
      navSecondary: "Funnels",
      navTertiary: "Content",
      cta: "Launch Campaign",
      heroPrimary: "Review Campaign",
      heroSecondary: "View Funnel",
      featureTitle: "Campaign Assets",
      featureFile: "components/CampaignAssets.tsx",
      featureComponent: "CampaignAssets",
      actionTitle: "Campaign Brief Component",
      actionFile: "components/CampaignBriefForm.tsx",
      actionComponent: "CampaignBriefForm",
      actionHeading: "Build your campaign brief",
      actionDescription: "Capture offer, audience, channel, budget, creative angle, and launch goals.",
      areaTitle: "Marketing Channels",
      areaHeading: "Ads, funnels, social calendar, email sequences, creative assets, and analytics",
      testimonialTitle: "Built for campaign momentum",
      adminTitle: "Marketing Campaign Dashboard",
      leadModel: "CampaignLead",
      leadFile: "campaign-leads.json",
      notificationEnv: "CAMPAIGN_NOTIFICATION_EMAIL",
      smokeService: "Campaign Launch",
      modeItemOne: "Campaign Funnel",
      modeItemTwo: "Ad Creative",
      modeItemThree: "Social Calendar",
    },
    video: {
      navPrimary: "Storyboard",
      navSecondary: "Scenes",
      navTertiary: "Render",
      cta: "Build Video",
      heroPrimary: "Review Storyboard",
      heroSecondary: "View Scenes",
      featureTitle: "Video Production Plan",
      featureFile: "components/Storyboard.tsx",
      featureComponent: "Storyboard",
      actionTitle: "Video Brief Component",
      actionFile: "components/VideoBriefForm.tsx",
      actionComponent: "VideoBriefForm",
      actionHeading: "Create your video production brief",
      actionDescription: "Capture concept, scenes, narration, music direction, visual style, and render requirements.",
      areaTitle: "Production Scope",
      areaHeading: "Storyboard, script, shot list, voiceover, music, render checklist, and launch assets",
      testimonialTitle: "Designed for cinematic delivery",
      adminTitle: "Video Production Dashboard",
      leadModel: "VideoBrief",
      leadFile: "video-briefs.json",
      notificationEnv: "VIDEO_NOTIFICATION_EMAIL",
      smokeService: "Video Production",
      modeItemOne: "Storyboard",
      modeItemTwo: "Shot List",
      modeItemThree: "Render Checklist",
    },
    podcast: {
      navPrimary: "Episodes",
      navSecondary: "Voices",
      navTertiary: "Distribution",
      cta: "Build Episode",
      heroPrimary: "Review Episode",
      heroSecondary: "View Show Plan",
      featureTitle: "Podcast Episode Plan",
      featureFile: "components/EpisodePlan.tsx",
      featureComponent: "EpisodePlan",
      actionTitle: "Podcast Brief Component",
      actionFile: "components/PodcastBriefForm.tsx",
      actionComponent: "PodcastBriefForm",
      actionHeading: "Create your podcast production brief",
      actionDescription: "Capture topic, speakers, tone, episode structure, show notes, and distribution goals.",
      areaTitle: "Podcast Production",
      areaHeading: "Episode outline, script, speaker plan, show notes, intro/outro, and publishing checklist",
      testimonialTitle: "Built for polished audio shows",
      adminTitle: "Podcast Production Dashboard",
      leadModel: "PodcastBrief",
      leadFile: "podcast-briefs.json",
      notificationEnv: "PODCAST_NOTIFICATION_EMAIL",
      smokeService: "Podcast Episode",
      modeItemOne: "Episode Outline",
      modeItemTwo: "Speaker Plan",
      modeItemThree: "Show Notes",
    },
    music: {
      navPrimary: "Composition",
      navSecondary: "Stems",
      navTertiary: "Licensing",
      cta: "Build Soundtrack",
      heroPrimary: "Review Composition",
      heroSecondary: "View Cue Sheet",
      featureTitle: "Music Production Plan",
      featureFile: "components/CompositionPlan.tsx",
      featureComponent: "CompositionPlan",
      actionTitle: "Music Brief Component",
      actionFile: "components/MusicBriefForm.tsx",
      actionComponent: "MusicBriefForm",
      actionHeading: "Create your music production brief",
      actionDescription: "Capture mood, tempo, instrumentation, brand tone, cue points, stems, and licensing needs.",
      areaTitle: "Music Production",
      areaHeading: "Composition brief, cue sheet, stems plan, brand audio, licensing checklist, and delivery assets",
      testimonialTitle: "Built for cinematic sound",
      adminTitle: "Music Production Dashboard",
      leadModel: "MusicBrief",
      leadFile: "music-briefs.json",
      notificationEnv: "MUSIC_NOTIFICATION_EMAIL",
      smokeService: "Music Production",
      modeItemOne: "Composition Brief",
      modeItemTwo: "Cue Sheet",
      modeItemThree: "Stems and Licensing",
    },
  };

  return profiles[mode] || profiles.website;
}

export async function buildArtifacts(run: any) {
  const outDir = path.join(process.cwd(), "data", "artifacts", run.projectId);

  // Ensure regenerated projects do not keep stale files from older artifact schemas.
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  if (isSaasLandingPrompt(run.prompt || "")) {
    return buildSaasLandingArtifacts(run, outDir);
  }

  if (isLegalFirmPrompt(run.prompt || "")) {
    return buildLegalFirmArtifacts(run, outDir);
  }

  if (isTradingPlatformPrompt(run.prompt || "")) {
    return buildTradingPlatformArtifacts(run, outDir);
  }

  if (isRestaurantPlatformPrompt(run.prompt || "")) {
    return buildRestaurantPlatformArtifacts(run, outDir);
  }

  if (isFinancePlatformPrompt(run.prompt || "")) {
    return buildFinancePlatformArtifacts(run);
  }

  if (isUniversalAnythingPrompt(run.prompt || "") && !isTransportPrompt(run.prompt || "")) {
    return buildUniversalAnythingArtifacts(run, outDir);
  }

  const projectName = slug(run.prompt);
  const requestedMode = run.mode || "website";
  const mode = detectPromptMode(run.prompt || "", requestedMode);
  const isTransport = mode === "transport";

  const baseProfile = modeProfile(mode, run.prompt || "", isTransport);
  const profile = { ...baseProfile, ...domainProfile(mode) };

  const companyName = isTransport
    ? "Princess Benjamin Transportation Company"
    : `OmegaCrownAI ${profileName(mode)} Build`;

  const companyWebsite = isTransport ? "https://pbtlimo.com" : "";
  const primaryPhone = isTransport ? "+1 (773) 510-1467" : "";
  const secondaryPhone = isTransport ? "(224) 224-0263" : "";
  const tagline = isTransport ? "Your journey, our royal priority." : profile.areaHeading;
  const featureImportPath = "../" + String(profile.featureFile).replace(/\.tsx$/, "");
  const actionImportPath = "../" + String(profile.actionFile).replace(/\.tsx$/, "");

  const files = [
    {
      type: "html",
      title: "Production Landing Page",
      file: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${companyName} | ${profile.adminTitle}</title>
  <meta name="description" content="${isTransport ? "Premium airport transfer, black car, chauffeur, and executive transportation website preview generated by OmegaCrownAI." : "Production-ready generated artifact preview from OmegaCrownAI."}" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="site-shell">
    <nav class="topbar">
      <div>
        <p class="eyebrow">${mode} prompt-directed artifact</p>
        <strong>${companyName}</strong>
      </div>
      <div class="nav-actions">
        <a href="#action">${profile.cta}</a>
        <a href="#modules">${profile.navPrimary}</a>
        <a href="#delivery">Delivery</a>
      </div>
    </nav>

    <section class="${isTransport ? "hero hero-transport" : "hero"}">
      <div class="hero-copy">
        <p class="eyebrow">${isTransport ? "Chicago airport black car service" : "Production package"}</p>
        <h1>${isTransport ? "Premium limo booking website for Chicago airport and executive travel" : "Production-ready generated application package"}</h1>
        <p class="lede">
          ${isTransport
            ? "A production-grade limo website package with quote flow, booking intake, payment intent scaffold, customer portal, admin dispatch views, fleet management, and deployment-ready artifacts."
            : "A production-ready generated application package with runtime validation, preview, delivery, and export support."}
        </p>
        <div class="hero-actions">
          <a class="primary" href="#action">${profile.heroPrimary}</a>
          <a class="secondary" href="#modules">${profile.heroSecondary}</a>
        </div>
      </div>

      <aside class="quote-card" id="action">
        <p class="eyebrow">Live flow preview</p>
        <h2>${profile.actionHeading}</h2>
        <p>${profile.actionDescription}</p>
        <div class="quote-grid">
            ${isTransport
              ? "<span>Pickup: ORD Airport</span><span>Drop-off: Downtown Chicago</span><span>Vehicle: Luxury SUV</span><span>Status: Quote → Booking → Payment intent</span>"
              : `<span>Workflow: ${profile.smokeService}</span><span>Module: ${profile.modeItemOne}</span><span>Admin: ${profile.adminTitle}</span><span>Status: Intake → Review → Delivery</span>`}
          </div>
      </aside>
    </section>

    <section class="trust-strip">
        ${isTransport
          ? "<span>Airport Transfers</span><span>Corporate Travel</span><span>Hourly Chauffeur</span><span>Customer Portal</span><span>Admin Dispatch</span>"
          : `<span>${profile.modeItemOne}</span><span>${profile.modeItemTwo}</span><span>${profile.modeItemThree}</span><span>${profile.navSecondary}</span><span>${profile.navTertiary}</span>`}
      </section>

    <section id="modules" class="module-layout">
      <div class="section-heading">
        <p class="eyebrow">${profile.featureTitle}</p>
        <h2>${isTransport ? "Fleet, service, and dispatch tools generated together" : profile.areaHeading}</h2>
      </div>
      <div class="module-grid">
        <article>
          <h3>${profile.modeItemOne}</h3>
          <p>${isTransport ? "Executive sedan experience for airport transfers, business meetings, and individual premium travel." : "Primary module generated from the requested prompt and domain workflow."}</p>
        </article>
        <article>
          <h3>${profile.modeItemTwo}</h3>
          <p>${isTransport ? "Spacious luxury SUV readiness for families, VIP guests, luggage-heavy airport rides, and corporate clients." : "Operational module for records, users, review flows, and admin visibility."}</p>
        </article>
        <article>
          <h3>${profile.modeItemThree}</h3>
          <p>${isTransport ? "Hourly chauffeur and event transportation workflows with admin dispatch and customer-facing booking support." : "Delivery module for validation, reporting, exports, and launch readiness."}</p>
        </article>
      </div>
    </section>

    <section id="service-area" class="split-panel">
      <div>
        <p class="eyebrow">Service coverage</p>
        <h2>${profile.areaHeading}</h2>
      </div>
      <div class="service-list">
          ${isTransport
            ? "<span>ORD / O Hare</span><span>Midway</span><span>Downtown Chicago</span><span>North Shore</span><span>Arlington Heights</span><span>Hotels & events</span>"
            : `<span>${profile.navPrimary}</span><span>${profile.navSecondary}</span><span>${profile.navTertiary}</span><span>${profile.modeItemOne}</span><span>${profile.modeItemTwo}</span><span>${profile.modeItemThree}</span>`}
        </div>
    </section>

    <section class="ops-grid">
        <article>
          <p class="eyebrow">${isTransport ? "Customer portal" : "User portal"}</p>
          <h3>${isTransport ? "Booking visibility" : profile.modeItemOne}</h3>
          <p>${isTransport ? "Generated customer pages are prepared for ride requests, quote history, invoices, and customer records." : "Generated portal pages are aligned to the requested workflow, records, history, and user-facing actions."}</p>
        </article>
        <article>
          <p class="eyebrow">Admin portal</p>
          <h3>${isTransport ? "Dispatch queue" : profile.modeItemTwo}</h3>
          <p>${isTransport ? "Generated admin pages are prepared for booking review, fleet assignment, customer tracking, and dispatch status." : "Generated admin pages are prepared for review, management, reporting, and operational status."}</p>
        </article>
        <article>
          <p class="eyebrow">Backend</p>
          <h3>${isTransport ? "Quote + payment scaffold" : profile.modeItemThree}</h3>
          <p>${isTransport ? "Generated API routes include quote pricing, booking intake, availability, notifications, and payment intent placeholders." : "Generated API routes include intake, validation, persistence stubs, notifications, and delivery readiness."}</p>
        </article>
      </section>

    <section id="delivery" class="delivery-panel">
      <div>
        <p class="eyebrow">Customer-ready delivery</p>
        <h2>Downloadable full-stack package</h2>
        <p>Includes Next.js app files, API routes, Prisma schema, environment template, Docker files, smoke test, README, deployed preview, and delivery manifest.</p>
      </div>
      <div class="delivery-checks">
        <span>Validation proof ready</span>
        <span>ZIP export ready</span>
        <span>Runtime preview ready</span>
        <span>Deployment record ready</span>
      </div>
    </section>
  </main>
</body>
</html>`
    },
    {
      type: "css",
      title: "Production Stylesheet",
      file: "styles.css",
      content: `* {
  box-sizing: border-box;
}

:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #030303;
  color: #ffffff;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 10%, rgba(248, 113, 113, 0.2), transparent 32rem),
    radial-gradient(circle at 82% 8%, rgba(250, 204, 21, 0.09), transparent 30rem),
    linear-gradient(135deg, #030303 0%, #0a0a0a 45%, #111111 100%);
}

a {
  color: inherit;
  text-decoration: none;
}

.site-shell {
  margin: 0 auto;
  max-width: 1240px;
  padding: 28px;
}

.topbar,
.trust-strip,
.delivery-panel,
.split-panel,
.ops-grid article,
.module-grid article,
.quote-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(12, 12, 14, 0.76);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.topbar {
  position: sticky;
  top: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 24px;
  padding: 18px 22px;
}

.nav-actions {
  display: flex;
  gap: 12px;
  color: #d4d4d8;
  font-size: 0.9rem;
  font-weight: 800;
}

.nav-actions a {
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
}

.eyebrow {
  margin: 0 0 10px;
  color: #fca5a5;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.8fr);
  gap: 24px;
  align-items: stretch;
  padding: 72px 0 28px;
}

.hero-copy {
  min-height: 560px;
  border-radius: 36px;
  padding: 54px;
  background:
    linear-gradient(140deg, rgba(248, 113, 113, 0.16), transparent 46%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero h1 {
  margin: 0;
  max-width: 880px;
  font-size: clamp(3rem, 7vw, 6.8rem);
  line-height: 0.9;
  letter-spacing: -0.08em;
}

.lede {
  max-width: 760px;
  color: #d4d4d8;
  font-size: 1.12rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.primary,
.secondary {
  border-radius: 18px;
  padding: 16px 22px;
  font-weight: 950;
}

.primary {
  background: #f87171;
  color: #050505;
}

.secondary {
  border: 1px solid rgba(255,255,255,0.16);
  color: #ffffff;
}

.quote-card {
  align-self: stretch;
  border-radius: 36px;
  padding: 34px;
}

.quote-card h2,
.section-heading h2,
.split-panel h2,
.delivery-panel h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.7rem);
  letter-spacing: -0.05em;
}

.quote-card p,
.ops-grid p,
.delivery-panel p,
.module-grid p {
  color: #c4c4c7;
  line-height: 1.7;
}

.quote-grid,
.delivery-checks,
.service-list {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.quote-grid span,
.delivery-checks span,
.service-list span {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  padding: 14px;
  color: #f4f4f5;
  font-weight: 800;
}

.trust-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  border-radius: 26px;
  padding: 18px;
}

.trust-strip span {
  color: #fef3c7;
  font-size: 0.82rem;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.module-layout,
.split-panel,
.ops-grid,
.delivery-panel {
  margin-top: 28px;
}

.section-heading {
  padding: 34px 0 20px;
}

.module-grid,
.ops-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.module-grid article,
.ops-grid article {
  min-height: 240px;
  border-radius: 30px;
  padding: 28px;
}

.module-grid h3,
.ops-grid h3 {
  margin: 0;
  font-size: 1.65rem;
}

.split-panel,
.delivery-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
  border-radius: 34px;
  padding: 34px;
}

@media (max-width: 900px) {
  .hero,
  .split-panel,
  .delivery-panel,
  .module-grid,
  .ops-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    min-height: auto;
    padding: 34px;
  }

  .topbar {
    position: static;
    align-items: flex-start;
    flex-direction: column;
  }
}
`
    },
    {
      type: "json",
      title: "Runtime Metadata",
      file: "metadata.json",
      content: JSON.stringify(
        {
          projectId: run.projectId,
          runtimeId: run.runtimeId,
          mode,
          prompt: profile.areaHeading,
          companyName,
          companyWebsite,
          primaryPhone,
          secondaryPhone,
          tagline,
          generatedAt: new Date().toISOString(),
          engine: "sovereign-runtime",
          artifacts: ["index.html", "styles.css", "metadata.json", "README.md", "package.json"]
        },
        null,
        2
      )
    },
    {
      type: "json",
      title: "Package Manifest",
      file: "package.json",
      content: JSON.stringify(
        {
          name: projectName || run.projectId.toLowerCase(),
          version: "1.0.0",
          private: true,
          scripts: {
            preview: "npx serve .",
            dev: "next dev",
            build: "next build",
            start: "next start",
            prisma: "prisma",
            "db:generate": "prisma generate",
            "db:migrate": "prisma migrate dev",
            "db:seed": "tsx prisma/seed.ts",
            smoke: "tsx scripts/smoke-test.ts"
          },
          dependencies: {
            "@prisma/client": "6.19.0",
            "prisma": "6.19.0",
            "@types/node": "latest",
            "@types/react": "latest",
            "@types/react-dom": "latest",
            "autoprefixer": "latest",
            "next": "latest",
            "postcss": "latest",
            "react": "latest",
            "react-dom": "latest",
            "tailwindcss": "latest",
            "typescript": "latest",
            "tsx": "latest"
          }
        },
        null,
        2
      )
    },
    {
      type: "typescript",
      title: "Navbar Component",
      file: "components/Navbar.tsx",
      content: `export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 px-8 py-5 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-6">
        <a href="#" className="mr-auto text-lg font-black">
          ${companyName}
        </a>
        <a href="${isTransport ? "#fleet" : "#modules"}" className="hidden text-sm text-zinc-300 md:block">${profile.navPrimary}</a>
        <a href="#service-area" className="hidden text-sm text-zinc-300 md:block">${profile.navSecondary}</a>
        <a href="#testimonials" className="hidden text-sm text-zinc-300 md:block">${profile.navTertiary}</a>
        <a href="#booking" className="rounded-xl bg-red-400 px-4 py-2 text-sm font-bold text-black">
          ${profile.cta}
        </a>
      </nav>
    </header>
  );
}
`
    },
    {
      type: "typescript",
      title: "Hero Component",
      file: "components/Hero.tsx",
      content: `export function Hero() {
  return (
    <section className="px-8 py-24">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${mode} runtime artifact</p>
      <h1 className="mt-6 max-w-5xl text-6xl font-black leading-none">
        ${run.prompt}
      </h1>
      <p className="mt-6 max-w-3xl text-xl text-zinc-300">
        ${isTransport
          ? profile.areaHeading
          : "Production-ready generated application package with runtime validation and delivery support."}
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a className="rounded-2xl bg-red-400 px-6 py-4 font-bold text-black" href="#booking">
          ${profile.heroPrimary}
        </a>
        <a className="rounded-2xl border border-zinc-700 px-6 py-4 font-bold" href="#fleet">
          ${profile.heroSecondary}
        </a>
      </div>
    </section>
  );
}
`
    },
    {
      type: "typescript",
      title: profile.featureTitle,
      file: profile.featureFile,
      content: `const generatedModules = [
  {
    name: "${profile.modeItemOne}",
    detail: "${isTransport ? "Luxury sedan service for airport transfers, business meetings, and private rides." : "Primary module for the requested domain workflow, records, and operational visibility."}"
  },
  {
    name: "${profile.modeItemTwo}",
    detail: "${isTransport ? "Spacious executive SUV service for families, luggage, VIP guests, and group travel." : "Operational module for users, review queues, status tracking, and admin readiness."}"
  },
  {
    name: "${profile.modeItemThree}",
    detail: "${isTransport ? profile.modeItemThree + " delivery plan with production milestones, approvals, and launch-ready assets." : "Delivery module for validation, reporting, export, and launch readiness."}"
  }
];

export function ${profile.featureComponent}() {
  return (
    <section id="${isTransport ? "fleet" : "modules"}" className="grid gap-6 px-8 py-16 md:grid-cols-3">
      {generatedModules.map((item) => (
        <article key={item.name} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">{item.name}</h2>
          <p className="mt-4 text-zinc-400">{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
`
    },
    {
      type: "typescript",
      title: profile.actionTitle,
      file: profile.actionFile,
      content: `"use client";

import { useState } from "react";

type FareEstimate = {
  subtotal: number;
  ${isTransport ? "airportFee" : "serviceFee"}: number;
  peakFee: number;
  luggageFee?: number;
  total: number;
  depositDue: number;
  currency: string;
  note: string;
};

export function ${profile.actionComponent}() {
  const [form, setForm] = useState({
    pickup: "${isTransport ? "ORD Airport" : profile.modeItemOne}",
    dropoff: "${isTransport ? "Downtown Chicago" : profile.modeItemTwo}",
    dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    contact: "customer@example.com",
    customerName: "Demo Customer",
    customerEmail: "customer@example.com",
    customerPhone: "773-510-1467",
    serviceType: "${profile.smokeService}",
    vehicleType: "${isTransport ? "luxury-suv" : "standard"}",
    passengers: 2,
    luggage: 2,
    estimatedMiles: 18,
    estimatedMinutes: 45,
    specialRequests: ""
  });
  const [quote, setQuote] = useState<FareEstimate | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [status, setStatus] = useState("");

  function update(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: ["passengers", "luggage", "estimatedMiles", "estimatedMinutes"].includes(field)
        ? Number(value)
        : value
    }));
  }

  async function requestQuote() {
    setStatus("Calculating quote...");
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setQuote(data.estimate || data.quote || data);
    setStatus(data.ok ? "Quote ready." : "Quote failed.");
  }

  async function bookNow() {
    setStatus("Creating booking...");
    const bookingResponse = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quote })
    });
    const bookingData = await bookingResponse.json();
    setBooking(bookingData.booking || bookingData.lead || bookingData);

    const bookingId =
      bookingData.booking?.id ||
      bookingData.lead?.id ||
      bookingData.id ||
      "BOOK-DEMO";

    const paymentResponse = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        amount: quote?.depositDue || quote?.total || 125,
        customerEmail: form.customerEmail || form.contact
      })
    });
    const paymentData = await paymentResponse.json();
    setPayment(paymentData.intent || paymentData.paymentIntent || paymentData);
    setStatus(paymentData.ok ? "Booking and payment intent ready." : "Booking created; payment intent needs review.");
  }

  return (
    <section id="booking" className="mx-8 my-16 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
      <h2 className="text-4xl font-black">${profile.actionHeading}</h2>
      <p className="mt-3 text-zinc-400">${profile.actionDescription}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <input value={form.pickup} onChange={(event) => update("pickup", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Pickup location" />
        <input value={form.dropoff} onChange={(event) => update("dropoff", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Drop-off location" />
        <input value={form.dateTime} onChange={(event) => update("dateTime", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" type="datetime-local" />
        <input value={form.contact} onChange={(event) => update("contact", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Phone or email" />
        <input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Customer name" />
        <input value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Customer email" />
        <input value={form.vehicleType} onChange={(event) => update("vehicleType", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Vehicle type" />
        <input value={form.passengers} onChange={(event) => update("passengers", event.target.value)} className="rounded-xl border border-zinc-800 bg-black p-4" type="number" min="1" placeholder="Passengers" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={requestQuote} className="rounded-2xl bg-red-400 px-6 py-4 font-bold text-black">
          Request Quote
        </button>
        <button onClick={bookNow} disabled={!quote} className="rounded-2xl border border-zinc-700 px-6 py-4 font-bold disabled:opacity-40">
          Book Now + Create Payment Intent
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-red-200">{status}</p>}

      {quote && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
          <h3 className="text-xl font-black">Fare Estimate</h3>
          <p className="mt-2 text-zinc-300">Subtotal: ${"$"}{quote.subtotal}</p>
          <p className="text-zinc-300">Peak fee: ${"$"}{quote.peakFee}</p>
          <p className="text-zinc-300">Deposit due: ${"$"}{quote.depositDue}</p>
          <p className="mt-2 text-2xl font-black">Total: ${"$"}{quote.total} {quote.currency}</p>
          <p className="mt-2 text-xs text-zinc-500">{quote.note}</p>
        </div>
      )}

      {booking && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-5">
          <h3 className="text-xl font-black">Booking Created</h3>
          <pre className="mt-3 overflow-auto text-xs text-zinc-400">{JSON.stringify(booking, null, 2)}</pre>
        </div>
      )}

      {payment && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-5">
          <h3 className="text-xl font-black">Payment Intent</h3>
          <pre className="mt-3 overflow-auto text-xs text-zinc-400">{JSON.stringify(payment, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
`
    },
    {
      type: "typescript",
      title: "Service Area Component",
      file: "components/ServiceAreaMap.tsx",
      content: `const areas = [
  "Chicago O Hare Airport",
  "Midway Airport",
  "Downtown Chicago",
  "Schaumburg",
  "Naperville",
  "Evanston",
  "Hotel Transfers",
  "Corporate Travel",
  "Private Events"
];

export function ServiceAreaMap() {
  return (
    <section id="service-area" className="px-8 py-16">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Service Area</p>
      <h2 className="mt-4 max-w-4xl text-4xl font-black">
        ${profile.areaHeading}
      </h2>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {areas.map((area) => (
          <div key={area} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 font-bold">
            {area}
          </div>
        ))}
      </div>
    </section>
  );
}
`
    },
    {
      type: "typescript",
      title: "Testimonials Component",
      file: "components/Testimonials.tsx",
      content: `const testimonials = [
  "Professional airport pickup, clean vehicle, and smooth executive service.",
  ${isTransport ? "\"Reliable black car transportation for our business travel in Chicago.\"" : "\"Professional delivery aligned to our requested workflow and launch needs.\""},
  "Professional delivery experience with clear structure, polished assets, and launch-ready presentation."
];

export function Testimonials() {
  return (
    <section className="px-8 py-16">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Client Trust</p>
      <h2 className="mt-4 text-4xl font-black">${profile.testimonialTitle}</h2>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {testimonials.map((quote) => (
          <article key={quote} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-zinc-300">“{quote}”</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
    },
    {
      type: "typescript",
      title: "Footer Component",
      file: "components/Footer.tsx",
      content: `export function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-8 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black">${companyName}</h2>
          <p className="mt-3 text-zinc-400">${tagline || "Production-ready generated business platform."}</p>
        </div>

        <div>
          <h3 className="font-black">Contact</h3>
          <p className="mt-3 text-zinc-400">${primaryPhone || "Contact available on request"}</p>
          <p className="text-zinc-400">${secondaryPhone || ""}</p>
          <p className="text-zinc-400">${companyWebsite || ""}</p>
        </div>

        <div>
          <h3 className="font-black">Runtime Delivery</h3>
          <p className="mt-3 text-zinc-400">
            Generated, validated, deployed, and export-ready through OmegaCrownAI Sovereign Runtime.
          </p>
        </div>
      </div>
    </footer>
  );
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Booking API Route" : "Request Intake API Route",
      file: isTransport ? "app/api/booking/route.ts" : "app/api/request/route.ts",
      content: `import { NextResponse } from "next/server";
import { ${isTransport ? "saveBookingLead" : "saveRequestLead"} } from "../../../lib/${isTransport ? "booking-store" : "request-store"}";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lead = await ${isTransport ? "saveBookingLead" : "saveRequestLead"}({
      pickup: body.pickup || "",
      dropoff: body.dropoff || "",
      dateTime: body.dateTime || "",
      contact: body.contact || "",
      service: body.service || "${profile.smokeService}",
      source: "${isTransport ? "generated-booking-form" : "generated-request-form"}",
    });

    return NextResponse.json({
      ok: true,
      message: "${isTransport ? "Booking request received." : "Project request received."}",
      lead,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Booking Store" : "Request Store",
      file: isTransport ? "lib/booking-store.ts" : "lib/request-store.ts",
      content: `import fs from "fs";
import path from "path";

export type ${isTransport ? "BookingLead" : "RequestLead"} = {
  id?: string;
  pickup: string;
  dropoff: string;
  dateTime: string;
  contact: string;
  service: string;
  source: string;
  createdAt?: string;
};

const dataDir = path.join(process.cwd(), "data");
const leadFile = path.join(dataDir, "${isTransport ? "booking-leads.json" : "request-leads.json"}");

function readLeads(): ${isTransport ? "BookingLead" : "RequestLead"}[] {
  fs.mkdirSync(dataDir, { recursive: true });

  return fs.existsSync(leadFile)
    ? JSON.parse(fs.readFileSync(leadFile, "utf8"))
    : [];
}

function writeLeads(leads: ${isTransport ? "BookingLead" : "RequestLead"}[]) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(leadFile, JSON.stringify(leads, null, 2));
}

export async function ${isTransport ? "saveBookingLead" : "saveRequestLead"}(input: ${isTransport ? "BookingLead" : "RequestLead"}) {
  const leads = readLeads();

  const lead = {
    ...input,
    id: "LEAD-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  leads.push(lead);
  writeLeads(leads);

  return lead;
}

export async function ${isTransport ? "listBookingLeads" : "listRequestLeads"}() {
  return readLeads().sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}
`
    },
    {
      type: "typescript",
      title: "Database Client Stub",
      file: "lib/db.ts",
      content: `// Database scaffold.
// Replace this file with Prisma, Postgres, Supabase, or your preferred database adapter.

export const db = {
  status: "ready-for-database-connection",
  provider: process.env.DATABASE_URL ? "configured" : "file-storage-fallback",
};
`
    },
    {
      type: "prisma",
      title: "Prisma Schema",
      file: "prisma/schema.prisma",
      content: isTransport
        ? `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  phone     String?
  role      String    @default("customer")
  bookings  Booking[]
  createdAt DateTime  @default(now())
}

model Vehicle {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  type        String
  capacity    Int
  luggage     Int
  hourlyRate  Int
  baseRate    Int
  photoUrl    String?
  status      String    @default("available")
  bookings    Booking[]
  createdAt   DateTime  @default(now())
}

model Driver {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  phone     String
  status    String    @default("available")
  bookings  Booking[]
  createdAt DateTime  @default(now())
}

model Booking {
  id              String    @id @default(cuid())
  customerName    String
  customerEmail   String
  customerPhone   String
  pickup          String
  dropoff         String
  pickupDateTime  DateTime
  passengers      Int
  luggage         Int
  serviceType     String
  vehicleType     String
  specialRequests String?
  estimatedMiles  Float
  estimatedMinutes Int
  subtotal        Int
  airportFee      Int
  peakFee         Int
  total           Int
  status          String    @default("pending")
  paymentStatus   String    @default("unpaid")
  userId          String?
  vehicleId       String?
  driverId        String?
  user            User?     @relation(fields: [userId], references: [id])
  vehicle         Vehicle?  @relation(fields: [vehicleId], references: [id])
  driver          Driver?   @relation(fields: [driverId], references: [id])
  payments        Payment[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Payment {
  id        String   @id @default(cuid())
  bookingId String
  provider  String
  amount    Int
  currency  String   @default("usd")
  status    String
  intentId  String?
  booking   Booking  @relation(fields: [bookingId], references: [id])
  createdAt DateTime @default(now())
}

model PricingRule {
  id          String   @id @default(cuid())
  name        String
  serviceType String
  baseRate    Int
  perMileRate Int
  hourlyRate  Int
  airportFee  Int
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}
`
        : `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model RequestLead {
  id        String   @id @default(cuid())
  pickup    String
  dropoff   String
  dateTime  String
  contact   String
  service   String
  source    String
  createdAt DateTime @default(now())
}
`
    },
    {
      type: "env",
      title: "Environment Template",
      file: ".env.example",
      content: `DATABASE_URL="postgresql://user:password@localhost:5432/generated_app"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
${profile.notificationEnv}="notifications@example.com"
`
    },
    {
      type: "typescript",
      title: isTransport ? "Bookings API Route" : "Requests API Route",
      file: isTransport ? "app/api/bookings/route.ts" : "app/api/requests/route.ts",
      content: `import { NextResponse } from "next/server";
import { validateBookingInput } from "../../../lib/validation";
import { saveBookingLead } from "../../../lib/${isTransport ? "booking-store" : "request-store"}";

export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "${isTransport ? "bookings" : "requests"}",
    message: "${isTransport ? "Booking list endpoint ready for database integration." : "Request list endpoint ready for database integration."}"
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = validateBookingInput(body);
    const booking = await saveBookingLead({
      ...validated,
      source: "${isTransport ? "bookings-api" : "requests-api"}"
    });

    return NextResponse.json({ ok: true, ${isTransport ? "booking" : "request"}: booking });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 400 });
  }
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Customers API Route" : "Clients API Route",
      file: isTransport ? "app/api/customers/route.ts" : "app/api/clients/route.ts",
      content: `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "${isTransport ? "customers" : "clients"}",
    ${isTransport ? "customers" : "clients"}: [],
    message: "${isTransport ? "Customer endpoint scaffold ready for CRM/database integration." : "Client endpoint scaffold ready for CRM/database integration."}"
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    ${isTransport ? "customer" : "client"}: {
      id: "${isTransport ? "CUS" : "CLI"}-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      createdAt: new Date().toISOString()
    }
  });
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Quote Pricing API Route" : "Quotes API Route",
      file: "app/api/quotes/route.ts",
      content: isTransport
        ? `import { NextResponse } from "next/server";
import { calculateFareEstimate } from "../../../lib/pricing-engine";
import { checkVehicleAvailability } from "../../../lib/availability-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = calculateFareEstimate({
      pickup: body.pickup || "",
      dropoff: body.dropoff || "",
      serviceType: body.serviceType || "airport-transfer",
      vehicleType: body.vehicleType || "luxury-suv",
      pickupDateTime: body.pickupDateTime || new Date().toISOString(),
      passengers: Number(body.passengers || 1),
      luggage: Number(body.luggage || 0),
      estimatedMiles: Number(body.estimatedMiles || 22),
      estimatedMinutes: Number(body.estimatedMinutes || 45)
    });

    const availability = checkVehicleAvailability({
      vehicleType: quote.vehicleType,
      pickupDateTime: quote.pickupDateTime,
      passengers: quote.passengers
    });

    return NextResponse.json({
      ok: true,
      quote,
      availability,
      nextStep: availability.available ? "book-now" : "request-manual-review"
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 400 });
  }
}
`
        : `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    quote: {
      service: body.service || "${profile.smokeService}",
      estimatedTotal: 125,
      currency: "USD",
      note: "Final scope should be confirmed before production launch."
    }
  });
}
`
    },
    {
      type: "typescript",
      title: "Prisma Client",
      file: "lib/prisma.ts",
      content: `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
`
    },
    {
      type: "typescript",
      title: "Validation Helpers",
      file: "lib/validation.ts",
      content: `export function validateBookingInput(input: any) {
  const pickup = String(input.pickup || "").trim();
  const dropoff = String(input.dropoff || "").trim();
  const dateTime = String(input.dateTime || "").trim();
  const contact = String(input.contact || "").trim();
  const service = String(input.service || "${profile.smokeService}").trim();

  if (!pickup) throw new Error("Pickup location is required.");
  if (!dropoff) throw new Error("Drop-off location is required.");
  if (!dateTime) throw new Error("Date and time are required.");
  if (!contact) throw new Error("Phone or email is required.");

  return { pickup, dropoff, dateTime, contact, service };
}
`
    },
    {
      type: "typescript",
      title: "Email Notification Stub",
      file: "lib/email.ts",
      content: `export async function sendBookingNotification(input: any) {
  // Replace this with Resend, SendGrid, SMTP, or your preferred email provider.
  console.log("Booking notification ready:", input);

  return {
    ok: true,
    provider: "stub",
    message: "Email notification scaffold executed."
  };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Pricing Engine" : "Delivery Pricing Notes",
      file: isTransport ? "lib/pricing-engine.ts" : "lib/pricing-engine.ts",
      content: isTransport
        ? `export type FareInput = {
  pickup: string;
  dropoff: string;
  serviceType: string;
  vehicleType: string;
  pickupDateTime: string;
  passengers: number;
  luggage: number;
  estimatedMiles: number;
  estimatedMinutes: number;
};

const vehicleRates: Record<string, { base: number; perMile: number; hourly: number; minimum: number }> = {
  "luxury-sedan": { base: 95, perMile: 4, hourly: 95, minimum: 125 },
  "luxury-suv": { base: 135, perMile: 5, hourly: 125, minimum: 175 },
  "sprinter-van": { base: 225, perMile: 7, hourly: 185, minimum: 325 },
  "executive-van": { base: 195, perMile: 6, hourly: 165, minimum: 275 }
};

function isAirportRoute(input: FareInput) {
  const route = (input.pickup + " " + input.dropoff).toLowerCase();
  return route.includes("ord") || route.includes("mdw") || route.includes("o hare") || route.includes("midway") || route.includes("airport");
}

function isPeakTime(iso: string) {
  const hour = new Date(iso).getHours();
  return hour >= 6 && hour <= 9 || hour >= 16 && hour <= 19;
}

export function calculateFareEstimate(input: FareInput) {
  const rate = vehicleRates[input.vehicleType] || vehicleRates["luxury-suv"];
  const distanceFare = Math.round(input.estimatedMiles * rate.perMile);
  const timeFare = Math.round((input.estimatedMinutes / 60) * rate.hourly);
  const airportFee = isAirportRoute(input) ? 35 : 0;
  const peakFee = isPeakTime(input.pickupDateTime) ? 45 : 0;
  const luggageFee = input.luggage > 4 ? 25 : 0;
  const subtotal = Math.max(rate.minimum, rate.base + distanceFare + timeFare);
  const total = subtotal + airportFee + peakFee + luggageFee;

  return {
    pickup: input.pickup,
    dropoff: input.dropoff,
    pickupDateTime: input.pickupDateTime,
    serviceType: input.serviceType,
    vehicleType: input.vehicleType,
    passengers: input.passengers,
    luggage: input.luggage,
    estimatedMiles: input.estimatedMiles,
    estimatedMinutes: input.estimatedMinutes,
    subtotal,
    airportFee,
    peakFee,
    luggageFee,
    total,
    depositDue: Math.round(total * 0.25),
    currency: "USD",
    note: "Estimate uses configured mileage/time placeholders until Google Maps Distance Matrix is connected."
  };
}
`
        : `export function calculateDeliveryEstimate() {
  return {
    subtotal: 125,
    total: 125,
    currency: "USD",
    note: "Configure project-specific delivery pricing."
  };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Vehicle Availability Engine" : "Asset Availability Engine",
      file: isTransport ? "lib/availability-engine.ts" : "lib/availability-engine.ts",
      content: isTransport
        ? `const vehicles = [
  { id: "veh-nav", name: "Lincoln Navigator", type: "luxury-suv", capacity: 6, luggage: 5, status: "available" },
  { id: "veh-exp", name: "Ford Expedition", type: "luxury-suv", capacity: 6, luggage: 5, status: "available" },
  { id: "veh-cont", name: "Lincoln Continental", type: "luxury-sedan", capacity: 3, luggage: 3, status: "available" },
  { id: "veh-sprinter", name: "Mercedes-Benz Sprinter", type: "sprinter-van", capacity: 14, luggage: 12, status: "available" }
];

export function listVehicles() {
  return vehicles;
}

export function checkVehicleAvailability(input: { vehicleType: string; pickupDateTime: string; passengers: number }) {
  const matches = vehicles.filter((vehicle) =>
    vehicle.type === input.vehicleType &&
    vehicle.capacity >= input.passengers &&
    vehicle.status === "available"
  );

  return {
    available: matches.length > 0,
    vehicles: matches,
    checkedAt: new Date().toISOString(),
    message: matches.length ? "Vehicle options available." : "Manual dispatch review required."
  };
}
`
        : `export function checkAssetAvailability() {
  return { available: true, assets: [], checkedAt: new Date().toISOString() };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Payment Provider Stub" : "Payment Provider Stub",
      file: "lib/payment-provider.ts",
      content: `export async function createPaymentIntent(input: { amount: number; bookingId: string; customerEmail: string }) {
  // Replace this stub with Stripe or Square SDK integration.
  // Stripe example: stripe.paymentIntents.create({ amount, currency: "usd", metadata: { bookingId } })
  return {
    provider: process.env.PAYMENT_PROVIDER || "stripe_stub",
    clientSecret: "demo_client_secret_" + input.bookingId,
    amount: input.amount,
    currency: "usd",
    status: "requires_payment_method",
    bookingId: input.bookingId,
    customerEmail: input.customerEmail
  };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Transport Notification Service" : "Notification Service",
      file: "lib/notification-service.ts",
      content: `export async function sendBookingEmails(input: any) {
  // Replace with PHPMailer, Resend, SendGrid, SMTP, or Twilio SMS.
  console.log("Customer confirmation email queued:", input.customerEmail || input.contact);
  console.log("Admin booking alert queued:", process.env.ADMIN_NOTIFICATION_EMAIL || "notifications@example.com");

  return {
    ok: true,
    customerReceipt: true,
    adminAlert: true,
    provider: "stub"
  };
}
`
    },
    {
      type: "typescript",
      title: "Prisma Seed Script",
      file: "prisma/seed.ts",
      content: `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed transportation services and fleet records here.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
`
    },
    {
      type: "typescript",
      title: isTransport ? "Booking Service" : "Request Service",
      file: isTransport ? "lib/services/booking-service.ts" : "lib/services/request-service.ts",
      content: `export function createBookingWorkflow(input: any) {
  return {
    id: "BOOK-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    status: "new-request",
    pickup: input.pickup,
    dropoff: input.dropoff,
    service: input.service || "${profile.smokeService}",
    customerContact: input.contact,
    workflow: ["new-request", "quoted", "confirmed", "assigned", "completed"],
    createdAt: new Date().toISOString(),
  };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Dispatch Service" : "Delivery Service",
      file: isTransport ? "lib/services/dispatch-service.ts" : "lib/services/delivery-service.ts",
      content: isTransport
        ? `export function assignDriverToBooking(bookingId: string, driverId: string, vehicleId: string) {
  return {
    bookingId,
    driverId,
    vehicleId,
    status: "assigned",
    assignedAt: new Date().toISOString(),
  };
}
`
        : `export function assignProducerToDelivery(requestId: string, producerId: string, assetId: string) {
  return {
    requestId,
    producerId,
    assetId,
    status: "assigned",
    assignedAt: new Date().toISOString(),
  };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Fleet Service" : "Asset Service",
      file: isTransport ? "lib/services/fleet-service.ts" : "lib/services/asset-service.ts",
      content: isTransport
        ? `export const generatedModules = [
  { id: "VEH-SEDAN", name: "${profile.modeItemOne}", status: "available" },
  { id: "VEH-SUV", name: "${profile.modeItemTwo}", status: "available" },
  { id: "VEH-CHAUFFEUR", name: "${profile.modeItemThree}", status: "available" },
];

export function listFleet() {
  return fleet;
}
`
        : `export const assets = [
  { id: "ASSET-001", name: "${profile.modeItemOne}", status: "ready" },
  { id: "ASSET-002", name: "${profile.modeItemTwo}", status: "ready" },
  { id: "ASSET-003", name: "${profile.modeItemThree}", status: "ready" },
];

export function listAssets() {
  return assets;
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Customer Service" : "Client Service",
      file: isTransport ? "lib/services/customer-service.ts" : "lib/services/client-service.ts",
      content: `export function createCustomerProfile(input: any) {
  return {
    id: "CUS-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    name: input.name || "",
    email: input.email || "",
    phone: input.phone || "",
    tier: "standard",
    createdAt: new Date().toISOString(),
  };
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Dispatch API Route" : "Delivery API Route",
      file: isTransport ? "app/api/dispatch/route.ts" : "app/api/delivery/route.ts",
      content: isTransport
        ? `import { NextResponse } from "next/server";
import { assignDriverToBooking } from "../../../lib/services/dispatch-service";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    assignment: assignDriverToBooking(
      body.bookingId || "BOOK-DEMO",
      body.driverId || "DRV-DEMO",
      body.vehicleId || "VEH-SUV"
    ),
  });
}
`
        : `import { NextResponse } from "next/server";
import { assignProducerToDelivery } from "../../../lib/services/delivery-service";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    assignment: assignProducerToDelivery(
      body.requestId || "REQ-DEMO",
      body.producerId || "PROD-DEMO",
      body.assetId || "ASSET-DEMO"
    ),
  });
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Fleet API Route" : "Asset API Route",
      file: isTransport ? "app/api/fleet/route.ts" : "app/api/assets/route.ts",
      content: isTransport
        ? `import { NextResponse } from "next/server";
import { listFleet } from "../../../lib/services/fleet-service";

export async function GET() {
  return NextResponse.json({
    ok: true,
    fleet: listFleet(),
  });
}
`
        : `import { NextResponse } from "next/server";
import { listAssets } from "../../../lib/services/asset-service";

export async function GET() {
  return NextResponse.json({
    ok: true,
    assets: listAssets(),
  });
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Availability API Route" : "Availability API Route",
      file: "app/api/availability/route.ts",
      content: isTransport
        ? `import { NextResponse } from "next/server";
import { checkVehicleAvailability, listVehicles } from "../../../lib/availability-engine";

export async function GET() {
  return NextResponse.json({ ok: true, vehicles: listVehicles() });
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    ok: true,
    availability: checkVehicleAvailability({
      vehicleType: body.vehicleType || "luxury-suv",
      pickupDateTime: body.pickupDateTime || new Date().toISOString(),
      passengers: Number(body.passengers || 1)
    })
  });
}
`
        : `import { NextResponse } from "next/server";
import { checkAssetAvailability } from "../../../lib/availability-engine";

export async function GET() {
  return NextResponse.json({ ok: true, availability: checkAssetAvailability() });
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Payment Intent API Route" : "Payment Intent API Route",
      file: "app/api/payments/create-intent/route.ts",
      content: `import { NextResponse } from "next/server";
import { createPaymentIntent } from "../../../../lib/payment-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentIntent = await createPaymentIntent({
      amount: Number(body.amount || 10000),
      bookingId: body.bookingId || "BOOK-DEMO",
      customerEmail: body.customerEmail || "customer@example.com"
    });

    return NextResponse.json({ ok: true, paymentIntent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 400 });
  }
}
`
    },
    {
      type: "typescript",
      title: "Invoices API Route",
      file: "app/api/invoices/route.ts",
      content: `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    invoice: {
      id: "INV-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      bookingId: body.bookingId || "BOOK-DEMO",
      amount: body.amount || 125,
      currency: "USD",
      status: "draft",
      createdAt: new Date().toISOString(),
    },
  });
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Admin Fleet Page" : "Admin Assets Page",
      file: isTransport ? "app/admin/fleet/page.tsx" : "app/admin/assets/page.tsx",
      content: `export default function AdminAssetsPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${isTransport ? "Fleet" : "Assets"}</p>
      <h1 className="mt-4 text-5xl font-black">${profile.featureTitle}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {["${profile.modeItemOne}", "${profile.modeItemTwo}", "${profile.modeItemThree}"].map((vehicle) => (
          <article key={vehicle} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-black">{vehicle}</h2>
            <p className="mt-3 text-zinc-400">Status: available</p>
          </article>
        ))}
      </div>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Admin Dispatch Page" : "Admin Delivery Page",
      file: isTransport ? "app/admin/dispatch/page.tsx" : "app/admin/delivery/page.tsx",
      content: `export default function AdminDeliveryPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${isTransport ? "Dispatch" : "Delivery"}</p>
      <h1 className="mt-4 text-5xl font-black">${isTransport ? "Dispatch Operations" : "Delivery Operations"}</h1>
      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">${isTransport ? "Assign drivers, vehicles, and booking statuses from this workflow board." : "Coordinate production milestones, delivery assets, review status, and launch-ready outputs from this workflow board."}</p>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: "Admin Invoices Page",
      file: "app/admin/invoices/page.tsx",
      content: `export default function AdminInvoicesPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Invoices</p>
      <h1 className="mt-4 text-5xl font-black">Invoice Management</h1>
      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">Create invoices, track payment status, and connect Stripe webhooks.</p>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: "Admin Dashboard",
      file: "app/admin/page.tsx",
      content: `export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Admin</p>
      <h1 className="mt-4 text-5xl font-black">${isTransport ? "Transportation Admin Command Center" : profile.adminTitle}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <a className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8" href="${isTransport ? "/admin/bookings" : "/admin/requests"}">
          <h2 className="text-2xl font-black">${isTransport ? "Bookings" : "Requests"}</h2>
          <p className="mt-3 text-zinc-400">Review new production requests and delivery workflow.</p>
        </a>

        <a className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8" href="${isTransport ? "/admin/customers" : "/admin/clients"}">
          <h2 className="text-2xl font-black">${isTransport ? "Customers" : "Clients"}</h2>
          <p className="mt-3 text-zinc-400">${isTransport ? "Manage customer profiles and contact records." : "Manage client profiles and contact records."}</p>
        </a>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">${isTransport ? "Fleet" : "Assets"}</h2>
          <p className="mt-3 text-zinc-400">${isTransport ? "Track executive vehicles and service availability." : "Track production assets and delivery readiness."}</p>
        </div>
      </div>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Admin Bookings Page" : "Admin Requests Page",
      file: isTransport ? "app/admin/bookings/page.tsx" : "app/admin/requests/page.tsx",
      content: `${isTransport ? 'import { listBookingLeads } from "../../../lib/booking-store";\n\n' : ''}export default async function AdminBookingsPage() {
  const bookingLeads = ${isTransport ? "await listBookingLeads()" : "[]"};

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${isTransport ? "Bookings" : "Requests"}</p>
      <h1 className="mt-4 text-5xl font-black">${isTransport ? "Dispatch Booking Queue" : "Production Requests"}</h1>

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">
          ${isTransport ? "Live Booking Queue: read submitted booking requests from listBookingLeads(), prepare each ride for dispatch review, and track pending dispatch status." : "Connect this view to production request records for live delivery operations."}
        </p>

        <div className="mt-6 grid gap-4">
          {bookingLeads.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm font-black text-zinc-300">${isTransport ? "No booking requests are waiting for dispatch yet." : "No production requests are waiting for review yet."}</p>
            </div>
          ) : (
            bookingLeads.slice(0, 12).map((booking: any) => (
              <article key={booking.id} className="rounded-2xl border border-zinc-800 bg-black p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-red-300">{booking.status || "pending"}</p>
                    <h2 className="mt-2 text-xl font-black">{booking.pickup || "Pickup pending"} → {booking.dropoff || "Drop-off pending"}</h2>
                    <p className="mt-2 text-sm text-zinc-400">{booking.service || "Executive black car"} • {booking.customerContact || "Customer contact pending"}</p>
                  </div>
                  <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-black">Pending dispatch</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Admin Customers Page" : "Admin Clients Page",
      file: isTransport ? "app/admin/customers/page.tsx" : "app/admin/clients/page.tsx",
      content: `export default function AdminCustomersPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${isTransport ? "Customers" : "Clients"}</p>
      <h1 className="mt-4 text-5xl font-black">${isTransport ? "Customer CRM" : "Client CRM"}</h1>

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">
          ${isTransport ? "Connect this view to customer records, ride history, quote history, and VIP profiles." : "Connect this view to client records, request history, quote history, and account profiles."}
        </p>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: "Auth Helpers",
      file: "lib/auth.ts",
      content: `export type UserRole = "admin" | "operator" | "customer";

export function createDemoUser(role: UserRole = "customer") {
  return {
    id: "USER-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    role,
    createdAt: new Date().toISOString(),
  };
}

export function requireRole(user: { role?: string } | null, roles: UserRole[]) {
  if (!user || !roles.includes(user.role as UserRole)) {
    throw new Error("Unauthorized");
  }

  return true;
}
`
    },
    {
      type: "typescript",
      title: "Session Helpers",
      file: "lib/session.ts",
      content: `export function createSessionPayload(user: any) {
  return {
    user,
    issuedAt: new Date().toISOString(),
    expiresIn: "demo-session",
  };
}
`
    },
    {
      type: "typescript",
      title: "Login API Route",
      file: "app/api/auth/login/route.ts",
      content: `import { NextResponse } from "next/server";
import { createDemoUser } from "../../../../lib/auth";
import { createSessionPayload } from "../../../../lib/session";

export async function POST(req: Request) {
  const body = await req.json();

  const user = createDemoUser(body.role || "customer");

  return NextResponse.json({
    ok: true,
    message: "Demo login successful. Replace with real auth provider.",
    session: createSessionPayload(user),
  });
}
`
    },
    {
      type: "typescript",
      title: "Register API Route",
      file: "app/api/auth/register/route.ts",
      content: `import { NextResponse } from "next/server";
import { createDemoUser } from "../../../../lib/auth";
import { createSessionPayload } from "../../../../lib/session";

export async function POST(req: Request) {
  const body = await req.json();

  const user = {
    ...createDemoUser("customer"),
    name: body.name || "",
    email: body.email || "",
  };

  return NextResponse.json({
    ok: true,
    message: "Demo registration successful. Replace with database user creation.",
    session: createSessionPayload(user),
  });
}
`
    },
    {
      type: "typescript",
      title: "Auth Middleware",
      file: "middleware.ts",
      content: `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Demo middleware scaffold. Add real cookie/session checks before production.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/operator/:path*", "/customer/:path*"],
};
`
    },
    {
      type: "typescript",
      title: "Login Page",
      file: "app/login/page.tsx",
      content: `export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-red-300">Account Access</p>
        <h1 className="mt-4 text-5xl font-black">Login</h1>
        <p className="mt-4 text-zinc-400">Demo auth scaffold for customer, operator, and admin access.</p>

        <form className="mt-8 grid gap-4">
          <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Email" />
          <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Password" type="password" />
          <button className="rounded-xl bg-red-400 p-4 font-bold text-black" type="button">Login</button>
        </form>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: "Register Page",
      file: "app/register/page.tsx",
      content: `export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-red-300">Create Account</p>
        <h1 className="mt-4 text-5xl font-black">Register</h1>
        <p className="mt-4 text-zinc-400">Customer account scaffold for booking history and future reservations.</p>

        <form className="mt-8 grid gap-4">
          <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Name" />
          <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Email" />
          <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Password" type="password" />
          <button className="rounded-xl bg-red-400 p-4 font-bold text-black" type="button">Create Account</button>
        </form>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Customer Portal" : "Client Portal",
      file: isTransport ? "app/customer/page.tsx" : "app/client/page.tsx",
      content: `${isTransport ? 'import { listBookingLeads } from "../../lib/booking-store";\n\n' : ''}export default async function ClientPortal() {
  const bookingLeads = ${isTransport ? "await listBookingLeads()" : "[]"};

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${isTransport ? "Customer Portal" : "Client Portal"}</p>
      <h1 className="mt-4 text-5xl font-black">${isTransport ? "My Booking Requests" : "My Deliverables"}</h1>

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">
          ${isTransport ? "Ride Request History: connect this customer portal to listBookingLeads() so customers can review submitted booking requests, quote history, invoices, pickup, drop-off, contact details, and profile records. Empty state: No booking requests." : "Connect this portal to requests, quote history, invoices, and client profile records."}
        </p>

        <div className="mt-6 grid gap-4">
          {bookingLeads.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-sm font-black text-zinc-300">${isTransport ? "No booking requests yet." : "No delivery requests yet."}</p>
              <p className="mt-2 text-sm text-zinc-500">${isTransport ? "Submitted rides will appear here with pickup, drop-off, contact, quote, invoice, and status details." : "Submitted requests will appear here with quote, invoice, and delivery details."}</p>
            </div>
          ) : (
            bookingLeads.slice(0, 8).map((booking: any) => (
              <article key={booking.id} className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-red-300">{booking.status || "submitted"}</p>
                <h2 className="mt-2 text-xl font-black">{booking.pickup || "Pickup pending"} → {booking.dropoff || "Drop-off pending"}</h2>
                <p className="mt-2 text-sm text-zinc-400">{booking.service || "Executive black car"} • {booking.customerContact || "Customer contact pending"}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: isTransport ? "Dispatcher Portal" : "Operator Portal",
      file: isTransport ? "app/dispatcher/page.tsx" : "app/operator/page.tsx",
      content: `export default function OperatorPortal() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">${isTransport ? "Dispatcher" : "Operator"}</p>
      <h1 className="mt-4 text-5xl font-black">${isTransport ? "Dispatch Board" : "Production Board"}</h1>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">New Requests</h2>
          <p className="mt-3 text-zinc-400">Incoming reservations awaiting review.</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">${isTransport ? "Assigned Trips" : "Assigned Jobs"}</h2>
          <p className="mt-3 text-zinc-400">${isTransport ? "Trips assigned to drivers or fleet resources." : "Jobs assigned to producers or production resources."}</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">Fleet Status</h2>
          <p className="mt-3 text-zinc-400">${isTransport ? "Vehicle readiness and availability overview." : "Asset readiness and delivery availability overview."}</p>
        </div>
      </section>
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: "Next.js App Page",
      file: "app/page.tsx",
      content: `import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { ${profile.featureComponent} } from "${featureImportPath}";
import { ServiceAreaMap } from "../components/ServiceAreaMap";
import { ${profile.actionComponent} } from "${actionImportPath}";
import { Testimonials } from "../components/Testimonials";
import { Footer } from "../components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <${profile.featureComponent} />
      <ServiceAreaMap />
      <${profile.actionComponent} />
      <Testimonials />
      <Footer />
    </main>
  );
}
`
    },
    {
      type: "typescript",
      title: "Next.js Layout",
      file: "app/layout.tsx",
      content: `import "./globals.css";

export const metadata = {
  title: "${isTransport ? companyName : projectName}",
  description: "${isTransport ? tagline : profile.areaHeading}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    },
    {
      type: "css",
      title: "Next.js Global Styles",
      file: "app/globals.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
`
    },
    {
      type: "javascript",
      title: "Tailwind Config",
      file: "tailwind.config.js",
      content: `module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`
    },
    {
      type: "typescript",
      title: "CSS Type Declarations",
      file: "global.d.ts",
      content: `declare module "*.css";
`,
      status: "generated",
    },
    {
      type: "typescript",
      title: "TypeScript Config",
      file: "tsconfig.json",
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
`
    },
    {
      type: "docker",
      title: "Dockerfile",
      file: "Dockerfile",
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
      type: "yaml",
      title: "Docker Compose",
      file: "docker-compose.yml",
      content: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/generated_app
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
      ${profile.notificationEnv}: notifications@example.com
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: generated_app
    ports:
      - "5432:5432"
    volumes:
      - generated_app_db:/var/lib/postgresql/data

volumes:
  generated_app_db:
`
    },
    {
      type: "typescript",
      title: "Smoke Test Script",
      file: "scripts/smoke-test.ts",
      content: `async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const quoteResponse = await fetch(baseUrl + "/api/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service: "${profile.smokeService}",
    }),
  });

  if (!quoteResponse.ok) {
    throw new Error("Quotes API failed");
  }

  const bookingResponse = await fetch(baseUrl + "/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pickup: "O Hare Airport",
      dropoff: "${isTransport ? "Downtown Chicago" : profile.modeItemTwo}",
      dateTime: new Date().toISOString(),
      contact: "customer@example.com",
      service: "${profile.smokeService}",
    }),
  });

  if (!bookingResponse.ok) {
    throw new Error("Bookings API failed");
  }

  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
`
    },
    {
      type: "markdown",
      title: "Delivery README",
      file: "README.md",
      content: `# ${run.projectId}

## Prompt
${run.prompt}

## Runtime
- Runtime ID: ${run.runtimeId}
- Mode: ${mode}
- Status: generated

## Files
- index.html
- styles.css
- metadata.json
- package.json
- README.md

## Delivery
This artifact was generated by the independent Sovereign Runtime engine and is ready for preview, validation, export, and customer delivery.
`
    }
  ];


  // force-transport-full-function-hook
  if (isTransport) {
    const transportSvgAsset = (label: string, description: string, bg: string, fg: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${bg}"/>
  <circle cx="1260" cy="180" r="220" fill="${fg}" opacity="0.22"/>
  <circle cx="260" cy="720" r="260" fill="${fg}" opacity="0.14"/>
  <rect x="120" y="150" width="1360" height="600" rx="56" fill="#020617" opacity="0.78"/>
  <text x="160" y="330" font-family="Arial, sans-serif" font-size="96" font-weight="900" fill="${fg}">${label}</text>
  <text x="160" y="455" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="#f8fafc">${description}</text>
</svg>`;

    const upsertFile = (file: string, title: string, content: string, type: string = "typescript") => {
      const existing = files.find((entry) => entry.file === file);
      if (existing) {
        existing.title = title;
        existing.content = content;
        existing.type = type;
        return;
      }
      files.push({ file, title, content, type });
    };

    upsertFile("data/fleet.json", "Transport Fleet Data", JSON.stringify([
      { id: "executive-sedan", name: "Executive Sedan", capacity: 3, luggage: 3, useCase: "O'Hare, Midway, downtown Chicago, meetings, and individual premium travel.", hourlyRate: 95 },
      { id: "luxury-suv", name: "Luxury SUV", capacity: 6, luggage: 6, useCase: "Airport transfers, families, executive groups, hotels, events, and suburban routes.", hourlyRate: 135 },
      { id: "premium-group-van", name: "Premium Group Van", capacity: 10, luggage: 10, useCase: "Corporate groups, event transfers, hotel shuttles, and special occasions.", hourlyRate: 165 }
    ], null, 2), "json");

    upsertFile("data/editable-content.json", "Editable Transport Content", JSON.stringify({
      brand: companyName,
      tagline,
      phone: primaryPhone,
      secondaryPhone,
      website: companyWebsite,
      hero: {
        headline: "Luxury airport transfers and executive black car service in Chicago.",
        subheadline: "Book O'Hare, Midway, downtown Chicago, suburbs, hotels, events, and executive travel with Princess Benjamin Transportation Company."
      },
      updatedAt: new Date().toISOString()
    }, null, 2), "json");

    upsertFile("data/asset-manifest.json", "Transport Visual Asset Manifest", JSON.stringify({
      generatedAt: new Date().toISOString(),
      brand: companyName,
      domain: "transport",
      assets: [
        "public/images/hero.svg",
        "public/images/feature-1.svg",
        "public/images/feature-2.svg",
        "public/images/admin.svg"
      ],
      imagePrompt: `Create polished luxury black car and airport transfer visuals for ${companyName}: O'Hare, Midway, chauffeur, fleet, booking, dispatch, and customer portal.`
    }, null, 2), "json");

    upsertFile("public/images/hero.svg", "Luxury Transport Hero Visual", transportSvgAsset("Luxury Airport Transfers", "Premium chauffeur, O'Hare, Midway, executive travel", "#111827", "#fbbf24"), "svg");
    upsertFile("public/images/feature-1.svg", "Fleet Gallery Visual", transportSvgAsset("Fleet Gallery", "Executive sedan, SUV, and premium group vehicle options", "#172554", "#60a5fa"), "svg");
    upsertFile("public/images/feature-2.svg", "Booking Flow Visual", transportSvgAsset("Quote & Booking", "Airport pickup, drop-off, schedule, customer details, and quote request", "#052e16", "#4ade80"), "svg");
    upsertFile("public/images/admin.svg", "Dispatch Admin Visual", transportSvgAsset("Dispatch Admin", "Booking review, driver assignment, fleet status, and customer tracking", "#431407", "#fb923c"), "svg");

    upsertFile("lib/content-store.ts", "Editable Content Store", `import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const runtimeFile = path.join(dataDir, "editable-content.runtime.json");
const seedContent = {
  brand: "${companyName}",
  tagline: "${tagline}",
  phone: "${primaryPhone}",
  secondaryPhone: "${secondaryPhone}",
  website: "${companyWebsite}",
  hero: {
    headline: "Luxury airport transfers and executive black car service in Chicago.",
    subheadline: "Book O'Hare, Midway, downtown Chicago, suburbs, hotels, events, and executive travel."
  }
};

export async function getEditableContent() {
  try {
    return JSON.parse(await fs.readFile(runtimeFile, "utf8"));
  } catch {
    return seedContent;
  }
}

export async function saveEditableContent(input: any) {
  const next = { ...(await getEditableContent()), ...input, updatedAt: new Date().toISOString() };
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(runtimeFile, JSON.stringify(next, null, 2));
  return next;
}
`);

    upsertFile("app/api/content/route.ts", "Editable Content API", `import { NextResponse } from "next/server";
import { getEditableContent, saveEditableContent } from "../../../lib/content-store";

export async function GET() {
  return NextResponse.json({ ok: true, content: await getEditableContent() });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, content: await saveEditableContent(body) });
}
`);

    upsertFile("lib/transport-store.ts", "Transport Store", `import fs from "fs/promises";
import path from "path";
import fleet from "../data/fleet.json";

const dataDir = path.join(process.cwd(), "data");
const bookingsFile = path.join(dataDir, "booking-leads.runtime.json");

export function listFleet() {
  return fleet;
}

export async function listBookingLeads() {
  try {
    return JSON.parse(await fs.readFile(bookingsFile, "utf8"));
  } catch {
    return [];
  }
}

export async function createBookingLead(input: any) {
  const bookings = await listBookingLeads();
  const booking = {
    id: "booking-" + Date.now(),
    status: "new_lead",
    company: "${companyName}",
    createdAt: new Date().toISOString(),
    ...input
  };
  bookings.unshift(booking);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2));
  return booking;
}
`);

    upsertFile("app/api/bookings/route.ts", "Booking Leads API", `import { NextResponse } from "next/server";
import { createBookingLead, listBookingLeads } from "../../../lib/transport-store";

export async function GET() {
  return NextResponse.json({ ok: true, bookings: await listBookingLeads() });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, booking: await createBookingLead(body) });
}
`);

    upsertFile("app/api/quotes/route.ts", "Quote Request API", `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    ok: true,
    quote: {
      id: "quote-" + Date.now(),
      status: "received",
      estimatedResponse: "Princess Benjamin Transportation Company will confirm pricing and availability.",
      ...body
    }
  });
}
`);

    upsertFile("app/editor/page.tsx", "Generated Transport Editor", `export default function EditorPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">Generated App Editor</p>
      <h1 className="mt-4 text-5xl font-black">Edit ${companyName} transport content</h1>
      <p className="mt-4 max-w-3xl text-zinc-400">Update hero copy, contact details, fleet messaging, booking instructions, airport transfer content, and dispatch notes.</p>
    </main>
  );
}
`);

    const packageFile = files.find((entry) => entry.file === "package.json");
    if (packageFile) {
      try {
        const pkg = JSON.parse(packageFile.content);
        pkg.scripts = {
          ...(pkg.scripts || {}),
          dev: pkg.scripts?.dev || "next dev",
          build: pkg.scripts?.build || "next build",
          start: pkg.scripts?.start || "next start",
          postinstall: "prisma generate",
          "db:generate": pkg.scripts?.["db:generate"] || "prisma generate",
          smoke: pkg.scripts?.smoke || "tsx scripts/smoke-test.ts"
        };
        pkg.dependencies = {
          ...(pkg.dependencies || {}),
          prisma: pkg.dependencies?.prisma || "6.19.0",
          "@prisma/client": pkg.dependencies?.["@prisma/client"] || "6.19.0"
        };
        packageFile.content = JSON.stringify(pkg, null, 2);
      } catch {}
    }

    upsertFile("README.md", "Transport README", `# ${companyName} Transport Platform

## Prompt
${run.prompt}

## What is included
- Luxury airport transfer and black car website for ${companyName}
- Fleet gallery with sedan, SUV, and group vehicle data
- Quote request and booking lead APIs
- Customer page, admin dispatch dashboard, and generated content editor
- Editable content API and runtime content store
- Prisma database schema and DATABASE_URL example
- Visual asset manifest with rendered SVG images
- Dockerfile, docker-compose.yml, and smoke test script

## Local setup

\`\`\`bash
npm install
npm run db:generate
npm run build
npm run start
\`\`\`

## Environment

Copy \`.env.example\` and set:

\`\`\`bash
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_NAME="${companyName}"
\`\`\`

## Smoke test

\`\`\`bash
npm run smoke
\`\`\`

## Delivery

Runtime ID: ${run.runtimeId}
Project ID: ${run.projectId}
Primary phone: ${primaryPhone}
Secondary phone: ${secondaryPhone}
Website: ${companyWebsite}
Tagline: ${tagline}
`);

    const metadataFile = files.find((entry) => entry.file === "metadata.json");
    if (metadataFile) {
      try {
        const metadata = JSON.parse(metadataFile.content);
        metadata.artifacts = Array.from(new Set(files.map((entry) => entry.file)));
        metadata.deliveryStandard = "full-function";
        metadata.visualAssets = ["public/images/hero.svg", "public/images/feature-1.svg", "public/images/feature-2.svg", "public/images/admin.svg"];
        metadata.requiredRoutes = ["app/page.tsx", "app/customer/page.tsx", "app/admin/page.tsx", "app/editor/page.tsx"];
        metadataFile.content = JSON.stringify(metadata, null, 2);
      } catch {}
    }
  }

  const filesWithSmoke = ensureArtifactSmokeTest(files);

  for (const file of filesWithSmoke) {
    write(path.join(outDir, file.file), file.content);
  }

  ensureSmokeTestFileOnDisk(outDir);

  return filesWithSmoke.map((file) => ({
    type: file.type,
    title: file.title,
    path: path.join(outDir, file.file),
    status: "generated"
  }));
}
