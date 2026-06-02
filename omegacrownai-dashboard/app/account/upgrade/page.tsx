const plans = [
  {
    name: "Pro Trader",
    price: "$49/mo",
    description: "For active traders using King Trading System daily.",
    features: [
      "Unlimited Trading Copilot",
      "Advanced scanner",
      "Portfolio analytics",
      "Trade journal",
    ],
    href: "#square-pro-link",
  },
  {
    name: "Elite Trader",
    price: "$149/mo",
    description: "For serious traders and power users.",
    features: [
      "Everything in Pro",
      "Multi-portfolio tracking",
      "Priority AI processing",
      "Advanced opportunity ranking",
    ],
    href: "#square-elite-link",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams, organizations, and custom deployments.",
    features: [
      "Team access",
      "Custom workflows",
      "Private deployment",
      "Dedicated support",
    ],
    href: "mailto:support@omegacrownai.com",
  },
];

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          OmegaCrownAI
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Upgrade Your Account
        </h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Start with a simple Square payment-link flow now. Full automated billing
          and subscription webhooks can be connected after launch.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <a
              key={plan.name}
              href={plan.href}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 hover:border-yellow-400"
            >
              <h2 className="text-2xl font-black">{plan.name}</h2>
              <p className="mt-2 text-3xl font-black text-yellow-400">
                {plan.price}
              </p>
              <p className="mt-3 text-sm text-zinc-400">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl bg-yellow-400 p-4 text-center font-black text-black">
                {plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
