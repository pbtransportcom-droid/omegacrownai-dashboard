export type PaymentProviderStatus = "active" | "manual" | "disabled";

export type PaymentProviderPolicy = {
  provider: "square" | "swipesimple" | "manual" | "stripe";
  status: PaymentProviderStatus;
  primary: boolean;
  label: string;
  description: string;
  customerAction: string;
};

export const paymentProviderPolicies: PaymentProviderPolicy[] = [
  {
    provider: "square",
    status: "active",
    primary: true,
    label: "Square",
    description:
      "Square is an active primary payment path for OmegaCrownAI customer payments.",
    customerAction:
      "Use the Square payment link or contact support for manual confirmation."
  },
  {
    provider: "swipesimple",
    status: "active",
    primary: true,
    label: "SwipeSimple",
    description:
      "SwipeSimple is an active primary payment path for OmegaCrownAI customer payments.",
    customerAction:
      "Use the SwipeSimple payment link or contact support for manual confirmation."
  },
  {
    provider: "manual",
    status: "manual",
    primary: false,
    label: "Manual Billing",
    description:
      "Manual billing is available for onboarding, enterprise review, offline payment, and admin-confirmed subscriptions.",
    customerAction:
      "Contact OmegaCrownAI support or an administrator for manual payment confirmation."
  },
  {
    provider: "stripe",
    status: "disabled",
    primary: false,
    label: "Stripe",
    description:
      "Stripe is not configured for this OmegaCrownAI deployment. Stripe checkout is disabled gracefully so missing Stripe credentials do not cause runtime errors.",
    customerAction:
      "Use Square, SwipeSimple, or manual billing instead."
  }
];

export function getPaymentProviderSummary() {
  return {
    phase: "v7.8 Phase 99",
    status: "square_swipesimple_primary",
    customerMessage:
      "OmegaCrownAI currently uses Square, SwipeSimple, and manual billing as active payment paths. Stripe is disabled unless configured in a future deployment.",
    primaryProviders: paymentProviderPolicies.filter((provider) => provider.primary),
    disabledProviders: paymentProviderPolicies.filter(
      (provider) => provider.status === "disabled"
    ),
    allProviders: paymentProviderPolicies
  };
}

export function getStripeDisabledResponse() {
  return {
    ok: false,
    provider: "stripe",
    status: "disabled",
    message:
      "Stripe checkout is not configured for this OmegaCrownAI deployment. Please use Square, SwipeSimple, or manual billing.",
    activeProviders: ["square", "swipesimple", "manual"]
  };
}
