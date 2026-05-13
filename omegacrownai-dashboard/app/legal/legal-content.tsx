type LegalSection = {
  heading: string;
  body: string[];
};

type LegalPolicy = {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
};

export const policies: Record<string, LegalPolicy> = {
  terms: {
    title: "Terms of Service",
    effectiveDate: "May 13, 2026",
    intro:
      "These Terms of Service govern access to and use of OmegaCrownAI, including the dashboard, automation tools, publishing workflows, marketplace features, customer organization tools, and related services.",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: [
          "By creating an account, accessing the platform, starting a subscription, connecting a provider account, or using any OmegaCrownAI service, you agree to these Terms.",
          "If you use OmegaCrownAI on behalf of a company or organization, you represent that you have authority to bind that organization to these Terms."
        ]
      },
      {
        heading: "Platform Services",
        body: [
          "OmegaCrownAI provides AI-assisted business, creative, publishing, automation, execution, provider activation, billing, and operational workflow tools.",
          "Some features rely on third-party providers, including payment processors, publishing platforms, model providers, storage providers, and infrastructure vendors."
        ]
      },
      {
        heading: "Accounts and Security",
        body: [
          "You are responsible for maintaining the confidentiality of your account credentials, connected integrations, API keys, provider tokens, and organization access.",
          "You must promptly notify us of unauthorized access, suspected compromise, or misuse of your account."
        ]
      },
      {
        heading: "Customer Content",
        body: [
          "You retain ownership of content, prompts, files, uploads, outputs, assets, brand materials, and business data that you submit to OmegaCrownAI.",
          "You grant OmegaCrownAI the limited rights necessary to host, process, transmit, display, transform, and generate outputs from your content for the purpose of providing the service."
        ]
      },
      {
        heading: "Acceptable Use",
        body: [
          "You may not use OmegaCrownAI to violate law, infringe intellectual property rights, distribute malware, bypass security controls, abuse provider systems, generate deceptive impersonation content, or interfere with platform operations.",
          "You are responsible for reviewing generated content, publishing actions, automation outputs, financial workflows, and external provider actions before relying on them."
        ]
      },
      {
        heading: "Billing and Subscriptions",
        body: [
          "Paid plans, usage-based charges, provider costs, add-ons, taxes, and renewal terms are governed by the Billing Policy and any plan-specific terms shown at checkout.",
          "You authorize OmegaCrownAI and its payment processors to charge the payment method associated with your account for applicable fees."
        ]
      },
      {
        heading: "Third-Party Providers",
        body: [
          "Third-party providers are governed by their own terms, privacy practices, rate limits, content policies, and service availability.",
          "OmegaCrownAI is not responsible for provider outages, declined transactions, publishing restrictions, model limitations, account suspensions, or policy enforcement by third-party providers."
        ]
      },
      {
        heading: "Disclaimers",
        body: [
          "OmegaCrownAI is provided on an as-is and as-available basis. We do not guarantee uninterrupted operation, error-free output, legal compliance of generated material, provider availability, or business results.",
          "You are responsible for final review of legal, financial, operational, medical, regulated, or high-impact decisions."
        ]
      },
      {
        heading: "Limitation of Liability",
        body: [
          "To the maximum extent permitted by law, OmegaCrownAI will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages.",
          "Our aggregate liability for claims relating to the service will not exceed the amounts paid by you to OmegaCrownAI during the three months before the claim arose."
        ]
      },
      {
        heading: "Changes to Terms",
        body: [
          "We may update these Terms from time to time. Material changes will be reflected by updating the effective date or providing reasonable notice through the platform."
        ]
      }
    ]
  },

  privacy: {
    title: "Privacy Policy",
    effectiveDate: "May 13, 2026",
    intro:
      "This Privacy Policy explains how OmegaCrownAI collects, uses, stores, protects, and shares information when you use the platform, websites, dashboards, APIs, integrations, and related services.",
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "We may collect account information, organization details, billing information, authentication data, uploaded files, prompts, generated outputs, usage logs, device information, support communications, and integration metadata.",
          "When you connect third-party providers, we may process tokens, account identifiers, publishing metadata, billing references, and provider status information needed to operate the integration."
        ]
      },
      {
        heading: "How We Use Information",
        body: [
          "We use information to provide the service, operate workflows, process billing, authenticate users, manage organizations, support provider integrations, improve reliability, detect abuse, provide support, and comply with legal obligations.",
          "We may use aggregated or de-identified information to improve platform performance, safety, reliability, and product quality."
        ]
      },
      {
        heading: "Customer Content and AI Processing",
        body: [
          "Customer content may be processed by OmegaCrownAI systems and selected third-party AI, infrastructure, storage, payment, or publishing providers as needed to deliver requested features.",
          "You are responsible for ensuring that you have the rights and permissions needed to submit content to the platform."
        ]
      },
      {
        heading: "Sharing of Information",
        body: [
          "We share information with service providers that help us operate OmegaCrownAI, including hosting, analytics, security, payment, support, AI model, publishing, and storage providers.",
          "We may disclose information when required by law, to protect rights and safety, to investigate misuse, or in connection with a merger, acquisition, financing, or sale of assets."
        ]
      },
      {
        heading: "Data Retention",
        body: [
          "We retain information for as long as needed to provide the service, satisfy legal obligations, resolve disputes, enforce agreements, maintain audit records, and support business operations.",
          "Deletion requests may be limited where retention is required for security, legal, tax, billing, fraud prevention, backup, or compliance reasons."
        ]
      },
      {
        heading: "Security",
        body: [
          "We use reasonable administrative, technical, and organizational safeguards designed to protect information against unauthorized access, loss, misuse, or alteration.",
          "No system is completely secure, and you are responsible for protecting credentials, connected accounts, API keys, and administrative access."
        ]
      },
      {
        heading: "Your Choices",
        body: [
          "Depending on your location and account type, you may request access, correction, deletion, export, or restriction of certain personal information.",
          "You may also manage cookies, connected integrations, billing settings, and team access through available account controls."
        ]
      },
      {
        heading: "Contact",
        body: [
          "Privacy requests may be submitted through the support or contact channels made available by OmegaCrownAI."
        ]
      }
    ]
  },

  dpa: {
    title: "Data Processing Addendum",
    effectiveDate: "May 13, 2026",
    intro:
      "This Data Processing Addendum applies when OmegaCrownAI processes personal data on behalf of a customer in connection with the services.",
    sections: [
      {
        heading: "Roles",
        body: [
          "For customer content and personal data submitted by or on behalf of a customer, the customer is the controller or business, and OmegaCrownAI acts as processor or service provider as applicable.",
          "For account administration, billing, security, analytics, and platform operations, OmegaCrownAI may act as an independent controller where permitted by law."
        ]
      },
      {
        heading: "Processing Instructions",
        body: [
          "OmegaCrownAI will process customer personal data to provide, secure, support, maintain, and improve the services, and as otherwise instructed by the customer through use of the platform.",
          "Customers are responsible for ensuring that instructions comply with applicable law and that they have provided required notices and obtained required rights or consents."
        ]
      },
      {
        heading: "Subprocessors",
        body: [
          "OmegaCrownAI may use subprocessors for hosting, storage, analytics, security, AI processing, billing, support, communications, publishing, and infrastructure operations.",
          "OmegaCrownAI will require subprocessors to protect personal data using commercially reasonable confidentiality, security, and data protection obligations."
        ]
      },
      {
        heading: "Security Measures",
        body: [
          "OmegaCrownAI maintains reasonable technical and organizational measures designed to protect personal data, including access controls, credential protection, audit practices, environment separation, and operational safeguards.",
          "Security measures may evolve over time as the platform, providers, and threat environment change."
        ]
      },
      {
        heading: "Assistance",
        body: [
          "Taking into account the nature of processing and available information, OmegaCrownAI will provide reasonable assistance for data subject requests, security obligations, and compliance inquiries.",
          "Customer remains responsible for responding to legal requests directed to the customer."
        ]
      },
      {
        heading: "Deletion and Return",
        body: [
          "Upon termination or written request, OmegaCrownAI will delete or return customer personal data where technically feasible, unless retention is required for legal, billing, security, backup, fraud prevention, or legitimate business purposes."
        ]
      },
      {
        heading: "International Transfers",
        body: [
          "Where personal data is transferred internationally, OmegaCrownAI will use appropriate transfer mechanisms where required by applicable law."
        ]
      }
    ]
  },

  refund: {
    title: "Refund Policy",
    effectiveDate: "May 13, 2026",
    intro:
      "This Refund Policy explains how OmegaCrownAI handles refunds, subscription cancellations, provider charges, and payment disputes.",
    sections: [
      {
        heading: "Subscription Fees",
        body: [
          "Subscription fees are generally billed in advance and are non-refundable except where required by law or expressly stated in writing.",
          "Canceling a subscription stops future renewals but does not automatically refund charges already incurred."
        ]
      },
      {
        heading: "Usage-Based Charges",
        body: [
          "Usage-based charges, provider pass-through costs, rendering costs, storage costs, publishing execution costs, and premium model usage are non-refundable once incurred.",
          "These costs may be charged by third-party providers even when an output is rejected, delayed, rate-limited, or requires revision."
        ]
      },
      {
        heading: "Duplicate or Erroneous Charges",
        body: [
          "If you believe you were charged in error or charged twice for the same transaction, contact support with the account email, organization, invoice, and transaction details.",
          "Verified duplicate or erroneous charges may be refunded or credited at OmegaCrownAI’s discretion."
        ]
      },
      {
        heading: "Provider Failures",
        body: [
          "Provider outages, rejected publishing attempts, model limitations, payment processor declines, third-party policy enforcement, or external account restrictions do not automatically qualify for refunds.",
          "OmegaCrownAI may provide credits when a platform-controlled issue materially prevents paid service access."
        ]
      },
      {
        heading: "Chargebacks",
        body: [
          "Initiating a chargeback may result in account restrictions while the dispute is reviewed.",
          "Customers should contact support first so billing issues can be investigated and resolved directly where possible."
        ]
      }
    ]
  },

  billing: {
    title: "Billing Policy",
    effectiveDate: "May 13, 2026",
    intro:
      "This Billing Policy governs subscriptions, renewals, invoices, usage charges, taxes, trials, cancellations, and payment processing for OmegaCrownAI.",
    sections: [
      {
        heading: "Billing Authorization",
        body: [
          "By selecting a paid plan or using paid features, you authorize OmegaCrownAI and its payment processors to charge your payment method for subscription fees, usage charges, add-ons, taxes, and applicable provider costs.",
          "You are responsible for keeping billing information accurate and up to date."
        ]
      },
      {
        heading: "Subscriptions and Renewals",
        body: [
          "Subscriptions renew automatically unless canceled before the renewal date.",
          "Plan limits, included usage, premium provider access, and feature availability may vary by plan."
        ]
      },
      {
        heading: "Usage and Provider Costs",
        body: [
          "Some features may generate usage-based charges, including AI provider usage, rendering, storage, publishing execution, premium workflow runs, external payment links, and connected provider services.",
          "Usage may continue to accrue until workflows, schedules, automations, or provider connections are disabled."
        ]
      },
      {
        heading: "Failed Payments",
        body: [
          "If a payment fails, OmegaCrownAI may retry the payment method, request updated billing information, downgrade access, pause workflows, disable paid features, or suspend the account.",
          "The customer remains responsible for amounts incurred before suspension or cancellation."
        ]
      },
      {
        heading: "Taxes",
        body: [
          "Prices may exclude taxes unless otherwise stated. Customers are responsible for applicable taxes, duties, levies, and similar assessments."
        ]
      },
      {
        heading: "Cancellations",
        body: [
          "Customers may cancel through available account controls or by contacting support where self-service cancellation is unavailable.",
          "Cancellation does not remove responsibility for outstanding invoices, usage charges, provider charges, or fees already incurred."
        ]
      }
    ]
  },

  cookies: {
    title: "Cookie Notice",
    effectiveDate: "May 13, 2026",
    intro:
      "This Cookie Notice explains how OmegaCrownAI uses cookies, local storage, pixels, SDKs, and similar technologies across its websites and platform.",
    sections: [
      {
        heading: "Types of Cookies",
        body: [
          "Essential cookies are used for authentication, security, session management, load balancing, fraud prevention, and core platform functionality.",
          "Analytics and performance technologies help us understand usage, diagnose errors, improve reliability, and measure product performance.",
          "Preference technologies may remember settings such as interface choices, onboarding state, and account preferences."
        ]
      },
      {
        heading: "Third-Party Technologies",
        body: [
          "Some third-party providers may set cookies or process identifiers when providing payment, analytics, security, support, infrastructure, or embedded integration services.",
          "Those providers are responsible for their own cookie and privacy practices."
        ]
      },
      {
        heading: "Managing Cookies",
        body: [
          "You can control cookies through browser settings, device settings, and any consent controls that may be presented in the product.",
          "Disabling certain cookies may prevent login, billing, provider connections, dashboard functionality, or security features from working correctly."
        ]
      },
      {
        heading: "Changes",
        body: [
          "We may update this Cookie Notice as platform features, providers, or legal requirements change."
        ]
      }
    ]
  },

  providers: {
    title: "Provider Disclosure",
    effectiveDate: "May 13, 2026",
    intro:
      "OmegaCrownAI connects with third-party providers to support AI generation, publishing, payments, storage, automation, communications, analytics, and infrastructure.",
    sections: [
      {
        heading: "Provider Categories",
        body: [
          "Provider categories may include AI model providers, payment processors, OAuth publishing platforms, social platforms, storage vendors, rendering services, email providers, analytics tools, hosting providers, observability tools, and support systems.",
          "Specific providers may vary by plan, region, feature, customer configuration, and availability."
        ]
      },
      {
        heading: "Customer-Controlled Connections",
        body: [
          "When you connect a provider account, you authorize OmegaCrownAI to access, transmit, receive, and process information from that provider as needed to provide the requested feature.",
          "You are responsible for provider account permissions, external account compliance, connected credentials, publishing rights, and third-party terms."
        ]
      },
      {
        heading: "Provider Availability",
        body: [
          "Third-party providers may experience outages, delays, rate limits, model changes, policy changes, declined transactions, account reviews, or regional limitations.",
          "OmegaCrownAI does not guarantee uninterrupted availability or acceptance by any external provider."
        ]
      },
      {
        heading: "Data Shared With Providers",
        body: [
          "Depending on the feature used, OmegaCrownAI may share prompts, content, media, metadata, billing references, publishing instructions, account identifiers, files, generated assets, and technical logs with providers.",
          "Data sharing is limited to what is reasonably needed to provide, secure, troubleshoot, and improve the requested service."
        ]
      },
      {
        heading: "Customer Responsibility",
        body: [
          "Customers must review provider terms and ensure they have rights to submit, generate, publish, store, or monetize content through connected services.",
          "Customers are responsible for final approval of generated outputs, scheduled publishing, external payment links, and automation actions."
        ]
      }
    ]
  }
};

export function LegalPage({ policy }: { policy: LegalPolicy }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-900">
      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          OmegaCrownAI Legal
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{policy.title}</h1>
        <p className="mt-4 text-sm text-slate-500">
          Effective date: {policy.effectiveDate}
        </p>
        <p className="mt-6 text-lg leading-8 text-slate-700">{policy.intro}</p>
      </div>

      <div className="space-y-6">
        {policy.sections.map((section) => (
          <section
            key={section.heading}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold tracking-tight">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-slate-700">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
        This page is provided for operational transparency and platform governance.
        It should be reviewed by qualified counsel before being relied on as legal advice.
      </div>
    </main>
  );
}
