import fs from "fs";
import path from "path";
function write(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}
function slug(text) {
    return String(text || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
}
function modeProfile(mode, prompt, isTransport) {
    if (isTransport) {
        return {
            navPrimary: "Fleet",
            navSecondary: "Service Area",
            navTertiary: "Reviews",
            cta: "${profile.cta}",
            heroPrimary: "${profile.heroPrimary}",
            heroSecondary: "${profile.heroSecondary}",
            featureTitle: "Executive Fleet",
            featureFile: "${profile.featureFile}",
            featureComponent: "Fleet",
            actionTitle: "${profile.actionTitle}",
            actionFile: "${profile.actionFile}",
            actionComponent: "BookingForm",
            actionHeading: "${profile.actionHeading}",
            actionDescription: "${profile.actionDescription}",
            areaTitle: "Service Area",
            areaHeading: "${profile.areaHeading}",
            testimonialTitle: "${profile.testimonialTitle}",
            adminTitle: "${profile.adminTitle}",
            leadModel: "BookingLead",
            leadFile: "booking-leads.json",
            notificationEnv: "${profile.notificationEnv}",
            smokeService: "${profile.smokeService}",
        };
    }
    const profiles = {
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
export async function buildArtifacts(run) {
    const outDir = path.join(process.cwd(), "data", "artifacts", run.projectId);
    fs.mkdirSync(outDir, { recursive: true });
    const projectName = slug(run.prompt);
    const isTransport = /transport|black car|airport|limo|chauffeur|ride/i.test(run.prompt || "");
    const companyName = isTransport
        ? "Princess Benjamin Transportation Company"
        : "OmegaCrownAI Build";
    const companyWebsite = isTransport ? "https://pbtlimo.com" : "";
    const primaryPhone = isTransport ? "+1 (773) 510-1467" : "";
    const secondaryPhone = isTransport ? "(224) 224-0263" : "";
    const tagline = isTransport ? "Your journey, our royal priority." : "";
    const mode = run.mode || "website";
    const profile = modeProfile(mode, run.prompt || "", isTransport);
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
  <title>${projectName}</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <header class="hero">
    <nav>
      <strong>${companyName}</strong>
      <a href="#features">Features</a>
      <a href="#delivery">Delivery</a>
      <a href="#contact">Launch</a>
    </nav>

    <section>
      <p class="eyebrow">${mode.toUpperCase()} RUNTIME ARTIFACT</p>
      <h1>${isTransport ? companyName : run.prompt}</h1>
      ${isTransport ? `<p class="tagline">${tagline}</p>` : ""}
      <p class="lead">
        A production-ready generated artifact package with preview, structure,
        validation, delivery manifest, and export support.
      </p>
      <div class="actions">
        <a class="primary" href="#delivery">View Delivery</a>
        <a class="secondary" href="./README.md">Read Build Notes</a>
      </div>
    </section>
  </header>

  <main>
    <section id="features" class="grid">
      <article><h2>${isTransport ? "${profile.smokeService}s" : "Runtime Generated"}</h2><p>${isTransport ? "Book premium rides to and from major airports with professional chauffeurs." : "Created by the independent Sovereign Runtime engine."}</p></article>
      <article><h2>${isTransport ? "Executive Fleet" : "Agent Validated"}</h2><p>${isTransport ? "Luxury sedans, SUVs, and black car service for business and private travel." : "Planner, Builder, Validator, and Delivery agents completed execution."}</p></article>
      <article><h2>${isTransport ? "Fast Reservations" : "Export Ready"}</h2><p>${isTransport ? "Clear calls to action for ${profile.smokeService.toLowerCase()}, customer intake, approvals, and delivery." : "Artifacts are prepared for ZIP download and customer delivery."}</p></article>
    </section>

    <section id="delivery" class="panel">
      <h2>Delivery Summary</h2>
      <ul>
        <li>Project ID: ${run.projectId}</li>
        <li>Runtime ID: ${run.runtimeId}</li>
        <li>Mode: ${mode}</li>
        <li>Status: generated</li>
        ${isTransport ? `<li>Website: ${companyWebsite}</li><li>Phone: ${primaryPhone}</li><li>Backup: ${secondaryPhone}</li>` : ""}
      </ul>
    </section>

    ${isTransport ? `
    <section class="panel">
      <p class="eyebrow">LUXURY FLEET</p>
      <h2>Executive vehicles for every trip</h2>
      <div class="fleet">
        <article><h3>Executive Sedan</h3><p>Premium black car service for airport transfers and business travel.</p></article>
        <article><h3>Luxury SUV</h3><p>Spacious rides for families, executives, luggage, and VIP guests.</p></article>
        <article><h3>Private Chauffeur</h3><p>Professional point-to-point service with polished presentation.</p></article>
      </div>
    </section>

    <section class="panel booking">
      <p class="eyebrow">RESERVATIONS</p>
      <h2>${profile.actionHeading}</h2>
      <form>
        <input placeholder="Pickup location" />
        <input placeholder="Drop-off location" />
        <input placeholder="Date and time" />
        <input placeholder="Phone or email" />
        <button type="button">Request Quote</button>
      </form>
    </section>

    <section class="panel">
      <p class="eyebrow">SERVICE AREA</p>
      <h2>O Hare airport and executive travel coverage</h2>
      <p>${profile.areaHeading}</p>
    </section>
    ` : ""}

    <section id="contact" class="panel dark">
      <h2>${isTransport ? "Ready to ride in comfort" : "Ready for deployment"}</h2>
      <p>${isTransport ? "Launch-ready black car booking experience with premium positioning, clear reservation flow, and executive design." : "This package can now be extended into full frontend/backend production output."}</p>
    </section>
  </main>
</body>
</html>`
        },
        {
            type: "css",
            title: "Production Stylesheet",
            file: "styles.css",
            content: `*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#070707;color:#fff}a{color:inherit;text-decoration:none}.hero{min-height:100vh;padding:32px;background:radial-gradient(circle at top right,#7f1d1d,transparent 35%),linear-gradient(135deg,#020202,#151515)}nav{display:flex;gap:24px;align-items:center;justify-content:flex-end}nav strong{margin-right:auto}.hero section{max-width:980px;margin:18vh auto 0}.eyebrow{letter-spacing:.35em;color:#fca5a5;font-size:12px}h1{font-size:clamp(44px,8vw,92px);line-height:.95;margin:24px 0}.lead{font-size:22px;color:#d4d4d8;max-width:760px}.tagline{font-size:24px;color:#fecaca;font-weight:800;margin-top:-8px}.actions{display:flex;gap:16px;margin-top:32px}.primary,.secondary{padding:16px 24px;border-radius:18px;font-weight:800}.primary{background:#f87171;color:#000}.secondary{border:1px solid #3f3f46}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;padding:80px 40px}.grid article,.panel{border:1px solid #27272a;border-radius:28px;background:#111;padding:32px}.panel{margin:40px auto;max-width:1000px}.dark{background:#000}.fleet{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:24px}.fleet article{border:1px solid #27272a;border-radius:22px;padding:24px;background:#09090b}.booking form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.booking input{background:#050505;border:1px solid #3f3f46;border-radius:14px;color:white;padding:16px}.booking button{border:0;border-radius:14px;background:#f87171;color:#000;font-weight:900;padding:16px}`
        },
        {
            type: "json",
            title: "Runtime Metadata",
            file: "metadata.json",
            content: JSON.stringify({
                projectId: run.projectId,
                runtimeId: run.runtimeId,
                mode,
                prompt: run.prompt,
                companyName,
                companyWebsite,
                primaryPhone,
                secondaryPhone,
                tagline,
                generatedAt: new Date().toISOString(),
                engine: "sovereign-runtime",
                artifacts: ["index.html", "styles.css", "metadata.json", "README.md", "package.json"]
            }, null, 2)
        },
        {
            type: "json",
            title: "Package Manifest",
            file: "package.json",
            content: JSON.stringify({
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
                    "@prisma/client": "latest",
                    "prisma": "latest",
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
            }, null, 2)
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
        <a href="#fleet" className="hidden text-sm text-zinc-300 md:block">{profile.navPrimary}</a>
        <a href="#service-area" className="hidden text-sm text-zinc-300 md:block">{profile.navSecondary}</a>
        <a href="#testimonials" className="hidden text-sm text-zinc-300 md:block">{profile.navTertiary}</a>
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
                ? "${profile.areaHeading}"
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
            content: `const fleet = [
  {
    name: "${profile.modeItemOne}",
    detail: "Luxury sedan service for airport transfers, business meetings, and private rides."
  },
  {
    name: "${profile.modeItemTwo}",
    detail: "Spacious executive SUV service for families, luggage, VIP guests, and group travel."
  },
  {
    name: "Hourly Chauffeur",
    detail: "${profile.modeItemThree} delivery plan with production milestones, approvals, and launch-ready assets."
  }
];

export function ${profile.featureComponent}() {
  return (
    <section id="fleet" className="grid gap-6 px-8 py-16 md:grid-cols-3">
      {fleet.map((item) => (
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
            content: `export function ${profile.actionComponent}() {
  return (
    <section id="booking" className="mx-8 my-16 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
      <h2 className="text-4xl font-black">${profile.actionHeading}</h2>
      <p className="mt-3 text-zinc-400">
        ${profile.actionDescription}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Pickup location" />
        <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Drop-off location" />
        <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Date and time" />
        <input className="rounded-xl border border-zinc-800 bg-black p-4" placeholder="Phone or email" />
      </div>

      <button className="mt-6 rounded-2xl bg-red-400 px-6 py-4 font-bold text-black">
        Request Quote
      </button>
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
  "Reliable black car transportation for our business travel in Chicago.",
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
            title: "Booking API Route",
            file: "app/api/booking/route.ts",
            content: `import { NextResponse } from "next/server";
import { saveBookingLead } from "../../../lib/booking-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lead = await saveBookingLead({
      pickup: body.pickup || "",
      dropoff: body.dropoff || "",
      dateTime: body.dateTime || "",
      contact: body.contact || "",
      service: body.service || "${profile.smokeService}",
      source: "generated-booking-form",
    });

    return NextResponse.json({
      ok: true,
      message: "Booking request received.",
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
            title: "Booking Store",
            file: "lib/booking-store.ts",
            content: `import fs from "fs";
import path from "path";

export type BookingLead = {
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
const leadFile = path.join(dataDir, "booking-leads.json");

export async function saveBookingLead(input: BookingLead) {
  fs.mkdirSync(dataDir, { recursive: true });

  const leads: BookingLead[] = fs.existsSync(leadFile)
    ? JSON.parse(fs.readFileSync(leadFile, "utf8"))
    : [];

  const lead = {
    ...input,
    id: "LEAD-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    createdAt: new Date().toISOString(),
  };

  leads.push(lead);
  fs.writeFileSync(leadFile, JSON.stringify(leads, null, 2));

  return lead;
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
            content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model BookingLead {
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
            title: "Bookings API Route",
            file: "app/api/bookings/route.ts",
            content: `import { NextResponse } from "next/server";
import { validateBookingInput } from "../../../lib/validation";
import { saveBookingLead } from "../../../lib/booking-store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "bookings",
    message: "Booking list endpoint ready for database integration."
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = validateBookingInput(body);
    const booking = await saveBookingLead({
      ...validated,
      source: "bookings-api"
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 400 });
  }
}
`
        },
        {
            type: "typescript",
            title: "Customers API Route",
            file: "app/api/customers/route.ts",
            content: `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    resource: "customers",
    customers: [],
    message: "Customer endpoint scaffold ready for CRM/database integration."
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    ok: true,
    customer: {
      id: "CUS-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
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
            title: "Quotes API Route",
            file: "app/api/quotes/route.ts",
            content: `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const estimatedBaseFare = 95;
  const airportFee = String(body.service || "").toLowerCase().includes("airport") ? 25 : 0;

  return NextResponse.json({
    ok: true,
    quote: {
      service: body.service || "${profile.smokeService}",
      estimatedTotal: estimatedBaseFare + airportFee,
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
            title: "Booking Service",
            file: "lib/services/booking-service.ts",
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
            title: "Fleet Service",
            file: "lib/services/fleet-service.ts",
            content: `export const fleet = [
  { id: "VEH-SEDAN", name: "${profile.modeItemOne}", status: "available" },
  { id: "VEH-SUV", name: "${profile.modeItemTwo}", status: "available" },
  { id: "VEH-CHAUFFEUR", name: "${profile.modeItemThree}", status: "available" },
];

export function listFleet() {
  return fleet;
}
`
        },
        {
            type: "typescript",
            title: "Customer Service",
            file: "lib/services/customer-service.ts",
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
            title: "Fleet API Route",
            file: "app/api/fleet/route.ts",
            content: `import { NextResponse } from "next/server";
import { listFleet } from "../../../lib/services/fleet-service";

export async function GET() {
  return NextResponse.json({
    ok: true,
    fleet: listFleet(),
  });
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
            title: "Admin Fleet Page",
            file: "app/admin/fleet/page.tsx",
            content: `export default function AdminFleetPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Fleet</p>
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
            title: "Admin Dispatch Page",
            file: "app/admin/dispatch/page.tsx",
            content: `export default function AdminDispatchPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Dispatch</p>
      <h1 className="mt-4 text-5xl font-black">Dispatch Operations</h1>
      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">Assign drivers, vehicles, and booking statuses from this workflow board.</p>
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
      <h1 className="mt-4 text-5xl font-black">${profile.adminTitle}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <a className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8" href="/admin/bookings">
          <h2 className="text-2xl font-black">Bookings</h2>
          <p className="mt-3 text-zinc-400">Review new production requests and delivery workflow.</p>
        </a>

        <a className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8" href="/admin/customers">
          <h2 className="text-2xl font-black">Customers</h2>
          <p className="mt-3 text-zinc-400">Manage customer profiles and contact records.</p>
        </a>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">Fleet</h2>
          <p className="mt-3 text-zinc-400">Track executive vehicles and service availability.</p>
        </div>
      </div>
    </main>
  );
}
`
        },
        {
            type: "typescript",
            title: "Admin Bookings Page",
            file: "app/admin/bookings/page.tsx",
            content: `export default function AdminBookingsPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Bookings</p>
      <h1 className="mt-4 text-5xl font-black">Booking Requests</h1>

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">
          Connect this view to production request records for live delivery operations.
        </p>
      </section>
    </main>
  );
}
`
        },
        {
            type: "typescript",
            title: "Admin Customers Page",
            file: "app/admin/customers/page.tsx",
            content: `export default function AdminCustomersPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Customers</p>
      <h1 className="mt-4 text-5xl font-black">Customer CRM</h1>

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">
          Connect this view to customer records, ride history, quote history, and VIP profiles.
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
            content: `export type UserRole = "admin" | "dispatcher" | "customer";

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
  matcher: ["/admin/:path*", "/dispatcher/:path*", "/customer/:path*"],
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
        <p className="mt-4 text-zinc-400">Demo auth scaffold for customer, dispatcher, and admin access.</p>

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
            title: "Customer Portal",
            file: "app/customer/page.tsx",
            content: `export default function CustomerPortal() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Customer Portal</p>
      <h1 className="mt-4 text-5xl font-black">My Rides</h1>

      <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-zinc-400">
          Connect this portal to bookings, quote history, invoices, and customer profile records.
        </p>
      </section>
    </main>
  );
}
`
        },
        {
            type: "typescript",
            title: "Dispatcher Portal",
            file: "app/dispatcher/page.tsx",
            content: `export default function DispatcherPortal() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-red-300">Dispatcher</p>
      <h1 className="mt-4 text-5xl font-black">Dispatch Board</h1>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">New Requests</h2>
          <p className="mt-3 text-zinc-400">Incoming reservations awaiting review.</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">Assigned Trips</h2>
          <p className="mt-3 text-zinc-400">Trips assigned to drivers or fleet resources.</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">Fleet Status</h2>
          <p className="mt-3 text-zinc-400">Vehicle readiness and availability overview.</p>
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
import { Fleet } from "../components/Fleet";
import { ServiceAreaMap } from "../components/ServiceAreaMap";
import { BookingForm } from "../components/BookingForm";
import { Testimonials } from "../components/Testimonials";
import { Footer } from "../components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Fleet />
      <ServiceAreaMap />
      <BookingForm />
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
  description: "${isTransport ? tagline : run.prompt}",
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
      dropoff: "Downtown Chicago",
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
    for (const file of files) {
        write(path.join(outDir, file.file), file.content);
    }
    return files.map((file) => ({
        type: file.type,
        title: file.title,
        path: path.join(outDir, file.file),
        status: "generated"
    }));
}
