import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          OmegaCrownAI
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Checkout Canceled
        </h1>

        <p className="mt-4 text-zinc-400">
          Your payment was not completed. You can return to the upgrade page
          whenever you are ready.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/account/upgrade"
            className="rounded-2xl bg-yellow-400 p-4 text-center font-black text-black"
          >
            Return to Upgrade
          </Link>

          <Link
            href="/account"
            className="rounded-2xl border border-zinc-700 p-4 text-center font-black text-white"
          >
            Go to Account
          </Link>
        </div>
      </section>
    </main>
  );
}
