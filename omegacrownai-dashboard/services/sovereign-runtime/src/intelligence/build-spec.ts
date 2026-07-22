import { selectDesignPreset, type DesignPreset } from "./design-inventory.js";

export type BuildSpec = {
  originalPrompt: string;
  normalizedPrompt: string;
  isIncomplete: boolean;
  missingFields: string[];
  confidence: number;
  industry: string;
  brandName: string;
  productType: string;
  targetCustomer: string;
  location: string;
  services: string[];
  pages: string[];
  features: string[];
  adminWorkflow: string[];
  customerWorkflow: string[];
  deliveryFiles: string[];
  visualDirection: string;
  designPreset: DesignPreset;
  executionStandard: "full-function";
  suggestedPrompt: string;
};

function clean(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function includesAny(source: string, words: string[]) {
  return words.some((word) => source.includes(word));
}

function titleCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9 &'/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 7)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function detectBrand(prompt: string, fallback: string) {
  const explicit = prompt.match(/(?:called|named|brand(?:ed)? as|business name is|company name is)\s+([A-Z][A-Za-z0-9&' -]{1,70})(?:[.,|]|$)/i);
  if (explicit?.[1]) return titleCase(explicit[1]);

  const forMatch = prompt.match(/(?:for|for a|for an)\s+([A-Za-z0-9&' -]{3,80})(?:\s+with|\s+that|\s+including|[.,]|$)/i);
  if (forMatch?.[1]) {
    const candidate = forMatch[1].trim();
    if (!/website|app|platform|business|company|service|customer|professional|launch/i.test(candidate)) {
      return titleCase(candidate);
    }
  }

  return fallback;
}

export function createBuildSpec(input: { prompt?: string; mode?: string; projectId?: string }): BuildSpec {
  const originalPrompt = clean(input.prompt);
  const source = originalPrompt.toLowerCase();
  const mode = clean(input.mode || "website").toLowerCase();

  let industry = "general business";
  let productType = mode.includes("app") ? "business web app" : "customer-ready website";
  let brandFallback = "Custom Business Website";
  let targetCustomer = "new and returning customers";
  let location = "service area";
  let services = ["Core services", "Customer support", "Consultation or booking request"];
  let pages = ["Home", "Services", "Customer Portal", "Admin Dashboard", "Editor"];
  let features = ["Lead capture", "Customer intake", "Admin review", "Editable content", "Downloadable delivery package"];
  let adminWorkflow = ["Review customer requests", "Update lead status", "Manage content", "Prepare follow-up"];
  let customerWorkflow = ["Visit site", "Review services", "Submit request", "Receive follow-up"];
  let visualDirection = "modern dark premium layout with strong hero, service cards, trust proof, and clear calls to action";

  if (includesAny(source, ["legal", "law firm", "lawyer", "attorney", "practice areas", "case review", "consultation intake", "justice law"])) {
    industry = "legal";
    productType = "legal consultation and case intake platform";
    brandFallback = "Legal Authority Website";
    targetCustomer = "prospective legal clients and case intake leads";
    services = ["Practice areas", "Attorney profiles", "Consultation intake", "Case review"];
    pages = ["Home", "Practice Areas", "Attorney Profiles", "Consultation Intake", "Admin Case Review", "Editor"];
    features = ["Practice area sections", "Consultation request", "Attorney profile cards", "Case inquiry review", "Editable content"];
    adminWorkflow = ["Review consultation requests", "Assign case inquiry", "Track client follow-up", "Update practice area content"];
    customerWorkflow = ["Review practice areas", "Read attorney trust proof", "Request consultation", "Receive follow-up"];
    visualDirection = "refined legal authority design with serious trust proof, navy/gold palette, practice area cards, and consultation CTA";
  } else if (includesAny(source, ["beauty", "salon", "spa", "hair", "nails", "makeup", "skincare", "rose glow"])) {
    industry = "beauty";
    productType = "beauty salon booking and gallery platform";
    brandFallback = "Beauty Studio Website";
    targetCustomer = "salon clients, beauty customers, and appointment leads";
    services = ["Beauty services", "Gallery", "Appointment booking", "Stylist highlights"];
    pages = ["Home", "Services", "Gallery", "Appointment Booking", "Admin Schedule", "Editor"];
    features = ["Service menu", "Visual gallery", "Appointment request", "Admin schedule review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Update services", "Manage gallery", "Track client follow-up"];
    customerWorkflow = ["Browse services", "View gallery", "Request appointment", "Receive booking confirmation"];
    visualDirection = "soft luxury beauty design with warm editorial visuals, gallery-first sections, appointment CTA, and polished lifestyle tone";
  } else if (includesAny(source, ["construction", "contractor", "project gallery", "estimate request", "roofing", "plumbing", "repair", "industrial", "ironbuild"])) {
    industry = "construction";
    productType = "construction estimate and project gallery platform";
    brandFallback = "Construction Services Website";
    targetCustomer = "property owners, project clients, and estimate leads";
    services = ["Construction services", "Project gallery", "Estimate requests", "Service areas"];
    pages = ["Home", "Services", "Project Gallery", "Estimate Request", "Admin Pipeline", "Editor"];
    features = ["Project gallery", "Estimate request form", "Service proof sections", "Admin pipeline review", "Editable content"];
    adminWorkflow = ["Review estimate requests", "Track project leads", "Update project gallery", "Manage service pages"];
    customerWorkflow = ["Review services", "View project proof", "Request estimate", "Receive follow-up"];
    visualDirection = "bold industrial services design with project proof, durable typography, estimate CTA, and practical trust sections";
  } else if (includesAny(source, ["transport", "limo", "airport", "chauffeur", "black car", "fleet", "rides", "wedding service", "corporate travel"])) {
    industry = "transportation";
    productType = "transportation booking and dispatch platform";
    brandFallback = "Professional Transportation Website";
    targetCustomer = "airport travelers, corporate clients, wedding customers, and event transportation customers";
    location = includesAny(source, ["chicago", "o'hare", "midway"]) ? "Chicago service area" : "local service area";
    services = ["Airport rides", "Corporate travel", "Wedding transportation", "Event transportation", "Executive black car service"];
    pages = ["Home", "Services", "Fleet", "Booking", "Customer Portal", "Admin Dispatch", "Editor"];
    features = ["Quote request", "Booking request", "Fleet data", "Customer lead storage", "Admin dispatch review", "Editable content"];
    adminWorkflow = ["Review booking leads", "Review quote requests", "Manage fleet", "Assign dispatch status", "Update customer follow-up"];
    customerWorkflow = ["Choose service", "Enter pickup and dropoff", "Request quote", "Submit booking details", "Receive confirmation"];
    visualDirection = "premium black car transportation design with fleet visuals, airport/corporate/wedding service cards, trust proof, and booking CTA";
  } else if (includesAny(source, ["restaurant", "food", "menu", "reservation", "catering"])) {
    industry = "restaurant";
    productType = "restaurant ordering and reservation platform";
    brandFallback = "Restaurant Launch Website";
    targetCustomer = "local diners, catering customers, and returning guests";
    services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
    pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
    features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
    adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
    customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
  } else if (includesAny(source, ["clinic", "medical", "doctor", "health", "appointment"])) {
    industry = "clinic";
    productType = "clinic appointment and patient intake platform";
    brandFallback = "Clinic Care Website";
    targetCustomer = "patients and families requesting appointments";
    services = ["Appointment requests", "Provider profiles", "Care services", "Patient intake"];
    pages = ["Home", "Services", "Providers", "Appointments", "Patient Portal", "Admin"];
    features = ["Appointment request", "Patient intake", "Provider cards", "Admin review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Review patient intake", "Assign provider follow-up", "Update content"];
    customerWorkflow = ["Review services", "Choose provider", "Request appointment", "Submit intake"];
  } else if (
    /(ecommerce|e-commerce|online store|storefront|shop|shopping cart|product catalog|cart|checkout|inventory|fulfillment|sell products|buy products|order products)/i.test(originalPrompt) &&
    !/(business website|customer-ready business website|service business|services website|company website|customer request form|about\/trust|lead capture|consultation request)/i.test(originalPrompt)
  ) {
    industry = "commerce";
    productType = "commerce storefront platform";
    brandFallback = "Commerce Store Website";
    targetCustomer = "online shoppers";
    services = ["Product catalog", "Cart flow", "Checkout request", "Customer account"];
    pages = ["Home", "Products", "Cart", "Checkout", "Customer Account", "Admin"];
    features = ["Product catalog", "Cart", "Checkout placeholder", "Order review", "Admin products"];
    adminWorkflow = ["Manage products", "Review orders", "Manage customers", "Update content"];
    customerWorkflow = ["Browse products", "Add to cart", "Submit checkout", "Receive confirmation"];
  }

  const explicitIndustryMatch = originalPrompt.match(/industry\s*:\s*([a-zA-Z -]+)/i);
  const explicitIndustry = explicitIndustryMatch?.[1]?.toLowerCase().trim() || "";

  if (explicitIndustry.includes("construction")) {
    industry = "construction";
    productType = "construction estimate and project gallery platform";
    brandFallback = "Construction Services Website";
    targetCustomer = "homeowners, property owners, project clients, contractors, designers, and estimate leads";
    services = ["Renovation planning", "Project gallery", "Estimate requests", "Contractor matching", "Service areas"];
    pages = ["Home", "Project Categories", "Before And After Gallery", "Estimate Request", "Contractor Matching", "Admin Pipeline", "Editor"];
    features = ["Project gallery", "Estimate request form", "Contractor assignment", "Quote approval workflow", "Photo and document upload", "Lead tracking dashboard"];
    adminWorkflow = ["Review estimate requests", "Assign contractor", "Track project status", "Review customer messages", "Approve quotes", "Track revenue and leads"];
    customerWorkflow = ["Review renovation categories", "View project proof", "Request estimate", "Match with contractor", "Receive quote follow-up"];
    visualDirection = "bold industrial luxury construction design with charcoal, steel, gold, project photography, estimate CTA, contractor matching, and practical trust sections";
  } else if (explicitIndustry.includes("beauty") || explicitIndustry.includes("salon")) {
    industry = "beauty";
    productType = "beauty salon booking and gallery platform";
    brandFallback = "Beauty Studio Website";
    targetCustomer = "salon clients, beauty customers, and appointment leads";
    services = ["Beauty services", "Gallery", "Appointment booking", "Stylist highlights"];
    pages = ["Home", "Services", "Gallery", "Appointment Booking", "Admin Schedule", "Editor"];
    features = ["Service menu", "Visual gallery", "Appointment request", "Admin schedule review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Update services", "Manage gallery", "Track client follow-up"];
    customerWorkflow = ["Browse services", "View gallery", "Request appointment", "Receive booking confirmation"];
    visualDirection = "soft luxury beauty design with warm editorial visuals, gallery-first sections, appointment CTA, and polished lifestyle tone";
  } else if (explicitIndustry.includes("legal") || explicitIndustry.includes("law")) {
    industry = "legal";
    productType = "legal consultation and case intake platform";
    brandFallback = "Legal Authority Website";
    targetCustomer = "prospective legal clients and case intake leads";
    services = ["Practice areas", "Attorney profiles", "Consultation intake", "Case review"];
    pages = ["Home", "Practice Areas", "Attorney Profiles", "Consultation Intake", "Admin Case Review", "Editor"];
    features = ["Practice area sections", "Consultation request", "Attorney profile cards", "Case inquiry review", "Editable content"];
    adminWorkflow = ["Review consultation requests", "Assign case inquiry", "Track client follow-up", "Update practice area content"];
    customerWorkflow = ["Review practice areas", "Read attorney trust proof", "Request consultation", "Receive follow-up"];
    visualDirection = "refined legal authority design with serious trust proof, navy/gold palette, practice area cards, and consultation CTA";
  } else if (explicitIndustry.includes("restaurant")) {
    industry = "restaurant";
    productType = "restaurant ordering and reservation platform";
    brandFallback = "Restaurant Launch Website";
    targetCustomer = "local diners, catering customers, and returning guests";
    services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
    pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
    features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
    adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
    customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
  } else if (explicitIndustry.includes("clinic") || explicitIndustry.includes("medical")) {
    industry = "clinic";
    productType = "clinic appointment and patient intake platform";
    brandFallback = "Clinic Care Website";
    targetCustomer = "patients and families requesting appointments";
    services = ["Appointment requests", "Provider profiles", "Care services", "Patient intake"];
    pages = ["Home", "Services", "Providers", "Appointments", "Patient Portal", "Admin"];
    features = ["Appointment request", "Patient intake", "Provider cards", "Admin review", "Editable content"];
    adminWorkflow = ["Review appointment requests", "Review patient intake", "Assign provider follow-up", "Update content"];
    customerWorkflow = ["Review services", "Choose provider", "Request appointment", "Submit intake"];
  }

  const explicitProductTypeMatch = originalPrompt.match(/product type\s*:\s*([^\n.:-]+(?: [^\n.:-]+){0,8})/i);
  if (explicitProductTypeMatch?.[1]) {
    productType = explicitProductTypeMatch[1].trim();
  }

  const brandName = detectBrand(originalPrompt, brandFallback);

  const missingFields: string[] = [];
  if (!/(called|named|brand|business name|company name)/i.test(originalPrompt)) missingFields.push("brandName");
  if (!/(phone|email|contact)/i.test(originalPrompt)) missingFields.push("contactInfo");
  if (!/(city|location|area|near|chicago|houston|atlanta|dallas|new york|o'hare|midway)/i.test(originalPrompt)) missingFields.push("location");
  if (!/(services|service|product|fleet|menu|appointment|booking|checkout|classes|programs|practice areas|attorney|case|gallery|estimate|construction|contractor)/i.test(originalPrompt)) missingFields.push("services");
  if (!/(admin|dashboard|portal|dispatch|manage|review)/i.test(originalPrompt)) missingFields.push("adminWorkflow");
  if (!/(payment|stripe|square|invoice|checkout|deposit)/i.test(originalPrompt)) missingFields.push("paymentOrInvoicePreference");

  const isIncomplete = missingFields.length >= 3 || originalPrompt.split(/\s+/).length < 18;

  let designPreset = selectDesignPreset({
    prompt: originalPrompt,
    industry,
    visualDirection
  });

  if (industry === "general business") {
    designPreset = {
      id: "professional_business",
      name: "Professional Business Website",
      mood: "clear, trustworthy, service-focused, polished",
      palette: {
        background: "#f8fafc",
        surface: "#ffffff",
        primary: "#0f172a",
        secondary: "#2563eb",
        accent: "#22c55e",
        text: "#0f172a",
        muted: "#475569"
      },
      typography: "strong business headings, readable service copy, clear CTA labels",
      layout: "business hero, services grid, about and trust proof, request form, admin workflow preview",
      heroStyle: "customer-ready business website hero with service promise and request call-to-action",
      sectionStyle: "clean service cards, trust sections, customer request panel, launch package proof",
      imageDirection: "business services, customer request workflow, admin review, launch package, team trust",
      motionDirection: "clean hover states, professional transitions, confident CTA movement"
    };
  }

  visualDirection = [
    visualDirection,
    `Design preset: ${designPreset.name}.`,
    `Mood: ${designPreset.mood}.`,
    `Palette: background ${designPreset.palette.background}, surface ${designPreset.palette.surface}, primary ${designPreset.palette.primary}, secondary ${designPreset.palette.secondary}, accent ${designPreset.palette.accent}.`,
    `Typography: ${designPreset.typography}.`,
    `Layout: ${designPreset.layout}.`,
    `Hero style: ${designPreset.heroStyle}.`,
    `Section style: ${designPreset.sectionStyle}.`,
    `Image direction: ${designPreset.imageDirection}.`
  ].join(" ");

  const normalizedPrompt = [
    `Build a ${productType} for ${brandName}.`,
    `Industry: ${industry}.`,
    `Target customers: ${targetCustomer}.`,
    `Location: ${location}.`,
    `Services: ${services.join(", ")}.`,
    `Pages: ${pages.join(", ")}.`,
    `Customer workflow: ${customerWorkflow.join(" -> ")}.`,
    `Admin workflow: ${adminWorkflow.join(" -> ")}.`,
    `Required features: ${features.join(", ")}.`,
    `Visual direction: ${visualDirection}.`,
    `Delivery standard: full-function package with preview, source files, README.md, DELIVERY.md, LAUNCH_CHECKLIST.md, metadata, validation, and downloadable ZIP.`
  ].join(" ");

  const suggestedPrompt = `Create a full-function ${productType} for ${brandName}. Include ${services.join(", ")}. Build pages for ${pages.join(", ")}. Add features for ${features.join(", ")}. Include customer workflow: ${customerWorkflow.join(" -> ")}. Include admin workflow: ${adminWorkflow.join(" -> ")}. Use ${visualDirection}. Deliver preview, source package, README.md, DELIVERY.md, LAUNCH_CHECKLIST.md, validation, and download ZIP.`;

  return {
    originalPrompt,
    normalizedPrompt,
    isIncomplete,
    missingFields,
    confidence: isIncomplete ? 0.72 : 0.9,
    industry,
    brandName,
    productType,
    targetCustomer,
    location,
    services,
    pages,
    features,
    adminWorkflow,
    customerWorkflow,
    deliveryFiles: ["README.md", "DELIVERY.md", "LAUNCH_CHECKLIST.md", "metadata.json", "data/asset-manifest.json"],
    visualDirection,
    designPreset,
    executionStandard: "full-function",
    suggestedPrompt
  };
}
