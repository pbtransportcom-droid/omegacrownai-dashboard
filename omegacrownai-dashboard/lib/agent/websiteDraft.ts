export type WebsiteDraftSection = {
  id: string;
  type: string;
  content: any;
};

export type WebsiteDraftPage = {
  slug: string;
  title: string;
  sections: WebsiteDraftSection[];
};

export type WebsiteDraft = {
  version: "website_draft_v1";
  status: "draft";
  projectName: string;
  brand: {
    name: string;
    tagline?: string;
    tone: string;
    colors: {
      background: string;
      primary: string;
      accent: string;
      text: string;
    };
  };
  pages: WebsiteDraftPage[];
};

function buildLimoWebsiteDraft(projectName: string, brief: any): WebsiteDraft {
  return {
    version: "website_draft_v1",
    status: "draft",
    projectName,
    brand: {
      name: "Princess Benjamin Transportation",
      tagline: "Your journey, our royal priority.",
      tone: "Luxury, royal, polished, professional, trustworthy",
      colors: {
        background: "#050816",
        primary: "#d4af37",
        accent: "#38bdf8",
        text: "#f8fafc",
      },
    },
    pages: [
      {
        slug: "home",
        title: "Luxury Airport Transportation",
        sections: [
          {
            id: "hero",
            type: "hero",
            content: {
              headline: "Luxury Airport Transportation, Built Around Your Schedule",
              subheadline:
                "Professional black car and limo service for O'Hare airport transfers, business travel, and special events.",
              primaryCtaLabel: "Book Your Ride",
              primaryCtaHref: "#booking",
              secondaryCtaLabel: "Call Now",
              secondaryCtaHref: "tel:+17735101467",
              backgroundImageHint: "luxury black car at airport terminal at night",
            },
          },
          {
            id: "services",
            type: "features",
            content: {
              heading: "Premium Transportation Services",
              items: [
                {
                  title: "O'Hare Airport Transfers",
                  description:
                    "Reliable luxury airport pickup and drop-off service for Chicago O'Hare travelers.",
                  iconHint: "plane",
                },
                {
                  title: "Executive Black Car Service",
                  description:
                    "Professional transportation for business meetings, corporate travel, and VIP clients.",
                  iconHint: "briefcase",
                },
                {
                  title: "Luxury Limo Service",
                  description:
                    "Elegant transportation for special events, celebrations, and premium travel experiences.",
                  iconHint: "car",
                },
              ],
            },
          },
          {
            id: "fleet",
            type: "custom",
            content: {
              heading: "A Fleet Designed for Comfort",
              body:
                "Clean, comfortable, professional vehicles prepared for airport transfers, business travel, and special occasions.",
              items: [
                "Executive sedans",
                "Luxury SUVs",
                "Premium black car service",
                "Event transportation",
              ],
            },
          },
          {
            id: "trust",
            type: "features",
            content: {
              heading: "Your Journey, Our Royal Priority",
              items: [
                {
                  title: "Professional Chauffeurs",
                  description: "Courteous drivers focused on safety, comfort, and punctuality.",
                  iconHint: "shield",
                },
                {
                  title: "On-Time Airport Pickup",
                  description: "Built for travelers who need dependable airport transportation.",
                  iconHint: "clock",
                },
                {
                  title: "Easy Booking",
                  description: "Clear calls-to-action make it easy for customers to reserve a ride.",
                  iconHint: "calendar",
                },
              ],
            },
          },
          {
            id: "booking",
            type: "cta",
            content: {
              heading: "Reserve Your Luxury Ride",
              subheading:
                "Book premium transportation for airport transfers, corporate travel, and special events.",
              ctaLabel: "Call +1 (773) 510-1467",
              ctaHref: "tel:+17735101467",
              secondaryCtaLabel: "Visit pbtlimo.com",
              secondaryCtaHref: "https://pbtlimo.com/",
            },
          },
          {
            id: "contact",
            type: "custom",
            content: {
              heading: "Contact Princess Benjamin Transportation",
              phone: "+1 (773) 510-1467",
              secondaryPhone: "(224) 224-0263",
              website: "https://pbtlimo.com/",
              serviceArea: "Chicago O'Hare area",
            },
          },
        ],
      },
    ],
  };
}

function buildGenericWebsiteDraft(projectName: string, brief: any): WebsiteDraft {
  return {
    version: "website_draft_v1",
    status: "draft",
    projectName,
    brand: {
      name: projectName,
      tone: brief?.style || "Modern, professional, trustworthy",
      colors: {
        background: "#020617",
        primary: "#38bdf8",
        accent: "#d4af37",
        text: "#f8fafc",
      },
    },
    pages: [
      {
        slug: "home",
        title: projectName,
        sections: [
          {
            id: "hero",
            type: "hero",
            content: {
              headline: projectName,
              subheadline: brief?.goal || "A professional website created by Omega Crown AI.",
              primaryCtaLabel: "Get Started",
              primaryCtaHref: "#contact",
            },
          },
          {
            id: "features",
            type: "features",
            content: {
              heading: "What We Offer",
              items: (brief?.suggestedSections || ["Services", "About", "Contact"]).slice(0, 3).map(
                (title: string) => ({
                  title,
                  description: "A polished section ready for your business content.",
                  iconHint: "sparkles",
                })
              ),
            },
          },
          {
            id: "contact",
            type: "cta",
            content: {
              heading: "Ready to Start?",
              subheading: "Contact us today to learn more.",
              ctaLabel: "Contact Us",
              ctaHref: "#contact",
            },
          },
        ],
      },
    ],
  };
}

export function buildWebsiteDraft({
  message,
  projectName,
  brief,
}: {
  message: string;
  projectName: string;
  brief: any;
}) {
  const isLimo = /limo|airport|transport|chauffeur|black car|o'hare|ohare/i.test(message);

  if (isLimo) {
    return buildLimoWebsiteDraft(projectName, brief);
  }

  return buildGenericWebsiteDraft(projectName, brief);
}
