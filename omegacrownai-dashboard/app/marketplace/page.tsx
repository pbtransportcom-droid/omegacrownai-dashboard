import { prisma } from "@/lib/db";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain } = await searchParams;

  const [agents, tools, templates] = await Promise.all([
    prisma.marketplaceAgent.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketplaceTool.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketplaceTemplate.findMany({
      where: {
        status: "active",
        ...(domain ? { domain } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-border bg-panel/70 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">
          Sugent OS
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Marketplace</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          Install templates, register agents, and connect tools for Website,
          Trading, and Automation builders.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <a className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/5" href="/marketplace">
            All
          </a>
          <a className="rounded-xl border border-cyan-400/30 px-3 py-2 text-xs text-cyan-100 hover:bg-cyan-500/10" href="/marketplace?domain=website">
            Website
          </a>
          <a className="rounded-xl border border-emerald-400/30 px-3 py-2 text-xs text-emerald-100 hover:bg-emerald-500/10" href="/marketplace?domain=trading">
            Trading
          </a>
          <a className="rounded-xl border border-violet-400/30 px-3 py-2 text-xs text-violet-100 hover:bg-violet-500/10" href="/marketplace?domain=automation">
            Automation
          </a>
        </div>
      </section>

      <MarketplaceSection title="Templates" empty="No templates installed yet.">
        {templates.map((template) => (
          <Card
            key={template.id}
            title={template.name}
            eyebrow={`${template.domain} · ${template.draftKind}`}
            description={template.description}
            href={`/marketplace/templates/${template.id}`}
          />
        ))}
      </MarketplaceSection>

      <MarketplaceSection title="Agents" empty="No marketplace agents installed yet.">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            title={agent.name}
            eyebrow={`v${agent.version} · ${agent.status}`}
            description={agent.description}
            href={`/marketplace/agents/${agent.id}`}
          />
        ))}
      </MarketplaceSection>

      <MarketplaceSection title="Tools" empty="No marketplace tools installed yet.">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            title={tool.name}
            eyebrow={tool.status}
            description={tool.description}
            href={`/marketplace/tools/${tool.id}`}
          />
        ))}
      </MarketplaceSection>
    </main>
  );
}

function MarketplaceSection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: any;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;

  return (
    <section className="rounded-3xl border border-border bg-panel/70 p-5">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items && items.length ? (
          items
        ) : (
          <div className="rounded-2xl border border-border bg-black/20 p-4 text-sm text-muted">
            {empty}
          </div>
        )}
      </div>
    </section>
  );
}

function Card({
  title,
  eyebrow,
  description,
  href,
}: {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-border bg-black/20 p-4 hover:bg-white/5"
    >
      <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-300">
        {eyebrow}
      </div>
      <div className="mt-3 text-lg font-black text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </a>
  );
}
