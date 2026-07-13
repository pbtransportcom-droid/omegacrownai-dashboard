import { selectDesignPreset } from "./design-inventory.js";
function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}
function includesAny(source, words) {
    return words.some((word) => source.includes(word));
}
function titleCase(value) {
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
function detectBrand(prompt, fallback) {
    const explicit = prompt.match(/(?:called|named|brand(?:ed)? as|business name is|company name is)\s+([A-Z][A-Za-z0-9&' -]{1,70})(?:[.,|]|$)/i);
    if (explicit?.[1])
        return titleCase(explicit[1]);
    const forMatch = prompt.match(/(?:for|for a|for an)\s+([A-Za-z0-9&' -]{3,80})(?:\s+with|\s+that|\s+including|[.,]|$)/i);
    if (forMatch?.[1]) {
        const candidate = forMatch[1].trim();
        if (!/website|app|platform|business|company|service|customer|professional|launch/i.test(candidate)) {
            return titleCase(candidate);
        }
    }
    return fallback;
}
export function createBuildSpec(input) {
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
    if (includesAny(source, ["transport", "limo", "airport", "chauffeur", "black car", "fleet", "rides", "wedding service", "corporate travel"])) {
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
    }
    else if (includesAny(source, ["restaurant", "food", "menu", "reservation", "catering"])) {
        industry = "restaurant";
        productType = "restaurant ordering and reservation platform";
        brandFallback = "Restaurant Launch Website";
        targetCustomer = "local diners, catering customers, and returning guests";
        services = ["Menu showcase", "Online ordering", "Reservations", "Catering inquiry"];
        pages = ["Home", "Menu", "Reservations", "Ordering", "Admin", "Editor"];
        features = ["Menu data", "Order request", "Reservation request", "Admin review", "Editable content"];
        adminWorkflow = ["Review orders", "Review reservations", "Update menu", "Manage inquiries"];
        customerWorkflow = ["Browse menu", "Reserve or order", "Submit details", "Receive follow-up"];
    }
    else if (includesAny(source, ["clinic", "medical", "doctor", "health", "appointment"])) {
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
    else if (includesAny(source, ["store", "ecommerce", "shop", "product", "checkout", "cart"])) {
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
    const brandName = detectBrand(originalPrompt, brandFallback);
    const missingFields = [];
    if (!/(called|named|brand|business name|company name)/i.test(originalPrompt))
        missingFields.push("brandName");
    if (!/(phone|email|contact)/i.test(originalPrompt))
        missingFields.push("contactInfo");
    if (!/(city|location|area|near|chicago|houston|atlanta|dallas|new york|o'hare|midway)/i.test(originalPrompt))
        missingFields.push("location");
    if (!/(services|service|product|fleet|menu|appointment|booking|checkout|classes|programs)/i.test(originalPrompt))
        missingFields.push("services");
    if (!/(admin|dashboard|portal|dispatch|manage|review)/i.test(originalPrompt))
        missingFields.push("adminWorkflow");
    if (!/(payment|stripe|square|invoice|checkout|deposit)/i.test(originalPrompt))
        missingFields.push("paymentOrInvoicePreference");
    const isIncomplete = missingFields.length >= 3 || originalPrompt.split(/\s+/).length < 18;
    const designPreset = selectDesignPreset({
        prompt: originalPrompt,
        industry,
        visualDirection
    });
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
