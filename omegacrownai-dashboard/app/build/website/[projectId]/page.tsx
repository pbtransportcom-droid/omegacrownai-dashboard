import Link from "next/link";

export default function OldWebsiteBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Old Builder Route
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Website Builder moved to Projects
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          This old demo page does not generate websites. Use the real project
          workspace to create and save website previews.
        </p>
      </div>

      <Link
        href="/projects"
        className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white"
      >
        Open Real Website Builder
      </Link>
    </div>
  );
}
