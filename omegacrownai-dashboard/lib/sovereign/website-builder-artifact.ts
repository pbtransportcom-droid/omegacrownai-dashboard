export function getWebsiteBuilderArtifact() {
  return {
    department: "website",
    artifactType: "customer_ready_website_artifact",
    outputMode: "website_pages_copy_seo_deployment",
    readiness: "starter_artifact_ready",
    pageTree: [
      {
        path: "/",
        title: "Home",
        purpose: "High-converting landing page with clear value proposition, trust proof, services, and CTA.",
      },
      {
        path: "/about",
        title: "About",
        purpose: "Company story, credibility, mission, and why customers should trust the brand.",
      },
      {
        path: "/services",
        title: "Services",
        purpose: "Detailed service offerings, customer use cases, and conversion blocks.",
      },
      {
        path: "/contact",
        title: "Contact",
        purpose: "Lead capture, phone/email CTA, service area, and next-step instructions.",
      },
    ],
    homepageSections: [
      {
        section: "Hero",
        headline: "Build a premium online presence that customers can trust.",
        copy: "Launch a polished website with clear messaging, strong calls to action, and a structure designed to convert visitors into customers.",
        cta: "Start Website Project",
      },
      {
        section: "Services",
        headline: "Show what your company does best.",
        copy: "Present services in a clean, scannable format so customers quickly understand what you offer and why it matters.",
        cta: "View Services",
      },
      {
        section: "Trust",
        headline: "Make credibility visible.",
        copy: "Add proof points, guarantees, testimonials, certifications, operating area, and customer support details.",
        cta: "Why Choose Us",
      },
      {
        section: "Contact",
        headline: "Make the next step easy.",
        copy: "Give customers a clear path to call, request a quote, book, or send a message.",
        cta: "Contact Us",
      },
    ],
    starterCopy: {
      heroTitle: "Your business deserves a website that works as hard as you do.",
      heroSubtitle:
        "We create customer-ready website experiences with clear messaging, premium design, strong calls to action, and launch-ready structure.",
      aboutIntro:
        "We help customers understand who you are, what you offer, and why your company is the right choice. Every page is structured for clarity, trust, and conversion.",
      serviceIntro:
        "Our services are presented in a simple, professional format so visitors can quickly choose the right solution and take action.",
      contactIntro:
        "Ready to get started? Contact us today and our team will guide you through the next step.",
    },
    seoMetadata: {
      titleTemplate: "%s | Sovereign Website Builder",
      homeTitle: "Customer-Ready Website Builder",
      description:
        "Generate a polished website structure with page copy, service sections, SEO metadata, calls to action, and deployment checklist.",
      keywords: [
        "website builder",
        "business website",
        "AI website builder",
        "landing page",
        "SEO website copy",
      ],
    },
    brandDirection: {
      tone: "premium, trustworthy, clear, customer-first",
      visualStyle: "modern dark luxury with strong contrast, clean cards, and conversion-focused CTAs",
      recommendedColors: ["black", "slate", "cyan", "emerald", "gold accent"],
    },
    conversionPlan: [
      "Primary CTA above the fold",
      "Phone/contact CTA visible on every page",
      "Trust proof before final CTA",
      "Service cards linked to contact action",
      "Simple contact form with low-friction fields",
    ],
    deploymentChecklist: [
      "Review page copy",
      "Confirm brand colors and logo",
      "Add contact details",
      "Add service area",
      "Add SEO title and description",
      "Test mobile layout",
      "Verify forms and CTAs",
      "Launch preview",
      "Connect domain",
    ],
    nextActions: [
      "Generate website page content",
      "Create preview layout",
      "Review SEO metadata",
      "Run mobile/readiness check",
      "Prepare deployment",
    ],
  };
}
