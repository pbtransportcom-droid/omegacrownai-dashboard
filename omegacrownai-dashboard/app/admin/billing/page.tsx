"use client";

import { useState } from "react";

export default function BillingAdminPage() {
  const [userId, setUserId] = useState("default");
  const [plan, setPlan] = useState("free");
  const [result, setResult] = useState<any>(null);

  async function savePlan() {
    const res = await fetch("/api/admin/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        plan,
      }),
    });

    setResult(await res.json());
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-black">
          Billing Admin
        </h1>

        <div className="mt-8 space-y-4">
          <input
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4"
            value={userId}
            onChange={(e) =>
              setUserId(e.target.value)
            }
            placeholder="User ID"
          />

          <select
            value={plan}
            onChange={(e) =>
              setPlan(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4"
          >
            <option value="free">Free</option>
            <option value="pro">Pro Trader</option>
            <option value="elite">Elite Trader</option>
            <option value="enterprise">
              Enterprise
            </option>
          </select>

          <button
            onClick={savePlan}
            className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Update Plan
          </button>
        </div>

        {result && (
          <pre className="mt-8 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
