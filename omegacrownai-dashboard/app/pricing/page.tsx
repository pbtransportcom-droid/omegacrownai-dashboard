import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with OmegaCrownAI.",
    features: [
      "10 Copilot requests/day",
      "1 Portfolio",
      "Basic Scanner",
    ],
    cta: "Start Free",
    href: "/account",
  },
  {
    name: "Pro Trader",
    price: "$49/mo",
    description: "For active traders.",
    features: [
      "Unlimited Copilot",
      "Advanced Scanner",
      "Portfolio Analytics",
      "Trade Journal",
    ],
    cta: "Upgrade to Pro",
    href: "https://square.link/u/VEalNxqW",
  },
  {
    name: "Elite Trader",
    price: "$149/mo",
    description: "For power users and professionals.",
    features: [
      "Everything in Pro",
      "Priority Processing",
      "Multi-Portfolio",
      "Advanced AI Analysis",
    ],
    cta: "Upgrade to Elite",
    href: "https://swipesimple.com/links/lnk_c8438cec197f6459717164e176cf89ea",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Organizations and private deployments.",
    features: [
      "Teams",
      "Private Runtime",
      "Custom Workflows",
      "Dedicated Support",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">
          OmegaCrownAI
        </p>

        <h1 className="mt-4 text-6xl font-black">
          Pricing
        </h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Choose the plan that fits your trading and AI automation needs.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h2 className="text-2xl font-black">{plan.name}</h2>

              <p className="mt-3 text-4xl font-black text-yellow-400">
                {plan.price}
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <a
                href={plan.href}
                className="mt-8 block rounded-xl bg-yellow-400 p-4 text-center font-black text-black"
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
