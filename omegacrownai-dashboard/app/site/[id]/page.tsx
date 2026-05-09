import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getOldTheme(data: any) {
  return data?.theme || data?.colors || {
    background: "#0f0a05",
    surface: "#1b1208",
    primary: "#fff7ed",
    secondary: "#facc15",
    accent: "#f97316",
    muted: "#d6b98c",
  };
}

function getSugentTheme(draft: any) {
  return draft?.brand?.colors || {
    background: "#050816",
    primary: "#d4af37",
    accent: "#38bdf8",
    text: "#f8fafc",
  };
}

function text(value: any, fallback = "") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

async function loadSugentPublishedSite(slugOrId: string) {
  const published = await prisma.publishedSite.findUnique({
    where: { slug: slugOrId },
  });

  const buildId = published?.executionId || slugOrId;

  const build = await prisma.projectBuild.findUnique({
    where: { id: buildId },
    include: {
      project: true,
      artifacts: true,
    },
  });

  if (!build) return null;

  const artifact =
    build.artifacts.find((a) => a.kind === "website_draft_v1") ||
    build.artifacts[0];

  if (!artifact) return null;

  return {
    published,
    build,
    project: build.project,
    draft: artifact.payload as any,
  };
}

async function loadOldPublishedSite(slugOrId: string) {
  const published = await prisma.publishedSite.findUnique({
    where: { slug: slugOrId },
  });

  const executionId = published?.executionId || slugOrId;

  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    include: {
      project: true,
    },
  });

  if (!execution) return null;

  return {
    published,
    execution,
    project: execution.project,
    data: execution.execution as any,
  };
}

export default async function PublicGeneratedSite({ params }: PageProps) {
  const { id } = await params;

  const sugent = await loadSugentPublishedSite(id);

  if (sugent?.draft?.version === "website_draft_v1") {
    return <SugentWebsiteRenderer draft={sugent.draft} project={sugent.project} />;
  }

  const oldSite = await loadOldPublishedSite(id);

  if (!oldSite) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Website not found</h1>
          <p className="mt-2 text-white/60">This generated website does not exist.</p>
        </div>
      </main>
    );
  }

  return <OldWebsiteRenderer data={oldSite.data} project={oldSite.project} />;
}

function SugentWebsiteRenderer({ draft, project }: { draft: any; project: any }) {
  const theme = getSugentTheme(draft);
  const brand = draft?.brand || {};
  const page = draft?.pages?.[0] || {};
  const sections = page?.sections || [];

  const hero =
    sections.find((section: any) => section.type === "hero") ||
    sections[0] ||
    null;

  const heroContent = hero?.content || {};

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        background: `radial-gradient(circle at top left, ${theme.accent || "#38bdf8"}33, transparent 30%), linear-gradient(135deg, ${theme.background || "#050816"}, #020617 70%)`,
        color: theme.text || "#f8fafc",
      }}
    >
      <header className="border-b border-white/10 bg-black/20 px-6 py-5 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div
              className="text-xs font-black uppercase tracking-[0.26em]"
              style={{ color: theme.primary || "#d4af37" }}
            >
              {brand.tagline || "Premium Website"}
            </div>
            <div className="mt-1 text-2xl font-black">
              {brand.name || draft.projectName || project?.name || "Sugent Website"}
            </div>
          </div>

          <nav className="flex flex-wrap gap-5 text-sm text-white/75">
            {(draft?.pages || [{ title: "Home" }]).slice(0, 5).map((p: any) => (
              <span key={p.slug || p.title}>{p.title || p.slug}</span>
            ))}
            <span>Contact</span>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:py-24">
        <div>
          <div
            className="mb-5 inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
            style={{
              borderColor: `${theme.primary || "#d4af37"}66`,
              color: theme.primary || "#d4af37",
              background: `${theme.primary || "#d4af37"}14`,
            }}
          >
            {text(brand.tone, "Luxury service")}
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            {heroContent.headline ||
              heroContent.heading ||
              draft.projectName ||
              "Luxury Website Built by Sugent"}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            {heroContent.subheadline ||
              heroContent.subheading ||
              "A premium AI-generated website draft, structured as editable JSON and rendered as a polished public site."}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={heroContent.primaryCtaHref || "#contact"}
              className="rounded-2xl px-6 py-4 text-sm font-black shadow-2xl"
              style={{
                background: theme.primary || "#d4af37",
                color: "#020617",
              }}
            >
              {heroContent.primaryCtaLabel || heroContent.ctaLabel || "Get Started"}
            </a>

            <a
              href={heroContent.secondaryCtaHref || "#services"}
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white backdrop-blur"
            >
              {heroContent.secondaryCtaLabel || "Learn More"}
            </a>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["Premium Design", "Mobile Ready", "AI Structured"].map((badge) => (
              <div
                key={badge}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/85"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-6 rounded-[2rem] blur-3xl"
            style={{ background: `${theme.accent || "#38bdf8"}22` }}
          />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-black/30 p-5">
              <div className="flex h-72 items-center justify-center rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-center">
                <div>
                  <div
                    className="text-5xl font-black"
                    style={{ color: theme.primary || "#d4af37" }}
                  >
                    {brand.name?.slice(0, 2)?.toUpperCase() || "OC"}
                  </div>
                  <div className="mt-3 text-sm text-white/60">
                    {heroContent.backgroundImageHint || "Premium brand visual"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {sections
                .filter((section: any) => section.type !== "hero")
                .slice(0, 3)
                .map((section: any) => (
                  <div key={section.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-sm font-bold">
                      {section.content?.heading || section.content?.title || section.id}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-white/60">
                      {section.content?.body ||
                        section.content?.description ||
                        section.content?.subheading ||
                        `${section.type} section`}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <div id="services">
        {sections
          .filter((section: any) => section.type !== "hero")
          .map((section: any) => (
            <SugentSection key={section.id} section={section} theme={theme} />
          ))}
      </div>

      <footer id="contact" className="border-t border-white/10 bg-black/25 px-6 py-12 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl font-black">
              {brand.name || draft.projectName || project?.name}
            </div>
            <div className="mt-2 text-sm text-white/60">
              {brand.tagline || "Built with Omega Crown AI / Sugent OS."}
            </div>
          </div>

          <a
            href="tel:+17735101467"
            className="rounded-2xl px-6 py-4 text-sm font-black"
            style={{
              background: theme.primary || "#d4af37",
              color: "#020617",
            }}
          >
            Contact Now
          </a>
        </div>
      </footer>
    </main>
  );
}

function SugentSection({ section, theme }: { section: any; theme: any }) {
  const c = section.content || {};

  if (section.type === "features") {
    const items = c.items || [];

    return (
      <section className="mx-auto max-w-7xl px-6 py-14 md:px-12">
        <div className="mb-8">
          <div
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: theme.primary || "#d4af37" }}
          >
            {section.id}
          </div>
          <h2 className="mt-3 text-4xl font-black">{c.heading || "Features"}</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black"
                style={{
                  background: `${theme.primary || "#d4af37"}22`,
                  color: theme.primary || "#d4af37",
                }}
              >
                {index + 1}
              </div>
              <div className="text-xl font-black">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "cta") {
    return (
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur md:p-14">
          <h2 className="text-4xl font-black">{c.heading || "Ready to start?"}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{c.subheading}</p>
          <a
            href={c.ctaHref || "#contact"}
            className="mt-8 inline-flex rounded-2xl px-6 py-4 text-sm font-black"
            style={{
              background: theme.primary || "#d4af37",
              color: "#020617",
            }}
          >
            {c.ctaLabel || "Get Started"}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 md:px-12">
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-8 md:p-12">
        <div
          className="text-xs font-black uppercase tracking-[0.24em]"
          style={{ color: theme.primary || "#d4af37" }}
        >
          {section.type}
        </div>
        <h2 className="mt-3 text-4xl font-black">
          {c.heading || c.title || section.id || "Section"}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-white/70">
          {c.body ||
            c.description ||
            c.subheading ||
            c.serviceArea ||
            JSON.stringify(c).slice(0, 260)}
        </p>

        {Array.isArray(c.items) && (
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {c.items.map((item: any, index: number) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                {typeof item === "string" ? item : item.title || item.description}
              </div>
            ))}
          </div>
        )}

        {(c.phone || c.secondaryPhone || c.website) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {c.phone && (
              <a className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950" href={`tel:${c.phone}`}>
                {c.phone}
              </a>
            )}
            {c.secondaryPhone && (
              <a className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white" href={`tel:${c.secondaryPhone}`}>
                {c.secondaryPhone}
              </a>
            )}
            {c.website && (
              <a className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white" href={c.website}>
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function OldWebsiteRenderer({ data, project }: { data: any; project: any }) {
  const theme = getOldTheme(data);

  const hero = data.hero || {
    eyebrow: "AI Generated Website",
    headline: data.title || "Premium Website",
    subheadline: data.tagline || "Generated by OmegaCrownAI.",
    primaryCta: "Get Started",
    secondaryCta: "Learn More",
  };

  const navigation = data.navigation || data.pages || ["Home", "About", "Contact"];
  const products = data.products || [];
  const features = data.features || [];
  const testimonials = data.testimonials || [];
  const assets = data.assets || {};

  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${theme.background || "#0f0a05"}, #050505)`,
        color: theme.primary || "#fff7ed",
      }}
    >
      <header className="border-b border-white/10 px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {assets.logo && (
              <img
                src={assets.logo}
                alt="Logo"
                className="h-12 w-12 rounded-xl bg-white/10 object-contain p-2"
              />
            )}

            <div>
              <div className="text-xl font-bold">
                {data.business || data.title || project.name}
              </div>
              <div className="text-xs opacity-70">
                {data.style || "Premium AI-generated website"}
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-4 text-sm opacity-80">
            {navigation.slice(0, 6).map((item: string) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:py-24">
        <div>
          <div
            className="mb-5 inline-flex rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              background: `${theme.accent || "#f97316"}22`,
              color: theme.secondary || "#facc15",
            }}
          >
            {hero.eyebrow || "Premium Website"}
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
            {hero.headline || data.title || "Beautiful Website Generated by AI"}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 opacity-75">
            {hero.subheadline ||
              data.tagline ||
              "A polished homepage concept with premium layout, product cards, trust badges, and conversion-focused sections."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              className="rounded-2xl px-6 py-4 text-sm font-bold text-black shadow-xl"
              style={{ background: theme.secondary || "#facc15" }}
            >
              {hero.primaryCta || "Get Started"}
            </button>

            <button className="rounded-2xl border border-white/15 px-6 py-4 text-sm font-bold">
              {hero.secondaryCta || "Learn More"}
            </button>
          </div>
        </div>

        <div
          className="rounded-[2rem] border border-white/10 p-6 shadow-2xl"
          style={{ background: theme.surface || "#1b1208" }}
        >
          <div className="rounded-[1.5rem] bg-white/10 p-5">
            {assets.hero ? (
              <img
                src={assets.hero}
                alt="Hero"
                className="h-64 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="h-64 rounded-2xl bg-gradient-to-br from-white/25 to-white/5" />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 md:grid-cols-3 md:px-12">
        {(features.length > 0
          ? features.slice(0, 3)
          : [
              {
                title: "Premium Layout",
                description: "Hero, cards, trust badges, and strong call-to-action sections.",
              },
              {
                title: "Conversion Focused",
                description: "Designed to turn visitors into customers.",
              },
              {
                title: "Mobile Ready",
                description: "Responsive structure for phone and desktop.",
              },
            ]
        ).map((feature: any, index: number) => (
          <div
            key={index}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="text-xl font-bold">{feature.title}</div>
            <div className="mt-3 text-sm leading-7 opacity-70">
              {feature.description}
            </div>
          </div>
        ))}
      </section>

      {testimonials.length > 0 && (
        <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 md:grid-cols-2 md:px-12">
          {testimonials.slice(0, 2).map((item: any, index: number) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 bg-black/20 p-6"
            >
              <div className="text-lg leading-8 opacity-80">“{item.quote}”</div>
              <div className="mt-4 font-bold">{item.name}</div>
            </div>
          ))}
        </section>
      )}

      <footer className="border-t border-white/10 px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl font-black">
              {data.footer?.headline || "Ready to get started?"}
            </div>
            <div className="mt-2 text-sm opacity-70">
              {data.tagline || "Built with OmegaCrownAI Website Builder."}
            </div>
          </div>

          <button
            className="rounded-2xl px-6 py-4 text-sm font-bold text-black"
            style={{ background: theme.secondary || "#facc15" }}
          >
            {data.footer?.cta || "Contact Us"}
          </button>
        </div>
      </footer>
    </main>
  );
}
