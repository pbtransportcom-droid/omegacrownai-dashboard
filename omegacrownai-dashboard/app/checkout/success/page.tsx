import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          OmegaCrownAI
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Payment Received
        </h1>

        <p className="mt-4 text-zinc-400">
          Thank you for upgrading. Your payment has been submitted. If your
          account does not upgrade automatically yet, contact support with your
          payment email and selected plan.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/account"
            className="rounded-2xl bg-yellow-400 p-4 text-center font-black text-black"
          >
            Go to Account
          </Link>

          <Link
            href="/trade/command-center"
            className="rounded-2xl border border-zinc-700 p-4 text-center font-black text-white"
          >
            Open Trading
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-5">
          <h2 className="font-black">Manual Activation</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Email support@omegacrownai.com with your payment confirmation if you
            need manual activation.
          </p>
        </div>
      </section>
    </main>
  );
}
