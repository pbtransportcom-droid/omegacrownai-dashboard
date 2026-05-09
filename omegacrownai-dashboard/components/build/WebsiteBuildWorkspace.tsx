"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type WebsiteBuildWorkspaceProps = {
  project: any;
  builds: any[];
  activeBuild: any;
  draft: any;
};

function sectionTitle(section: any) {
  return (
    section?.content?.heading ||
    section?.content?.headline ||
    section?.content?.title ||
    section?.id ||
    section?.type ||
    "Section"
  );
}

function updateContentField(content: any, key: string, value: string) {
  return {
    ...(content || {}),
    [key]: value,
  };
}

export default function WebsiteBuildWorkspace({
  project,
  builds,
  activeBuild,
  draft,
}: WebsiteBuildWorkspaceProps) {
  const [currentDraft, setCurrentDraft] = useState(draft);
  const [activePageSlug, setActivePageSlug] = useState(
    draft?.pages?.[0]?.slug || "home"
  );
  const [saving, setSaving] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");

  const activePage = useMemo(() => {
    return (
      currentDraft?.pages?.find((page: any) => page.slug === activePageSlug) ||
      currentDraft?.pages?.[0] ||
      null
    );
  }, [currentDraft, activePageSlug]);

  async function saveDraft(updatedDraft: any) {
    setCurrentDraft(updatedDraft);
    setSaving("Saving...");

    try {
      const res = await fetch(`/api/projects/${project.id}/builder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buildId: activeBuild.id,
          draft: updatedDraft,
          kind: "website_draft_v1",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Save failed.");
      }

      setSaving("Saved");
      setTimeout(() => setSaving(""), 1500);
    } catch (error: any) {
      setSaving(error?.message || "Save failed.");
    }
  }

  function updateSection(sectionId: string, content: any) {
    const updated = {
      ...currentDraft,
      pages: currentDraft.pages.map((page: any) =>
        page.slug === activePageSlug
          ? {
              ...page,
              sections: page.sections.map((section: any) =>
                section.id === sectionId ? { ...section, content } : section
              ),
            }
          : page
      ),
    };

    saveDraft(updated);
  }

  async function publish() {
    setPublishedUrl("Publishing...");

    try {
      const slug = `${project.name}-${activeBuild.id}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70);

      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buildId: activeBuild.id,
          builderId: "website",
          slug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Publish failed.");
      }

      setPublishedUrl(data.fullUrl || data.url || "Published");
    } catch (error: any) {
      setPublishedUrl(error?.message || "Publish failed.");
    }
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-6 text-red-200">
        Project not found.
      </div>
    );
  }

  if (!currentDraft || !activeBuild) {
    return (
      <div className="space-y-4">
        <Link href="/projects" className="text-sm text-cyan-300 hover:underline">
          Back to projects
        </Link>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-6 text-yellow-100">
          No website draft found for this project yet.
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-120px)] gap-5 xl:grid-cols-[280px_1fr_1fr]">
      <aside className="rounded-2xl border border-border bg-panel/70 p-4">
        <Link href="/projects" className="text-xs text-cyan-300 hover:underline">
          ← Projects
        </Link>

        <h1 className="mt-4 text-lg font-bold text-white">{project.name}</h1>
        <p className="mt-1 text-xs text-muted">Sugent Website Builder</p>

        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Builds
          </div>
          <div className="mt-2 space-y-2">
            {builds.map((build) => (
              <Link
                key={build.id}
                href={`/build/website/${project.id}?buildId=${build.id}`}
                className={`block rounded-xl border px-3 py-2 text-xs ${
                  build.id === activeBuild.id
                    ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                    : "border-border bg-black/20 text-muted"
                }`}
              >
                <div className="font-semibold">{build.label}</div>
                <div className="mt-1">
                  {build.status} · {build.domain || "website"}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Pages
          </div>
          <div className="mt-2 space-y-2">
            {currentDraft.pages?.map((page: any) => (
              <button
                key={page.slug}
                onClick={() => setActivePageSlug(page.slug)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-xs ${
                  page.slug === activePageSlug
                    ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
                    : "border-border bg-black/20 text-muted"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={publish}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-black text-white"
        >
          Publish Website
        </button>

        {saving && (
          <div className="mt-3 rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-muted">
            {saving}
          </div>
        )}

        {publishedUrl && (
          <div className="mt-3 break-words rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            {publishedUrl.startsWith("http") ? (
              <a href={publishedUrl} target="_blank" className="hover:underline">
                {publishedUrl}
              </a>
            ) : (
              publishedUrl
            )}
          </div>
        )}
      </aside>

      <main className="rounded-2xl border border-border bg-panel/70 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Structured Editor
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {activePage?.title || "Home"}
            </h2>
          </div>
          <div className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
            {currentDraft.version}
          </div>
        </div>

        <div className="space-y-4">
          {activePage?.sections?.map((section: any) => (
            <div
              key={section.id}
              className="rounded-2xl border border-border bg-black/20 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted">
                    {section.type}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {sectionTitle(section)}
                  </div>
                </div>
                <div className="rounded-full bg-slate-800 px-2 py-1 text-[11px] text-muted">
                  {section.id}
                </div>
              </div>

              <SectionEditor
                section={section}
                onChange={(content: any) => updateSection(section.id, content)}
              />
            </div>
          ))}
        </div>
      </main>

      <section className="rounded-2xl border border-border bg-white p-5 text-slate-950">
        <div className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Live Preview
        </div>
        <WebsitePreview draft={currentDraft} page={activePage} />
      </section>
    </div>
  );
}

function SectionEditor({ section, onChange }: { section: any; onChange: any }) {
  const c = section.content || {};

  if (section.type === "hero") {
    return (
      <div className="space-y-3">
        <Field
          label="Headline"
          value={c.headline || c.heading || ""}
          onChange={(value: string) =>
            onChange({
              ...c,
              headline: value,
              heading: value,
            })
          }
        />
        <Field
          label="Subheadline"
          value={c.subheadline || c.subheading || ""}
          onChange={(value: string) =>
            onChange({
              ...c,
              subheadline: value,
              subheading: value,
            })
          }
        />
        <Field
          label="Primary CTA"
          value={c.primaryCtaLabel || c.ctaLabel || ""}
          onChange={(value: string) =>
            onChange(updateContentField(c, "primaryCtaLabel", value))
          }
        />
      </div>
    );
  }

  if (section.type === "cta") {
    return (
      <div className="space-y-3">
        <Field
          label="Heading"
          value={c.heading || ""}
          onChange={(value: string) => onChange(updateContentField(c, "heading", value))}
        />
        <Field
          label="Subheading"
          value={c.subheading || ""}
          onChange={(value: string) =>
            onChange(updateContentField(c, "subheading", value))
          }
        />
        <Field
          label="CTA Label"
          value={c.ctaLabel || ""}
          onChange={(value: string) => onChange(updateContentField(c, "ctaLabel", value))}
        />
      </div>
    );
  }

  return (
    <textarea
      className="min-h-[180px] w-full rounded-xl border border-border bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none"
      value={JSON.stringify(c, null, 2)}
      onChange={(event) => {
        try {
          onChange(JSON.parse(event.target.value));
        } catch {
          // keep typing until valid JSON
        }
      }}
    />
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: any;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-border bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function WebsitePreview({ draft, page }: { draft: any; page: any }) {
  const brand = draft?.brand || {};
  const sections = page?.sections || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="bg-slate-950 px-5 py-4 text-white">
        <div className="text-xs uppercase tracking-[0.18em] text-amber-300">
          {brand.tagline || "Your premium website"}
        </div>
        <div className="mt-1 text-lg font-bold">{brand.name || draft.projectName}</div>
      </div>

      <div className="space-y-0">
        {sections.map((section: any) => (
          <PreviewSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function PreviewSection({ section }: { section: any }) {
  const c = section.content || {};

  if (section.type === "hero") {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12 text-white">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex rounded-full border border-amber-300/40 px-3 py-1 text-xs text-amber-200">
            Premium Service
          </div>
          <h1 className="text-3xl font-black">
            {c.headline || c.heading || "Hero headline"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            {c.subheadline || c.subheading || "Hero subheadline"}
          </p>
          <button className="mt-6 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950">
            {c.primaryCtaLabel || c.ctaLabel || "Get Started"}
          </button>
        </div>
      </div>
    );
  }

  if (section.type === "features") {
    const items = c.items || [];

    return (
      <div className="px-6 py-8">
        <h2 className="text-xl font-bold">{c.heading || "Features"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4">
              <div className="font-bold">{item.title}</div>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "cta") {
    return (
      <div className="bg-slate-100 px-6 py-8">
        <h2 className="text-xl font-bold">{c.heading || "Call to action"}</h2>
        <p className="mt-2 text-sm text-slate-600">{c.subheading}</p>
        <button className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
          {c.ctaLabel || "Start"}
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h2 className="text-xl font-bold">{c.heading || sectionTitle(section)}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {c.body || c.description || JSON.stringify(c).slice(0, 240)}
      </p>
    </div>
  );
}
