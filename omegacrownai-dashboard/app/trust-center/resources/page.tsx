import { trustCenterResources } from "@/lib/trust-center/final-production-trust-center";

const categories = Array.from(new Set(trustCenterResources.map((item) => item.category)));

export default function TrustCenterResourcesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Phase 97
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Trust Center Resources
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700">
          Browse all public trust resources by category, including legal,
          privacy, compliance, security, limitations, release, incident,
          provider, and data protection resources.
        </p>
      </section>

      {categories.map((category) => (
        <section key={category} className="mt-8">
          <h2 className="text-2xl font-semibold capitalize">{category}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {trustCenterResources
              .filter((resource) => resource.category === category)
              .map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{resource.title}</h3>
                      <p className="mt-2 font-mono text-xs text-slate-500">
                        {resource.route}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                      {resource.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    {resource.summary}
                  </p>
                </article>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
