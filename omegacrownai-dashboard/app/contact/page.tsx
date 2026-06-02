import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          OmegaCrownAI
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Contact OmegaCrownAI
        </h1>

        <p className="mt-4 text-zinc-400">
          For billing, enterprise plans, trading access, support, or custom AI deployments,
          contact the OmegaCrownAI team.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <h2 className="font-black">Support</h2>
            <p className="mt-2 text-zinc-400">support@omegacrownai.com</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <h2 className="font-black">Company</h2>
            <p className="mt-2 text-zinc-400">
              Princess Benjamin Transportation Company
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/pricing" className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
            View Pricing
          </Link>

          <Link href="/account/upgrade" className="rounded-xl border border-zinc-700 px-5 py-3 font-black">
            Upgrade Account
          </Link>
        </div>
      </section>
    </main>
  );
}
