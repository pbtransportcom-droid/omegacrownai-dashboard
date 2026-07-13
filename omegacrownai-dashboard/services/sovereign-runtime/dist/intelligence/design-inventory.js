function includesAny(source, words) {
    return words.some((word) => source.includes(word));
}
export const DESIGN_INVENTORY = [
    {
        id: "luxury_transport",
        name: "Luxury Transport Cinematic",
        mood: "premium, cinematic, executive, high-trust",
        palette: {
            background: "#050505",
            surface: "#111113",
            primary: "#f8c15c",
            secondary: "#111827",
            accent: "#38d5ff",
            text: "#ffffff",
            muted: "#d4d4d8"
        },
        typography: "large editorial hero type, strong executive headings, compact luxury labels",
        layout: "cinematic split hero, fleet cards, booking panel, service-area proof, dispatch/admin proof blocks",
        heroStyle: "large vehicle/service promise on the left with a premium booking card on the right",
        sectionStyle: "dark glass panels, gold/cyan accents, fleet and airport service cards",
        imageDirection: "black car, chauffeur, airport, night city lights, luxury fleet, executive travel",
        motionDirection: "subtle glow, premium hover states, smooth scroll anchors"
    },
    {
        id: "warm_restaurant",
        name: "Warm Restaurant Editorial",
        mood: "warm, appetizing, local, inviting",
        palette: {
            background: "#160b06",
            surface: "#26140c",
            primary: "#f97316",
            secondary: "#facc15",
            accent: "#fb7185",
            text: "#fff7ed",
            muted: "#fed7aa"
        },
        typography: "warm editorial headings, friendly menu labels, strong reservation CTAs",
        layout: "food-first hero, menu highlights, reservation panel, catering/order cards",
        heroStyle: "large food/menu story with reservation and ordering actions",
        sectionStyle: "warm cards, menu boards, chef specials, reservation proof",
        imageDirection: "chef plating, warm table setting, menu items, local dining, catering",
        motionDirection: "soft warmth, subtle image lift, friendly CTA transitions"
    },
    {
        id: "clinical_trust",
        name: "Clinical Trust Care",
        mood: "clean, calm, safe, professional",
        palette: {
            background: "#f8fbff",
            surface: "#ffffff",
            primary: "#2563eb",
            secondary: "#14b8a6",
            accent: "#22c55e",
            text: "#0f172a",
            muted: "#475569"
        },
        typography: "clear medical headings, calm body copy, accessible labels",
        layout: "clean hero, appointment card, provider/service grid, trust badges",
        heroStyle: "calm appointment-first hero with care proof and provider cards",
        sectionStyle: "white cards, blue/green trust accents, accessible spacing",
        imageDirection: "clinic interior, provider consultation, patient care, wellness, trust",
        motionDirection: "minimal, calm, accessible transitions"
    },
    {
        id: "legal_authority",
        name: "Legal Authority",
        mood: "authoritative, refined, trustworthy, serious",
        palette: {
            background: "#07111f",
            surface: "#0f1b2d",
            primary: "#d6b25e",
            secondary: "#1e3a5f",
            accent: "#f8fafc",
            text: "#ffffff",
            muted: "#cbd5e1"
        },
        typography: "formal serif-inspired headings with clear professional body copy",
        layout: "authority hero, practice areas, attorney proof, consultation intake",
        heroStyle: "firm credibility hero with consultation call-to-action",
        sectionStyle: "navy panels, gold dividers, trust/testimonial cards",
        imageDirection: "law office, consultation, courthouse, attorney portrait, documents",
        motionDirection: "subtle, confident, restrained"
    },
    {
        id: "commerce_editorial",
        name: "Commerce Editorial Storefront",
        mood: "shoppable, polished, catalog-driven, modern",
        palette: {
            background: "#fbfaf7",
            surface: "#ffffff",
            primary: "#111827",
            secondary: "#f97316",
            accent: "#2563eb",
            text: "#111827",
            muted: "#6b7280"
        },
        typography: "editorial product headings, clean price/category labels",
        layout: "product-led hero, catalog grid, cart/checkout proof, admin products",
        heroStyle: "product story with featured collection and checkout call-to-action",
        sectionStyle: "bright product cards, category strips, conversion-focused checkout panels",
        imageDirection: "product photography, catalog cards, lifestyle shopping, checkout",
        motionDirection: "quick product hover, cart microinteractions"
    },
    {
        id: "modern_saas",
        name: "Modern SaaS Gradient",
        mood: "technical, polished, scalable, product-led",
        palette: {
            background: "#020617",
            surface: "#0f172a",
            primary: "#38bdf8",
            secondary: "#8b5cf6",
            accent: "#22c55e",
            text: "#ffffff",
            muted: "#94a3b8"
        },
        typography: "sharp product headings, dashboard labels, pricing-card copy",
        layout: "gradient product hero, feature grid, dashboard preview, pricing/demo CTA",
        heroStyle: "SaaS product promise with dashboard visual and conversion CTA",
        sectionStyle: "glass feature cards, gradient accents, product screenshots",
        imageDirection: "dashboard UI, analytics, automation, app screens, integrations",
        motionDirection: "glow, product hover, subtle dashboard depth"
    },
    {
        id: "playful_education",
        name: "Playful Education",
        mood: "friendly, bright, playful, safe",
        palette: {
            background: "#fff7ed",
            surface: "#ffffff",
            primary: "#f97316",
            secondary: "#3b82f6",
            accent: "#22c55e",
            text: "#1f2937",
            muted: "#6b7280"
        },
        typography: "rounded friendly headings, simple readable sections",
        layout: "program hero, admissions cards, student/family journey, contact CTA",
        heroStyle: "friendly school/program hero with enrollment call-to-action",
        sectionStyle: "rounded colorful cards, family-friendly spacing, playful icons",
        imageDirection: "students, classroom, programs, family enrollment, learning",
        motionDirection: "gentle bounce, friendly hover states"
    },
    {
        id: "beauty_soft_luxury",
        name: "Beauty Soft Luxury",
        mood: "soft, premium, elegant, personal",
        palette: {
            background: "#fff1f2",
            surface: "#ffffff",
            primary: "#be185d",
            secondary: "#f9a8d4",
            accent: "#c084fc",
            text: "#3b0a20",
            muted: "#7f1d1d"
        },
        typography: "soft luxury headings, elegant booking copy, portfolio labels",
        layout: "beauty hero, service menu, gallery proof, appointment CTA",
        heroStyle: "visual-first salon/beauty hero with booking panel",
        sectionStyle: "soft cards, blush gradients, gallery/service pricing sections",
        imageDirection: "beauty service, salon, spa, nails, hair, skincare, portfolio",
        motionDirection: "soft fades, smooth gallery hover"
    },
    {
        id: "industrial_services",
        name: "Industrial Services Bold",
        mood: "strong, practical, reliable, quote-driven",
        palette: {
            background: "#111827",
            surface: "#1f2937",
            primary: "#facc15",
            secondary: "#f97316",
            accent: "#e5e7eb",
            text: "#ffffff",
            muted: "#d1d5db"
        },
        typography: "bold service headings, direct quote CTAs, strong labels",
        layout: "service hero, project gallery, estimate form, admin pipeline",
        heroStyle: "bold project/service promise with quote request panel",
        sectionStyle: "industrial cards, yellow/steel accents, project proof",
        imageDirection: "construction, cleaning, tools, service crew, project site",
        motionDirection: "solid hover states, practical transitions"
    },
    {
        id: "creative_portfolio",
        name: "Creative Portfolio",
        mood: "artistic, expressive, visual, memorable",
        palette: {
            background: "#09090b",
            surface: "#18181b",
            primary: "#a78bfa",
            secondary: "#fb7185",
            accent: "#38bdf8",
            text: "#ffffff",
            muted: "#d4d4d8"
        },
        typography: "expressive hero type, portfolio captions, bold project labels",
        layout: "visual hero, portfolio grid, inquiry CTA, case study sections",
        heroStyle: "artistic portfolio-first hero with strong visual direction",
        sectionStyle: "gallery cards, creative gradients, project storytelling",
        imageDirection: "creative studio, art, media, portfolio, music, podcast, video",
        motionDirection: "gallery reveal, creative hover, expressive transitions"
    }
];
export function selectDesignPreset(input) {
    const source = `${input.prompt || ""} ${input.industry || ""} ${input.visualDirection || ""}`.toLowerCase();
    if (includesAny(source, ["transport", "limo", "airport", "chauffeur", "black car", "fleet", "executive travel"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "luxury_transport");
    }
    if (includesAny(source, ["restaurant", "food", "menu", "reservation", "catering", "chef", "dining"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "warm_restaurant");
    }
    if (includesAny(source, ["clinic", "medical", "doctor", "health", "appointment", "patient", "wellness"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "clinical_trust");
    }
    if (includesAny(source, ["law", "legal", "attorney", "lawyer", "case", "consultation", "firm"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "legal_authority");
    }
    if (includesAny(source, ["store", "ecommerce", "shop", "product", "checkout", "cart", "catalog", "bookstore"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "commerce_editorial");
    }
    if (includesAny(source, ["saas", "software", "dashboard", "analytics", "crm", "subscription", "automation"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "modern_saas");
    }
    if (includesAny(source, ["school", "education", "kids", "student", "class", "program", "daycare"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "playful_education");
    }
    if (includesAny(source, ["beauty", "salon", "spa", "hair", "nails", "makeup", "skincare"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "beauty_soft_luxury");
    }
    if (includesAny(source, ["construction", "cleaning", "contractor", "repair", "roofing", "plumbing", "industrial"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "industrial_services");
    }
    if (includesAny(source, ["portfolio", "creative", "artist", "music", "podcast", "video", "studio", "photography"])) {
        return DESIGN_INVENTORY.find((preset) => preset.id === "creative_portfolio");
    }
    return DESIGN_INVENTORY.find((preset) => preset.id === "modern_saas");
}
