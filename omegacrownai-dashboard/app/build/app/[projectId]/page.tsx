import Link from "next/link";

export default function OldAppBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Old App Builder Route
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          App Builder moved to Projects
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          This old demo page is only a placeholder. Use Projects to create a real
          saved workspace and build from there.
        </p>
      </div>

      <Link
        href="/projects"
        className="inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white"
      >
        Open Projects
      </Link>
    </div>
  );
}
