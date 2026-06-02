export default function AccountPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black">
        Account Dashboard
      </h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-black">
            Current Plan
          </h2>
          <p className="mt-2 text-yellow-400">
            Free
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-black">
            Usage
          </h2>
          <p className="mt-2">
            Track platform consumption
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="font-black">
            Billing
          </h2>
          <p className="mt-2">
            Subscription management
          </p>
        </div>
      </div>
    </main>
  );
}
