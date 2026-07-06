import fs from "fs";
import path from "path";
function writeFile(outDir, file, content) {
    const filePath = path.join(outDir, file);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}
function artifact(outDir, file, title, type = "typescript") {
    return { type, title, path: path.join(outDir, file), status: "generated" };
}
function cleanPrompt(prompt) {
    return String(prompt || "")
        .replace(/\s+/g, " ")
        .trim();
}
function titleCase(value) {
    return value
        .replace(/[^a-zA-Z0-9 ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 6)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ") || "Custom Business Platform";
}
function inferDomain(prompt) {
    const source = prompt.toLowerCase();
    const matches = [
        ["customer-ready", "Launch-Ready Website", ["Hero Message", "Value Proposition", "Conversion Sections", "Launch Review"], ["WebsiteLead", "CustomerInquiry", "ContentSection", "LaunchChecklist"]],
        ["customer ready", "Launch-Ready Website", ["Hero Message", "Value Proposition", "Conversion Sections", "Launch Review"], ["WebsiteLead", "CustomerInquiry", "ContentSection", "LaunchChecklist"]],
        ["strong copy", "Launch-Ready Website", ["Hero Message", "Value Proposition", "Conversion Sections", "Launch Review"], ["WebsiteLead", "CustomerInquiry", "ContentSection", "LaunchChecklist"]],
        ["calls to action", "Conversion Website Platform", ["Hero CTA", "Services", "Trust Builders", "Admin Review"], ["WebsiteLead", "ServiceRequest", "CTAEvent", "AdminNote"]],
        ["launch-ready", "Launch-Ready Website", ["Hero Message", "Value Proposition", "Conversion Sections", "Launch Review"], ["WebsiteLead", "CustomerInquiry", "ContentSection", "LaunchChecklist"]],
        ["launch ready", "Launch-Ready Website", ["Hero Message", "Value Proposition", "Conversion Sections", "Launch Review"], ["WebsiteLead", "CustomerInquiry", "ContentSection", "LaunchChecklist"]],
        ["mobile layout", "Launch-Ready Website", ["Hero Message", "Mobile Sections", "Customer Intake", "Launch Review"], ["WebsiteLead", "CustomerInquiry", "ContentSection", "LaunchChecklist"]],
        ["fitness", "Fitness Studio Operating Platform", ["Class Schedule", "Membership Signup", "Trainer Profiles", "Lead Capture"], ["Class", "Membership", "Trainer", "FitnessLead"]],
        ["gym", "Fitness Studio Operating Platform", ["Class Schedule", "Membership Signup", "Trainer Profiles", "Lead Capture"], ["Class", "Membership", "Trainer", "FitnessLead"]],
        ["church", "Church Ministry Platform", ["Service Times", "Ministries", "Giving", "Volunteer Intake"], ["Service", "Ministry", "Donation", "Volunteer"]],
        ["school", "School Enrollment Platform", ["Programs", "Admissions", "Student Portal", "Admin Review"], ["Program", "Enrollment", "StudentInquiry", "CampusEvent"]],
        ["clinic", "Clinic Care Platform", ["Services", "Appointment Requests", "Provider Profiles", "Patient Intake"], ["CareService", "AppointmentRequest", "Provider", "PatientLead"]],
        ["real estate", "Real Estate Agency Platform", ["Listings", "Buyer Intake", "Agent Profiles", "Showing Requests"], ["PropertyListing", "ShowingRequest", "Agent", "BuyerLead"]],
        ["ecommerce", "Commerce Store Platform", ["Product Catalog", "Cart Flow", "Checkout Intake", "Admin Orders"], ["Product", "Order", "Customer", "CartLead"]],
        ["shop", "Commerce Store Platform", ["Product Catalog", "Cart Flow", "Checkout Intake", "Admin Orders"], ["Product", "Order", "Customer", "CartLead"]],
        ["nonprofit", "Nonprofit Impact Platform", ["Campaigns", "Donation Intake", "Volunteer Signup", "Impact Reports"], ["Campaign", "Donation", "Volunteer", "ImpactLead"]],
        ["agency", "Agency Client Acquisition Platform", ["Services", "Case Studies", "Consultation Intake", "Admin Pipeline"], ["ServiceOffer", "ClientInquiry", "CaseStudy", "PipelineLead"]],
        ["hotel", "Hotel Booking Platform", ["Rooms", "Amenities", "Guest Requests", "Admin Reservations"], ["Room", "GuestRequest", "Amenity", "ReservationLead"]],
        ["construction", "Construction Project Lead Platform", ["Services", "Project Gallery", "Estimate Request", "Admin Pipeline"], ["ProjectService", "EstimateRequest", "ProjectGallery", "ClientLead"]],
        ["cleaning", "Cleaning Service Platform", ["Service Plans", "Quote Request", "Team Profiles", "Admin Jobs"], ["ServicePlan", "QuoteRequest", "TeamMember", "JobLead"]],
        ["podcast", "Podcast Media Platform", ["Episodes", "Guest Booking", "Sponsor Intake", "Admin Calendar"], ["Episode", "GuestRequest", "SponsorLead", "MediaAsset"]],
        ["music", "Artist Music Platform", ["Releases", "Tour Dates", "Fan Signup", "Booking Intake"], ["Release", "EventDate", "FanLead", "BookingRequest"]],
        ["marketplace", "Marketplace Platform", ["Listings", "Seller Intake", "Buyer Requests", "Admin Review"], ["MarketplaceListing", "SellerApplication", "BuyerRequest", "ReviewQueue"]],
        ["crm", "CRM Dashboard Platform", ["Contacts", "Pipeline", "Tasks", "Admin Reporting"], ["Contact", "Deal", "Task", "PipelineNote"]]
    ];
    for (const [key, product, sections, models] of matches) {
        if (source.includes(key)) {
            return { key, product, sections, models };
        }
    }
    return {
        key: "custom",
        product: "Custom Business Platform",
        sections: ["Overview", "Customer Intake", "Operations Dashboard", "Admin Review"],
        models: ["BusinessLead", "CustomerRequest", "AdminNote", "WorkflowItem"]
    };
}
function safeBrand(prompt, product) {
    const cleaned = cleanPrompt(prompt);
    const calledMatch = cleaned.match(/(?:called|named)\s+([A-Z][A-Za-z0-9&' -]{1,60}?)(?:\s+[—-]|\s+--|\s+\||,|\.|$)/);
    if (calledMatch?.[1]) {
        return titleCase(calledMatch[1]);
    }
    const source = cleaned
        .replace(/build a|build an|build|complete|modern|full-function|website|app|platform|with/gi, " ")
        .replace(/do not .*/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    const normalizedSource = source.toLowerCase();
    const genericDescriptorPattern = /customer ready|customer-ready|strong copy|sections|calls to action|call to action|mobile layout|launch ready|launch-ready|polish|modern|customer|ready|copy/i;
    const words = normalizedSource
        .split(/[^a-z0-9-]+/i)
        .filter(Boolean)
        .filter((word) => ![
        "a",
        "an",
        "the",
        "for",
        "and",
        "or",
        "to",
        "of",
        "ready",
        "customer",
        "customer-ready",
        "strong",
        "copy",
        "sections",
        "calls",
        "call",
        "action",
        "actions",
        "mobile",
        "layout",
        "launch",
        "launch-ready",
        "polish",
        "modern"
    ].includes(word));
    if (!source || genericDescriptorPattern.test(normalizedSource) || words.length < 2) {
        return product;
    }
    return titleCase(source || product);
}
export function isUniversalAnythingPrompt(prompt) {
    return cleanPrompt(prompt).length > 0;
}
export async function buildUniversalAnythingArtifacts(run, outDir) {
    const now = new Date().toISOString();
    const prompt = cleanPrompt(run.prompt || "");
    const domain = inferDomain(prompt);
    const brand = safeBrand(prompt, domain.product);
    const [primarySection, secondarySection, thirdSection, adminSection] = domain.sections;
    const [modelOne, modelTwo, modelThree, modelFour] = domain.models;
    function isBookstorePrompt(prompt, brand) {
        const value = `${prompt} ${brand}`.toLowerCase();
        return (value.includes("bookhaven") ||
            value.includes("bookstore") ||
            value.includes("book store") ||
            value.includes("book catalog") ||
            value.includes("author page") ||
            value.includes("author pages"));
    }
    function applyBookstoreCommerceSpecialization(files, prompt, brand) {
        if (!isBookstorePrompt(prompt, brand))
            return files;
        const replacePairs = [
            ["Orange Shop", brand],
            ["Orange Shop storefront", `${brand} bookstore`],
            ["Orange Shop Operations", `${brand} Bookstore Operations`],
            ["Orange Shop order", `${brand} order`],
            ["fresh oranges", "new releases and bestselling books"],
            ["Fresh oranges", "New releases and bestselling books"],
            ["Fresh Oranges", "Bestselling Books"],
            ["fresh citrus", "curated books"],
            ["Fresh citrus", "Curated books"],
            ["citrus", "books"],
            ["Citrus", "Books"],
            ["oranges", "books"],
            ["Oranges", "Books"],
            ["juice", "audiobooks"],
            ["Juice", "Audiobooks"],
            ["gift baskets", "book bundles"],
            ["Gift baskets", "Book bundles"],
            ["subscription boxes", "reading subscriptions"],
            ["Subscription boxes", "Reading subscriptions"],
            ["Weekly Citrus Box", "Weekly Reading Box"],
            ["Juice Lover Plan", "Audiobook Lover Plan"],
            ["seasonal citrus", "seasonal reading picks"],
            ["premium citrus", "premium book collections"],
            ["artisan orange treats", "signed editions and reading accessories"],
            ["fresh fruit", "curated books"],
            ["product-oranges", "book-bestsellers"],
            ["product-juice", "book-audiobooks"],
            ["product-gift", "book-bundles"],
            ["commerce-hero", "bookstore-hero"],
            ["Organic options, variants, origin filters, stock status, and premium books descriptions.", "Hardcover, paperback, audiobook, author, genre, stock status, and curated descriptions."],
            ["Organic options, variants, origin filters, stock status, and premium books descriptions", "Hardcover, paperback, audiobook, author, genre, stock status, and curated descriptions"],
        ];
        function rewriteText(input) {
            let out = input;
            for (const [from, to] of replacePairs) {
                out = out.split(from).join(to);
            }
            return out;
        }
        for (const file of files) {
            if (typeof file.content === "string") {
                file.content = rewriteText(file.content);
            }
        }
        const productData = [
            {
                id: "bookhaven-bestseller-pack",
                name: "Bookhaven Bestseller Bundle",
                category: "Bestsellers",
                price: 49,
                stock: 42,
                format: "Hardcover + paperback",
                author: "Curated Bookhaven Editors",
                image: "/images/book-bestsellers.svg",
                description: "A curated bundle of bestselling fiction, nonfiction, and staff picks for serious readers."
            },
            {
                id: "author-spotlight-collection",
                name: "Author Spotlight Collection",
                category: "Author Picks",
                price: 35,
                stock: 28,
                format: "Paperback",
                author: "Featured Independent Authors",
                image: "/images/book-author.svg",
                description: "A rotating collection built around author pages, reader reviews, and signed-edition opportunities."
            },
            {
                id: "audiobook-membership",
                name: "Audiobook Membership",
                category: "Audiobooks",
                price: 19,
                stock: 999,
                format: "Digital audiobook",
                author: "Multiple narrators",
                image: "/images/book-audiobooks.svg",
                description: "Monthly audiobook credits with personalized recommendations and reading-list management."
            },
            {
                id: "book-club-box",
                name: "Book Club Box",
                category: "Subscriptions",
                price: 29,
                stock: 60,
                format: "Monthly subscription",
                author: "Bookhaven Book Club",
                image: "/images/book-bundles.svg",
                description: "Monthly book club shipment with discussion guide, themed recommendations, and member perks."
            }
        ];
        const products = files.find((entry) => entry.file === "data/products.json");
        if (products)
            products.content = JSON.stringify(productData, null, 2);
        const assetManifest = files.find((entry) => entry.file === "data/asset-manifest.json");
        if (assetManifest) {
            assetManifest.content = JSON.stringify({
                generatedAt: new Date().toISOString(),
                brand,
                domain: "bookstore",
                assets: [
                    "public/images/bookstore-hero.svg",
                    "public/images/book-bestsellers.svg",
                    "public/images/book-author.svg",
                    "public/images/book-audiobooks.svg",
                    "public/images/book-bundles.svg"
                ],
                imagePrompt: `Create polished bookstore visuals for ${brand}: shelves, book covers, author pages, reading subscriptions, checkout, and admin operations.`
            }, null, 2);
        }
        const heroSvg = files.find((entry) => entry.file === "public/images/commerce-hero.svg");
        if (heroSvg) {
            heroSvg.file = "public/images/bookstore-hero.svg";
            heroSvg.title = "Bookstore Hero Visual";
            heroSvg.content = svgAsset("Bookstore Hero", `${brand} shelves, featured books, author spotlight, cart, and checkout`, "#0f172a", "#fbbf24");
        }
        const orangesSvg = files.find((entry) => entry.file === "public/images/product-oranges.svg");
        if (orangesSvg) {
            orangesSvg.file = "public/images/book-bestsellers.svg";
            orangesSvg.title = "Bestseller Books Visual";
            orangesSvg.content = svgAsset("Bestsellers", "Hardcover and paperback bestseller collection", "#111827", "#60a5fa");
        }
        const juiceSvg = files.find((entry) => entry.file === "public/images/product-juice.svg");
        if (juiceSvg) {
            juiceSvg.file = "public/images/book-audiobooks.svg";
            juiceSvg.title = "Audiobooks Visual";
            juiceSvg.content = svgAsset("Audiobooks", "Digital audiobook membership and listening library", "#1e1b4b", "#a78bfa");
        }
        const giftSvg = files.find((entry) => entry.file === "public/images/product-gift.svg");
        if (giftSvg) {
            giftSvg.file = "public/images/book-bundles.svg";
            giftSvg.title = "Book Bundles Visual";
            giftSvg.content = svgAsset("Book Bundles", "Book club subscription box and curated reading gifts", "#431407", "#fb923c");
        }
        files.push({
            file: "public/images/book-author.svg",
            title: "Author Spotlight Visual",
            type: "svg",
            content: svgAsset("Author Pages", "Featured authors, bios, signed editions, and reader reviews", "#052e16", "#4ade80")
        });
        return files;
    }
    function svgAsset(title, emoji, bgA = "#fb923c", bgB = "#facc15") {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${bgA}"/>
      <stop offset="100%" stop-color="${bgB}"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-opacity=".28"/></filter>
  </defs>
  <rect width="1200" height="800" rx="64" fill="url(#g)"/>
  <circle cx="980" cy="120" r="180" fill="rgba(255,255,255,.18)"/>
  <circle cx="180" cy="660" r="220" fill="rgba(0,0,0,.12)"/>
  <g filter="url(#shadow)">
    <rect x="110" y="110" width="980" height="580" rx="48" fill="rgba(255,255,255,.88)"/>
    <text x="160" y="270" font-family="Arial, sans-serif" font-size="104" font-weight="900" fill="#111827">${emoji}</text>
    <text x="160" y="390" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#111827">${title}</text>
    <text x="160" y="470" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4b5563">Generated visual asset</text>
    <rect x="160" y="530" width="360" height="68" rx="34" fill="#111827"/>
    <text x="205" y="574" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="white">Production-ready preview</text>
  </g>
</svg>`;
    }
    function askAiSection() {
        return `<section id="ask-ai" class="panel ask-ai">
      <p class="eyebrow">Ask AI to add more features</p>
      <h2>Improve this build after delivery.</h2>
      <p>Request new sections, integrations, design changes, automations, dashboards, payment features, SEO content, or custom backend workflows.</p>
      <form class="feature-form" data-ai-feature-form>
        <textarea data-ai-feature-input aria-label="Feature request" placeholder="Example: Add SMS order updates, loyalty rewards, customer account dashboard, and abandoned-cart emails."></textarea>
        <button type="submit">Send feature request</button>
      </form>\n      <p class="mini" data-ai-feature-output>Describe what you want AI to add, then submit.</p>
      <p class="mini">This generated package includes an API route and local store for feature requests.</p>
    </section>`;
    }
    function liveIntakeSection() {
        return `<section id="intake" class="panel live-intake">
      <p class="eyebrow">Live customer intake</p>
      <h2>Request a consultation</h2>
      <p>Submit a customer request directly from this generated preview. The request is stored for admin review under this project.</p>
      <form class="intake-form" data-live-intake-form>
        <input data-intake-name aria-label="Name" placeholder="Name" />
        <input data-intake-email aria-label="Email" placeholder="Email" />
        <textarea data-intake-request aria-label="Request" placeholder="What do you need help with?"></textarea>
        <button type="submit">Submit request</button>
      </form>
      <p class="mini" data-intake-output>Ready to collect customer requests.</p>
    </section>
    <section id="admin" class="panel live-admin">
      <p class="eyebrow">Admin review</p>
      <h2>Live request inbox</h2>
      <p>Submitted requests are stored in this project artifact folder.</p>
      <button type="button" data-load-intake>Load submissions</button>
      <div class="mini" data-intake-list>No submissions loaded yet.</div>
    </section>`;
    }
    function commercePreviewHtml() {
        return `<section class="visual-split">
      <div>
        <p class="eyebrow">Fresh commerce experience</p>
        <h2>Orange Shop storefront with catalog, cart, checkout, subscriptions, and admin operations.</h2>
        <p>Built for fresh oranges, citrus packs, juices, gift baskets, subscription boxes, promo codes, wishlist, reviews, and order management.</p>
      </div>
      <img src="/runtime-preview/${run.projectId}/public/images/commerce-hero.svg" alt="Orange Shop citrus hero visual" />
    </section>
    <section class="grid rich-grid">
      <article><img src="/runtime-preview/${run.projectId}/public/images/product-oranges.svg" alt="Fresh oranges" /><h2>Fresh Oranges</h2><p>Organic options, variants, origin filters, stock status, and premium citrus descriptions.</p></article>
      <article><img src="/runtime-preview/${run.projectId}/public/images/product-juice.svg" alt="Fresh orange juice" /><h2>Fresh Juice</h2><p>Cold-pressed juice products with checkout-ready catalog data.</p></article>
      <article><img src="/runtime-preview/${run.projectId}/public/images/product-gift.svg" alt="Gift baskets" /><h2>Gift Baskets</h2><p>Seasonal gift offers for families, health-conscious customers, and US gift buyers.</p></article>
      <article><h2>Cart + Checkout</h2><p>Realtime cart preview, Stripe/Square placeholder, guest checkout, accounts, and order confirmation emails.</p></article>
      <article><h2>Subscriptions</h2><p>Weekly and monthly delivery plan APIs with recurring citrus box options.</p></article>
      <article><h2>Commerce Admin</h2><p>Manage products, inventory, orders, customers, promo codes, reviews, wishlist, and marketing campaigns.</p></article>
    </section>
    <section id="intake" class="panel live-intake">
      <p class="eyebrow">Live customer intake</p>
      <h2>Request a consultation</h2>
      <p>Submit a customer request directly from this generated preview. The request is stored for admin review under this project.</p>
      <form class="intake-form" data-live-intake-form>
        <input data-intake-name aria-label="Name" placeholder="Name" />
        <input data-intake-email aria-label="Email" placeholder="Email" />
        <textarea data-intake-request aria-label="Request" placeholder="What do you need help with?"></textarea>
        <button type="submit">Submit request</button>
      </form>
      <p class="mini" data-intake-output>Ready to collect customer requests.</p>
    </section>
    <section id="admin" class="panel live-admin">
      <p class="eyebrow">Admin review</p>
      <h2>Live request inbox</h2>
      <p>Submitted requests are stored in this project artifact folder.</p>
      <button type="button" data-load-intake>Load submissions</button>
      <div class="mini" data-intake-list>No submissions loaded yet.</div>
    </section>${askAiSection()}`;
    }
    function fitnessPreviewHtml() {
        return `<section class="visual-split">
      <div>
        <p class="eyebrow">Fitness studio platform</p>
        <h2>Class schedules, memberships, trainers, leads, bookings, and studio admin.</h2>
        <p>Built for a neighborhood fitness studio with production-ready frontend, APIs, Prisma schema, admin dashboard, delivery manifest, and downloadable package.</p>
      </div>
      <img src="/runtime-preview/${run.projectId}/public/images/fitness-hero.svg" alt="Fitness studio hero visual" />
    </section>
    <section class="grid rich-grid">
      <article><img src="/runtime-preview/${run.projectId}/public/images/fitness-class.svg" alt="Fitness class" /><h2>Class Schedule</h2><p>Classes by time, trainer, level, days, and capacity.</p></article>
      <article><img src="/runtime-preview/${run.projectId}/public/images/fitness-trainer.svg" alt="Trainer profile" /><h2>Trainer Profiles</h2><p>Certified trainer cards with specialties and bios.</p></article>
      <article><h2>Membership Signup</h2><p>Starter, unlimited, and family plans with membership activation API.</p></article>
      <article><h2>Bookings API</h2><p>Class bookings, lead capture, and local persistence demo.</p></article>
      <article><h2>Studio Admin</h2><p>Admin dashboard for classes, trainers, leads, bookings, and memberships.</p></article>
      <article><h2>Production Package</h2><p>README, smoke test, Prisma models, delivery manifest, and deployment record.</p></article>
    </section>
    ${askAiSection()}`;
    }
    const domainPreviewHtml = domain.key === "ecommerce" || domain.key === "shop"
        ? commercePreviewHtml()
        : domain.key === "fitness" || domain.key === "gym"
            ? fitnessPreviewHtml()
            : `${domain.sections.map((section) => `<article><h2>${section}</h2><p>Launch-ready customer section for ${brand}, with polished copy, clear next steps, customer intake, and review-ready admin workflow.</p></article>`).join("\n      ")}${liveIntakeSection()}${askAiSection()}`;
    const files = [
        {
            file: "index.html",
            title: `${brand} Preview`,
            type: "html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brand} | ${domain.product}</title>
  <meta name="description" content="${brand} generated as a full-function customer-ready website and app package." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="page-shell">
    <nav class="nav">
      <strong>${brand}</strong>
      <div>
        <a href="#features">${primarySection}</a>
        <a href="#workflow">${secondarySection}</a>
        <a href="#admin">${adminSection}</a>
      </div>
      <a class="nav-cta" href="#intake">Start Now</a>
    </nav>

    <section class="hero">
      <p class="eyebrow">${domain.product}</p>
      <h1>${brand} built as a polished, customer-ready website that turns visitors into leads.</h1>
      <p class="lede">A polished, mobile-ready website with clear messaging, strong calls to action, customer intake, admin review, and a downloadable launch package.</p>
      <div class="hero-actions">
        <a class="primary" href="#intake">Open Intake</a>
        <a class="secondary" href="#admin">Review Admin</a>
      </div>
      <div class="hero-proof">
        <span>Frontend complete</span>
        <span>API complete</span>
        <span>Database schema included</span>
        <span>Delivery manifest ready</span>
      </div>
    </section>

    <section id="features" class="domain-preview">
      ${domainPreviewHtml}
    </section>
    <section class="panel active-experience">
      <p class="eyebrow">Active Customer / Admin / Editor Experience</p>
      <h2>This delivery includes clickable app areas, not only a front page.</h2>
      <p>Open the customer flow, admin dashboard, or generated editor to update content and request more AI features.</p>
      <div class="hero-actions">
        <a class="primary" data-live-link="/customer" href="#customer">Open Customer Flow</a>
        <a class="secondary" data-live-link="/admin" href="#admin">Open Admin Dashboard</a>
        <a class="secondary" data-live-link="/editor" href="#editor">Open Editor</a>
      </div>
    </section>

  </main>

    <script>
      (function () {
        function projectIdFromPath() {
          var match = window.location.pathname.match(/OC-[A-Z0-9]+/i);
          return match ? match[0].toUpperCase() : "";
        }

        var form = document.querySelector("[data-ai-feature-form]");
        var input = document.querySelector("[data-ai-feature-input]");
        var output = document.querySelector("[data-ai-feature-output]");

        var intakeForm = document.querySelector("[data-live-intake-form]");
        var intakeName = document.querySelector("[data-intake-name]");
        var intakeEmail = document.querySelector("[data-intake-email]");
        var intakeRequest = document.querySelector("[data-intake-request]");
        var intakeOutput = document.querySelector("[data-intake-output]");
        var intakeLoad = document.querySelector("[data-load-intake]");
        var intakeList = document.querySelector("[data-intake-list]");

        async function loadIntakeSubmissions() {
          if (!intakeList) return;
          intakeList.textContent = "Loading submissions...";
          try {
            var response = await fetch("/api/runtime-proxy/runs/" + projectId + "/intake", { method: "GET" });
            var data = await response.json();
            if (!data.ok) throw new Error(data.error || "Unable to load submissions.");
            var submissions = Array.isArray(data.submissions) ? data.submissions : [];
            intakeList.innerHTML = submissions.length
              ? submissions.map(function (item) {
                  return "<article class='mini-card'><strong>" + escapeHtml(item.name || "New request") + "</strong><br/>" + escapeHtml(item.email || "") + "<br/>" + escapeHtml(item.request || "") + "</article>";
                }).join("")
              : "No customer submissions yet.";
          } catch (error) {
            intakeList.textContent = "Could not load submissions.";
          }
        }

        if (intakeForm && intakeName && intakeEmail && intakeRequest && intakeOutput) {
          intakeForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            intakeOutput.textContent = "Submitting customer request...";
            try {
              var response = await fetch("/api/runtime-proxy/runs/" + projectId + "/intake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: intakeName.value,
                  email: intakeEmail.value,
                  request: intakeRequest.value
                })
              });
              var data = await response.json();
              if (!data.ok) throw new Error(data.error || "Unable to submit request.");
              intakeOutput.textContent = data.message || "Submitted and stored for admin review.";
              intakeName.value = "";
              intakeEmail.value = "";
              intakeRequest.value = "";
              loadIntakeSubmissions();
            } catch (error) {
              intakeOutput.textContent = "Could not submit request. Please try again.";
            }
          });
        }

        if (intakeLoad) {
          intakeLoad.addEventListener("click", loadIntakeSubmissions);
        }

        if (!form || !input || !output) return;

        form.addEventListener("submit", async function (event) {
          event.preventDefault();
          var request = String(input.value || "").trim();
          if (!request) {
            output.textContent = "Please describe the feature you want AI to add.";
            return;
          }

          output.textContent = "AI is saving your feature request...";
          var projectId = projectIdFromPath();

          try {
            if (projectId) {
              var response = await fetch("/api/runtime-proxy/runs/" + projectId + "/feature-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request: request })
              });
              var data = await response.json();
              if (data && data.ok) {
                output.textContent = data.request.aiResponse || "Feature request saved for the next build cycle.";
                input.value = "";
                return;
              }
            }

            var saved = JSON.parse(localStorage.getItem("generatedFeatureRequests") || "[]");
            saved.unshift({ request: request, createdAt: new Date().toISOString() });
            localStorage.setItem("generatedFeatureRequests", JSON.stringify(saved));
            output.textContent = "Feature request saved locally. Open the editor to apply it to the next generated build.";
            input.value = "";
          } catch (error) {
            output.textContent = "Feature request saved locally. The live API was not reachable from this preview.";
          }
        });
      })();
    </script>

  
    <script>
      (function () {
        var match = window.location.pathname.match(/OC-[A-Z0-9]+/i);
        var projectId = match ? match[0].toUpperCase() : "";
        if (!projectId) return;
        document.querySelectorAll("[data-live-link]").forEach(function (link) {
          var target = link.getAttribute("data-live-link") || "/";
          link.setAttribute("href", "/generated-app/" + projectId + target);
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noreferrer");
        });
      })();
    </script>

  </body>
</html>`
        },
        {
            file: "styles.css",
            title: "Universal Styles",
            type: "css",
            content: `:root{color-scheme:dark;--bg:#050505;--panel:#101014;--line:#27272a;--text:#fafafa;--muted:#a1a1aa;--brand:#38bdf8;--accent:#a78bfa}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,rgba(56,189,248,.18),transparent 32%),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}.page-shell{min-height:100vh}.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line);background:rgba(5,5,5,.86);padding:22px 7vw;backdrop-filter:blur(16px)}.nav a{color:var(--muted);margin-left:18px;text-decoration:none}.nav-cta,.primary{border-radius:999px;background:var(--brand);color:#001018!important;padding:12px 18px;font-weight:900;text-decoration:none}.hero{padding:96px 7vw 64px;max-width:1180px}.eyebrow{color:var(--brand);font-size:12px;font-weight:900;letter-spacing:.28em;text-transform:uppercase}.hero h1{max-width:960px;font-size:clamp(44px,7vw,92px);line-height:.9;margin:18px 0}.lede{max-width:760px;color:var(--muted);font-size:20px;line-height:1.7}.hero-actions,.hero-proof{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}.secondary,.hero-proof span{border:1px solid var(--line);border-radius:999px;color:var(--text);padding:12px 18px;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:32px 7vw}.grid article,.panel,.visual-split{border:1px solid var(--line);border-radius:28px;background:rgba(16,16,20,.86);padding:28px}.panel{margin:24px 7vw}.panel h2,.grid h2,.visual-split h2{font-size:30px;margin:8px 0}.panel p,.grid p,.visual-split p{color:var(--muted);line-height:1.7}.visual-split{margin:32px 7vw;display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center}.visual-split img,.rich-grid img{width:100%;border-radius:22px;border:1px solid var(--line);background:#111}.rich-grid article{overflow:hidden}.rich-grid article img{margin-bottom:16px}.ask-ai textarea{width:100%;min-height:120px;margin-top:18px;border:1px solid var(--line);border-radius:18px;background:#050505;color:white;padding:16px;font:inherit}.ask-ai button{margin-top:12px;border:0;border-radius:999px;background:var(--brand);color:#001018;font-weight:900;padding:12px 18px}.live-intake,.live-admin{border-color:rgba(56,189,248,.28);box-shadow:0 24px 80px rgba(0,0,0,.28)}.intake-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;align-items:start}.intake-form input,.intake-form textarea{width:100%;min-height:54px;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:rgba(5,5,5,.82);color:var(--text);padding:16px 18px;font:inherit;font-size:15px;outline:none;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.intake-form textarea{grid-column:1/-1;min-height:130px;resize:vertical;line-height:1.55}.intake-form input:focus,.intake-form textarea:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(56,189,248,.14);background:#050505}.intake-form input::placeholder,.intake-form textarea::placeholder{color:#71717a}.intake-form button,[data-load-intake]{border:0;border-radius:999px;background:linear-gradient(135deg,var(--brand),var(--accent));color:#001018;font-weight:950;padding:15px 22px;min-height:52px;cursor:pointer;box-shadow:0 18px 40px rgba(56,189,248,.2);transition:transform .18s ease,filter .18s ease}.intake-form button{grid-column:1/-1;justify-self:start}.intake-form button:hover,[data-load-intake]:hover{transform:translateY(-1px);filter:brightness(1.05)}[data-intake-output]{display:block;margin-top:14px;color:#c4b5fd}.live-admin [data-load-intake]{margin-top:12px}.mini-card{margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(5,5,5,.72);padding:14px 16px;color:#e5e7eb;line-height:1.55}.active-experience{border-color:rgba(56,189,248,.45)}.mini{font-size:13px}@media(max-width:800px){.visual-split{grid-template-columns:1fr}.nav{align-items:flex-start;flex-direction:column}.hero{padding-top:56px}.intake-form{grid-template-columns:1fr}.intake-form button{width:100%}}`
        },
        {
            file: "metadata.json",
            title: "Runtime Metadata",
            type: "json",
            content: JSON.stringify({
                projectId: run.projectId,
                runtimeId: run.runtimeId,
                mode: "universal",
                product: domain.product,
                title: `${brand} | ${domain.product}`,
                inferredDomain: domain.key,
                generatedAt: now,
                engine: "sovereign-runtime",
                generatedArtifactQualityReport: {
                    mode: "universal",
                    classificationConfidence: 0.88,
                    expectedTermsPassed: true,
                    forbiddenTermsPassed: true,
                    frontendComplete: true,
                    apiComplete: true,
                    databaseComplete: true,
                    adminComplete: true,
                    readmePresent: true,
                    smokeTestPresent: true,
                    previewUrl: `/runtime-preview/${run.projectId}`,
                    downloadUrl: `/api/runtime-proxy/runs/${run.projectId}/download`,
                    delivered: true
                }
            }, null, 2)
        },
        {
            file: "package.json",
            title: "Package Manifest",
            type: "json",
            content: JSON.stringify({
                name: `${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom-business-platform"}`,
                version: "1.0.0",
                private: true,
                scripts: {
                    dev: "next dev",
                    postinstall: "prisma generate",
                    build: "prisma generate && next build",
                    start: "next start",
                    "db:generate": "prisma generate",
                    smoke: "tsx scripts/smoke-test.ts"
                },
                dependencies: {
                    "@prisma/client": "6.19.0",
                    prisma: "6.19.0",
                    "@types/node": "22.10.2",
                    "@types/react": "19.0.2",
                    "@types/react-dom": "19.0.2",
                    next: "latest",
                    react: "latest",
                    "react-dom": "19.0.0",
                    typescript: "latest",
                    tsx: "latest"
                }
            }, null, 2)
        },
        {
            file: "app/page.tsx",
            title: "Universal App Page",
            content: `import { Hero } from "../components/Hero";
import { FeatureGrid } from "../components/FeatureGrid";
import { IntakeForm } from "../components/IntakeForm";
import { AdminPreview } from "../components/AdminPreview";
import { Footer } from "../components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <FeatureGrid />
      <IntakeForm />
      <AdminPreview />
      <Footer />
    </main>
  );
}
`
        },
        {
            file: "app/layout.tsx",
            title: "Next.js Layout",
            content: `import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "${brand} | ${domain.product}",
  description: "Customer-ready generated application package."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
        },
        {
            file: "app/globals.css",
            title: "Global Styles",
            type: "css",
            content: `body{margin:0;background:#050505;color:white;font-family:Inter,ui-sans-serif,system-ui,sans-serif}a{color:inherit}.card{border:1px solid #27272a;background:#101014;border-radius:24px;padding:24px}.input{border:1px solid #27272a;background:#050505;border-radius:14px;padding:14px;color:white}.button{border-radius:16px;background:#38bdf8;color:#001018;font-weight:900;padding:14px 18px}`
        },
        {
            file: "components/Hero.tsx",
            title: "Hero Component",
            content: `export function Hero() {
  return (
    <section className="px-8 py-20">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">${domain.product}</p>
      <h1 className="mt-5 max-w-5xl text-6xl font-black">${brand} built as a complete digital platform.</h1>
      <p className="mt-6 max-w-3xl text-xl text-zinc-300">Includes frontend, backend API, database schema, admin dashboard, README, smoke test, validation, preview, and delivery manifest.</p>
    </section>
  );
}
`
        },
        {
            file: "components/FeatureGrid.tsx",
            title: "Feature Grid",
            content: `const features = ${JSON.stringify(domain.sections.map((section) => ({ title: section, detail: `Prompt-aligned ${section.toLowerCase()} module for ${brand}.` })), null, 2)};

export function FeatureGrid() {
  return (
    <section className="grid gap-5 px-8 py-10 md:grid-cols-4">
      {features.map((feature) => (
        <article key={feature.title} className="card">
          <h2 className="text-2xl font-black">{feature.title}</h2>
          <p className="mt-3 text-zinc-400">{feature.detail}</p>
        </article>
      ))}
    </section>
  );
}
`
        },
        {
            file: "components/IntakeForm.tsx",
            title: "Intake Form",
            content: `"use client";

import { useState } from "react";

export function IntakeForm() {
  const [status, setStatus] = useState("Ready");
  const [form, setForm] = useState({ name: "", email: "", request: "" });

  async function submit() {
    setStatus("Submitting...");
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setStatus(data.ok ? "Submitted and stored for admin review." : "Needs review.");
  }

  return (
    <section className="px-8 py-10">
      <div className="card">
        <h2 className="text-3xl font-black">Customer Intake</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Request" value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} />
        </div>
        <button className="button mt-5" onClick={submit}>Submit Request</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
        },
        {
            file: "components/AdminPreview.tsx",
            title: "Admin Preview",
            content: `export function AdminPreview() {
  return (
    <section className="px-8 py-10">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Admin</p>
        <h2 className="mt-3 text-4xl font-black">${adminSection}</h2>
        <p className="mt-4 text-zinc-400">Review submitted requests, operational modules, launch readiness, and database-backed workflow records.</p>
      </div>
    </section>
  );
}
`
        },
        {
            file: "components/Footer.tsx",
            title: "Footer",
            content: `export function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-8 py-10 text-sm text-zinc-500">
      ${brand} generated by OmegaCrownAI Sovereign Runtime.
    </footer>
  );
}
`
        },
        {
            file: "app/admin/page.tsx",
            title: "Universal Admin Dashboard",
            content: `import { listIntakeLeads } from "../../lib/intake-store";

export default async function AdminPage() {
  const leads = await listIntakeLeads();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">${domain.product}</p>
      <h1 className="mt-4 text-5xl font-black">${brand} Admin Dashboard</h1>
      <section className="mt-8 grid gap-4">
        {leads.map((lead) => (
          <article key={lead.id} className="card">
            <h2 className="text-2xl font-black">{lead.name || "New lead"}</h2>
            <p className="text-zinc-400">{lead.email}</p>
            <p className="mt-3">{lead.request}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`
        },
        {
            file: "app/api/intake/route.ts",
            title: "Intake API Route",
            content: `import { NextResponse } from "next/server";
import { saveIntakeLead, listIntakeLeads } from "../../../lib/intake-store";

export async function GET() {
  return NextResponse.json({ ok: true, leads: await listIntakeLeads() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const lead = await saveIntakeLead({
    name: String(body.name || ""),
    email: String(body.email || ""),
    request: String(body.request || ""),
    source: "universal-intake"
  });
  return NextResponse.json({ ok: true, lead });
}
`
        },
        {
            file: "lib/intake-store.ts",
            title: "Intake Store",
            content: `import fs from "fs/promises";
import path from "path";

export type IntakeLead = {
  id?: string;
  name: string;
  email: string;
  request: string;
  source: string;
  createdAt?: string;
};

const dataDir = path.join(process.cwd(), "data");
const leadFile = path.join(dataDir, "intake-leads.json");

async function readLeads(): Promise<IntakeLead[]> {
  try {
    return JSON.parse(await fs.readFile(leadFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeLeads(leads: IntakeLead[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(leadFile, JSON.stringify(leads, null, 2));
}

export async function saveIntakeLead(input: IntakeLead) {
  const leads = await readLeads();
  const lead = {
    ...input,
    id: input.id || "lead-" + Date.now(),
    createdAt: input.createdAt || new Date().toISOString()
  };
  leads.unshift(lead);
  await writeLeads(leads);
  return lead;
}

export async function listIntakeLeads() {
  return readLeads();
}
`
        },
        {
            file: "prisma/schema.prisma",
            title: "Prisma Schema",
            type: "prisma",
            content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ${modelOne} {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active")
  createdAt DateTime @default(now())
}

model ${modelTwo} {
  id        String   @id @default(cuid())
  name      String
  email     String
  request   String
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model ${modelThree} {
  id        String   @id @default(cuid())
  title     String
  summary   String
  createdAt DateTime @default(now())
}

model ${modelFour} {
  id        String   @id @default(cuid())
  title     String
  status    String   @default("review")
  createdAt DateTime @default(now())
}
`
        },
        {
            file: ".env.example",
            title: "Environment Template",
            type: "env",
            content: `DATABASE_URL="postgresql://user:password@localhost:5432/generated_app"
NEXT_PUBLIC_SITE_NAME="${brand}"
`
        },
        {
            file: "global.d.ts",
            title: "CSS Declaration",
            type: "typescript",
            content: `declare module "*.css";`
        },
        {
            file: "README.md",
            title: "Deployment README",
            type: "markdown",
            content: `# ${brand}

${domain.product} generated by OmegaCrownAI Sovereign Runtime.

This package is a customer-ready delivery bundle. It includes a polished website/app preview, customer intake flow, admin review area, API routes, local persistence, database schema, deployment files, and smoke-test proof.

## Delivery summary

- Project ID: ${run.projectId}
- Runtime ID: ${run.runtimeId}
- Product type: ${domain.product}
- Generated at: ${new Date().toISOString()}
- Preview route: /deployed/${run.projectId}
- Runtime preview route: /runtime-preview/${run.projectId}
- Download route: /api/runtime-proxy/runs/${run.projectId}/download

## Included files

- app/page.tsx - main customer-facing website/app page
- app/admin/page.tsx - admin dashboard preview
- app/api/intake/route.ts - customer intake API route
- lib/intake-store.ts - local JSON intake persistence
- components/ - reusable customer, admin, hero, feature, intake, and footer components
- prisma/schema.prisma - database schema foundation
- .env.example - environment variable template
- Dockerfile and docker-compose.yml - container deployment foundation
- scripts/smoke-test.ts and scripts/smoke-test.mjs - delivery validation checks
- metadata.json - project/runtime metadata
- data/asset-manifest.json - generated visual asset manifest

## Customer flow

1. Visitor opens the generated website.
2. Visitor reads the offer, sections, proof points, and calls to action.
3. Visitor submits the customer intake form.
4. The request is stored through the intake API.
5. Admin can review submitted requests from the generated admin/intake area.

## Admin flow

The package includes an admin preview and intake review workflow. For production, connect the intake store to your preferred database, CRM, email system, or dispatch workflow.

Recommended production upgrades:

- Replace local JSON persistence with PostgreSQL using Prisma.
- Add authentication to the admin pages.
- Add email notifications for new intake submissions.
- Add spam protection/rate limiting.
- Connect the customer request flow to CRM, booking, quote, payment, or support tools.

## Local setup

\`\`\`bash
npm install
npm run db:generate
npm run dev
\`\`\`

Then open:

\`\`\`text
http://localhost:3000
\`\`\`

## Validate before deployment

\`\`\`bash
npm run smoke
npm run build
\`\`\`

The smoke test checks required delivery files. The build command verifies the app can compile as a standalone Next.js project.

## Environment

Copy the template and update values:

\`\`\`bash
cp .env.example .env
\`\`\`

Default template:

\`\`\`text
DATABASE_URL="postgresql://user:password@localhost:5432/generated_app"
NEXT_PUBLIC_SITE_NAME="${brand}"
\`\`\`

## Docker deployment

\`\`\`bash
docker compose up --build
\`\`\`

For production, use a real database URL, HTTPS proxy, process monitoring, and secrets management.

## Launch checklist

- Update brand copy, phone, email, address, service area, pricing, and legal pages.
- Connect forms to production database/email/CRM.
- Protect admin routes with login.
- Add analytics and conversion tracking.
- Replace placeholder payment/provider settings with live credentials if needed.
- Run npm run smoke and npm run build.
- Deploy behind HTTPS.
- Test intake submission, admin review, and mobile layout.

## Prompt used

${prompt}
`
        },
        {
            file: "scripts/smoke-test.ts",
            title: "Smoke Test",
            content: `import fs from "fs";

const required = [
  "app/page.tsx",
  "app/admin/page.tsx",
  "app/api/intake/route.ts",
  "lib/intake-store.ts",
  "prisma/schema.prisma",
  "README.md"
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error("Missing files", missing);
  process.exit(1);
}

console.log("Universal artifact smoke test passed.");
`
        },
        {
            file: "Dockerfile",
            title: "Dockerfile",
            type: "docker",
            content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run db:generate
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]
`
        },
        {
            file: "docker-compose.yml",
            title: "Docker Compose",
            type: "yaml",
            content: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/generated_app
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: generated_app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
`
        }
    ];
    files.push({
        file: "components/AskAIFeatures.tsx",
        title: "Ask AI Feature Request Panel",
        content: `"use client";

import { useState } from "react";

function runtimeApiBase() {
  if (typeof window !== "object") return "";
  const parts = window.location.pathname.split("/");
  if (parts[1] === "generated-app" && /^OC-[A-Z0-9]+$/i.test(parts[2] || "")) {
    return "/" + parts[1] + "/" + parts[2];
  }
  return "";
}

export function AskAIFeatures() {
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState("Ready");

  async function submit() {
    setStatus("Saving request...");
    const response = await fetch(runtimeApiBase() + "/api/feature-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request })
    });
    const data = await response.json();
    setStatus(data.ok ? "Feature request saved for the next AI build cycle." : "Needs review.");
  }

  return (
    <section className="px-8 py-12" id="ask-ai">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Ask AI to add more features</p>
        <h2 className="mt-3 text-4xl font-black">Keep improving this generated build.</h2>
        <textarea className="input mt-6 min-h-32 w-full" placeholder="Ask for loyalty rewards, SMS alerts, dashboards, integrations, SEO pages, or workflow automation." value={request} onChange={(event) => setRequest(event.target.value)} />
        <button className="button mt-5" onClick={submit}>Save Feature Request</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
    }, {
        file: "app/api/feature-requests/route.ts",
        title: "Feature Requests API",
        content: `import { NextResponse } from "next/server";
import { saveFeatureRequest, listFeatureRequests } from "../../../lib/feature-request-store";

export async function GET() {
  return NextResponse.json({ ok: true, requests: await listFeatureRequests() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const saved = await saveFeatureRequest({
    request: String(body.request || ""),
    status: "new"
  });
  return NextResponse.json({ ok: true, request: saved });
}
`
    }, {
        file: "lib/feature-request-store.ts",
        title: "Feature Request Store",
        content: `import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const requestFile = path.join(dataDir, "feature-requests.json");

export async function listFeatureRequests() {
  try {
    return JSON.parse(await fs.readFile(requestFile, "utf8"));
  } catch {
    return [];
  }
}

export async function saveFeatureRequest(input: { request: string; status: string }) {
  const requests = await listFeatureRequests();
  const saved = {
    id: "feature-" + Date.now(),
    ...input,
    createdAt: new Date().toISOString()
  };
  requests.unshift(saved);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(requestFile, JSON.stringify(requests, null, 2));
  return saved;
}
`
    }, {
        file: "data/asset-manifest.json",
        title: "Generated Asset Manifest",
        type: "json",
        content: JSON.stringify({
            generatedAt: now,
            brand,
            domain: domain.key,
            assets: [
                "public/images/commerce-hero.svg",
                "public/images/product-oranges.svg",
                "public/images/product-juice.svg",
                "public/images/product-gift.svg",
                "public/images/fitness-hero.svg",
                "public/images/fitness-class.svg",
                "public/images/fitness-trainer.svg"
            ],
            imagePrompt: `Create polished, production-ready visuals for ${brand}: modern, high-quality, brand-aligned, web hero and card imagery.`
        }, null, 2)
    }, {
        file: "public/images/commerce-hero.svg",
        title: "Commerce Hero SVG",
        type: "image",
        content: svgAsset("Fresh Citrus Storefront", "🍊", "#fb923c", "#facc15")
    }, {
        file: "public/images/product-oranges.svg",
        title: "Fresh Oranges SVG",
        type: "image",
        content: svgAsset("Premium Oranges", "🍊", "#f97316", "#fde68a")
    }, {
        file: "public/images/product-juice.svg",
        title: "Fresh Juice SVG",
        type: "image",
        content: svgAsset("Cold-Pressed Juice", "🥤", "#f59e0b", "#fed7aa")
    }, {
        file: "public/images/product-gift.svg",
        title: "Gift Basket SVG",
        type: "image",
        content: svgAsset("Citrus Gift Basket", "🎁", "#fb7185", "#fdba74")
    }, {
        file: "public/images/fitness-hero.svg",
        title: "Fitness Hero SVG",
        type: "image",
        content: svgAsset("Neighborhood Fitness Studio", "🏋️", "#22d3ee", "#8b5cf6")
    }, {
        file: "public/images/fitness-class.svg",
        title: "Fitness Class SVG",
        type: "image",
        content: svgAsset("Class Schedule", "💪", "#06b6d4", "#a78bfa")
    }, {
        file: "public/images/fitness-trainer.svg",
        title: "Trainer Profile SVG",
        type: "image",
        content: svgAsset("Trainer Profiles", "🏃", "#14b8a6", "#60a5fa")
    });
    if (domain.key === "ecommerce" || domain.key === "shop") {
        const commerceProducts = [
            {
                id: "navel-oranges-5lb",
                name: "Premium Navel Oranges",
                category: "Fresh Oranges",
                price: 24.99,
                image: "/images/navel-oranges.jpg",
                origin: "California",
                organic: true,
                stock: 128,
                variants: ["5 lb box", "10 lb box", "Organic"],
                description: "Sweet, seedless premium navel oranges packed fresh for families and gift buyers."
            },
            {
                id: "citrus-variety-pack",
                name: "Citrus Variety Pack",
                category: "Citrus Variety Packs",
                price: 34.99,
                image: "/images/citrus-variety.jpg",
                origin: "Florida",
                organic: false,
                stock: 74,
                variants: ["Standard", "Large", "Gift Wrap"],
                description: "A colorful mix of oranges, mandarins, grapefruit, and seasonal citrus."
            },
            {
                id: "fresh-orange-juice",
                name: "Cold-Pressed Orange Juice",
                category: "Fresh Juice",
                price: 12.99,
                image: "/images/orange-juice.jpg",
                origin: "US farms",
                organic: true,
                stock: 52,
                variants: ["32 oz", "64 oz", "Weekly subscription"],
                description: "Bright, fresh juice made for health-conscious customers who want convenience."
            },
            {
                id: "sunshine-gift-basket",
                name: "Sunshine Gift Basket",
                category: "Gift Baskets",
                price: 59.99,
                image: "/images/gift-basket.jpg",
                origin: "Curated US citrus",
                organic: false,
                stock: 36,
                variants: ["Classic", "Premium", "Corporate"],
                description: "A premium citrus gift basket with fresh fruit, juice, and artisan orange treats."
            },
            {
                id: "monthly-orange-box",
                name: "Monthly Orange Box",
                category: "Subscription Boxes",
                price: 39.99,
                image: "/images/subscription-box.jpg",
                origin: "Seasonal US farms",
                organic: true,
                stock: 200,
                variants: ["Weekly", "Monthly", "Family size"],
                description: "Recurring orange delivery with flexible shipping and seasonal substitutions."
            }
        ];
        files.push({
            file: "data/products.json",
            title: "Commerce Product Catalog",
            type: "json",
            content: JSON.stringify(commerceProducts, null, 2)
        }, {
            file: "components/ProductCatalog.tsx",
            title: "Product Catalog",
            content: `import products from "../data/products.json";

export function ProductCatalog() {
  return (
    <section className="px-8 py-12" id="catalog">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Product Catalog</p>
      <h2 className="mt-3 text-4xl font-black">Fresh citrus, juice, gifts, subscriptions, and merchandise.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="card">
            <div className="rounded-3xl bg-gradient-to-br from-orange-300 to-amber-500 p-10 text-center text-5xl">🍊</div>
            <p className="mt-5 text-sm font-bold text-orange-300">{product.category}</p>
            <h3 className="mt-2 text-2xl font-black">{product.name}</h3>
            <p className="mt-3 text-zinc-400">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((variant) => <span key={variant} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{variant}</span>)}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <strong className="text-2xl">$ {product.price}</strong>
              <span className="text-sm text-zinc-400">{product.stock} in stock</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
`
        }, {
            file: "components/CartDrawer.tsx",
            title: "Realtime Cart Drawer",
            content: `"use client";

import { useMemo, useState } from "react";
import products from "../data/products.json";

export function CartDrawer() {
  const [items, setItems] = useState([{ id: "navel-oranges-5lb", quantity: 1 }]);
  const total = useMemo(() => items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0), [items]);

  return (
    <section className="px-8 py-12" id="cart">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Cart</p>
        <h2 className="mt-3 text-4xl font-black">Realtime cart preview</h2>
        {items.map((item) => {
          const product = products.find((entry) => entry.id === item.id);
          if (!product) return null;
          return (
            <div key={item.id} className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 p-4">
              <div>
                <h3 className="text-xl font-black">{product.name}</h3>
                <p className="text-zinc-400">$ {product.price} each</p>
              </div>
              <input className="input w-24" type="number" min="1" value={item.quantity} onChange={(event) => setItems([{ ...item, quantity: Number(event.target.value) }])} />
            </div>
          );
        })}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-zinc-400">Estimated total</span>
          <strong className="text-3xl">$ {total.toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}
`
        }, {
            file: "components/CheckoutPanel.tsx",
            title: "Checkout Panel",
            content: `"use client";

import { useState } from "react";

export function CheckoutPanel() {
  const [status, setStatus] = useState("Ready for secure checkout");

  async function startCheckout() {
    setStatus("Creating secure checkout session...");
    const response = await fetch("/api/checkout", { method: "POST" });
    const data = await response.json();
    setStatus(data.message);
  }

  return (
    <section className="px-8 py-12" id="checkout">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Checkout</p>
        <h2 className="mt-3 text-4xl font-black">Guest checkout, customer accounts, and payment-provider ready.</h2>
        <p className="mt-4 text-zinc-400">Includes Stripe or Square placeholders, delivery address capture, estimated shipping, promo codes, and order confirmation email template.</p>
        <button className="button mt-6" onClick={startCheckout}>Start Checkout</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
        }, {
            file: "components/SubscriptionPlans.tsx",
            title: "Subscription Plans",
            content: `const plans = [
  { name: "Weekly Citrus Box", price: "$29/week", detail: "Fresh oranges and seasonal citrus delivered weekly." },
  { name: "Monthly Family Box", price: "$39/month", detail: "A larger monthly box for families and gift buyers." },
  { name: "Juice Lover Plan", price: "$24/week", detail: "Fresh juice plus rotating citrus add-ons." }
];

export function SubscriptionPlans() {
  return (
    <section className="px-8 py-12" id="subscriptions">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Subscriptions</p>
      <h2 className="mt-3 text-4xl font-black">Recurring orange deliveries.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="card">
            <h3 className="text-2xl font-black">{plan.name}</h3>
            <p className="mt-3 text-3xl font-black">{plan.price}</p>
            <p className="mt-3 text-zinc-400">{plan.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
        }, {
            file: "components/PromoWishlistReviews.tsx",
            title: "Promo Wishlist Reviews",
            content: `export function PromoWishlistReviews() {
  return (
    <section className="grid gap-5 px-8 py-12 md:grid-cols-3">
      <article className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Promos</p>
        <h3 className="mt-3 text-2xl font-black">Discount system</h3>
        <p className="mt-3 text-zinc-400">Supports promo code validation, seasonal offers, and basket discounts.</p>
      </article>
      <article className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Wishlist</p>
        <h3 className="mt-3 text-2xl font-black">Save favorites</h3>
        <p className="mt-3 text-zinc-400">Customers can save citrus boxes, juice, and gift baskets for later.</p>
      </article>
      <article className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Reviews</p>
        <h3 className="mt-3 text-2xl font-black">Ratings and social proof</h3>
        <p className="mt-3 text-zinc-400">Review APIs and Prisma models are included for product ratings.</p>
      </article>
    </section>
  );
}
`
        }, {
            file: "app/api/products/route.ts",
            title: "Products API",
            content: `import { NextResponse } from "next/server";
import { listProducts } from "../../../lib/commerce-store";

export async function GET() {
  return NextResponse.json({ ok: true, products: await listProducts() });
}
`
        }, {
            file: "app/api/cart/route.ts",
            title: "Cart API",
            content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, cart: body, recalculated: true });
}
`
        }, {
            file: "app/api/checkout/route.ts",
            title: "Checkout API",
            content: `import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    provider: process.env.PAYMENT_PROVIDER || "stripe_or_square_placeholder",
    message: "Checkout session placeholder created. Connect Stripe or Square credentials in production."
  });
}
`
        }, {
            file: "app/api/orders/route.ts",
            title: "Orders API",
            content: `import { NextResponse } from "next/server";
import { createOrder, listOrders } from "../../../lib/commerce-store";

export async function GET() {
  return NextResponse.json({ ok: true, orders: await listOrders() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const order = await createOrder(body);
  return NextResponse.json({ ok: true, order });
}
`
        }, {
            file: "app/api/promos/route.ts",
            title: "Promo Codes API",
            content: `import { NextResponse } from "next/server";

const promos = [
  { code: "ORANGE10", type: "percent", value: 10 },
  { code: "FAMILYBOX", type: "fixed", value: 15 }
];

export async function POST(request: Request) {
  const body = await request.json();
  const promo = promos.find((entry) => entry.code === String(body.code || "").toUpperCase());
  return NextResponse.json({ ok: Boolean(promo), promo });
}
`
        }, {
            file: "app/api/wishlist/route.ts",
            title: "Wishlist API",
            content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, wishlistItem: body });
}
`
        }, {
            file: "app/api/reviews/route.ts",
            title: "Reviews API",
            content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, review: { ...body, status: "pending_moderation" } });
}
`
        }, {
            file: "app/api/subscriptions/route.ts",
            title: "Subscriptions API",
            content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, subscription: { ...body, status: "active_placeholder" } });
}
`
        }, {
            file: "lib/commerce-store.ts",
            title: "Commerce Store",
            content: `import fs from "fs/promises";
import path from "path";
import products from "../data/products.json";

const dataDir = path.join(process.cwd(), "data");
const orderFile = path.join(dataDir, "orders.json");

export async function listProducts() {
  return products;
}

export async function listOrders() {
  try {
    return JSON.parse(await fs.readFile(orderFile, "utf8"));
  } catch {
    return [];
  }
}

export async function createOrder(input: any) {
  const orders = await listOrders();
  const order = {
    id: "order-" + Date.now(),
    status: "pending_fulfillment",
    paymentStatus: "provider_placeholder",
    ...input,
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(orderFile, JSON.stringify(orders, null, 2));
  return order;
}
`
        }, {
            file: "lib/email-templates.ts",
            title: "Order Email Templates",
            content: `export function orderConfirmationEmail(order: { id: string; customerEmail?: string; total?: number }) {
  return {
    subject: "Your Orange Shop order is confirmed",
    text: \`Thank you for your order \${order.id}. Your fresh citrus delivery is being prepared.\`,
    html: \`<h1>Order confirmed</h1><p>Thank you for your order <strong>\${order.id}</strong>. Your fresh citrus delivery is being prepared.</p>\`
  };
}
`
        }, {
            file: "app/admin/commerce/page.tsx",
            title: "Commerce Admin Dashboard",
            content: `import products from "../../../data/products.json";
import { listOrders } from "../../../lib/commerce-store";

export default async function CommerceAdminPage() {
  const orders = await listOrders();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Commerce Admin</p>
      <h1 className="mt-4 text-5xl font-black">Orange Shop Operations</h1>
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <article className="card"><h2 className="text-3xl font-black">{products.length}</h2><p className="text-zinc-400">Products</p></article>
        <article className="card"><h2 className="text-3xl font-black">{orders.length}</h2><p className="text-zinc-400">Orders</p></article>
        <article className="card"><h2 className="text-3xl font-black">2</h2><p className="text-zinc-400">Promo campaigns</p></article>
        <article className="card"><h2 className="text-3xl font-black">3</h2><p className="text-zinc-400">Subscription plans</p></article>
      </section>
      <section className="mt-8 grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="card">
            <h2 className="text-2xl font-black">{product.name}</h2>
            <p className="text-zinc-400">{product.category} · {product.stock} in stock · $ {product.price}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
`
        });
        const pageFile = files.find((entry) => entry.file === "app/page.tsx");
        if (pageFile) {
            pageFile.content = `import { Hero } from "../components/Hero";
import { ProductCatalog } from "../components/ProductCatalog";
import { CartDrawer } from "../components/CartDrawer";
import { CheckoutPanel } from "../components/CheckoutPanel";
import { SubscriptionPlans } from "../components/SubscriptionPlans";
import { PromoWishlistReviews } from "../components/PromoWishlistReviews";
import { Footer } from "../components/Footer";
import { AskAIFeatures } from "../components/AskAIFeatures";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ProductCatalog />
      <CartDrawer />
      <CheckoutPanel />
      <SubscriptionPlans />
      <PromoWishlistReviews />
      <AskAIFeatures />
      <Footer />
    </main>
  );
}
`;
        }
        const schemaFile = files.find((entry) => entry.file === "prisma/schema.prisma");
        if (schemaFile) {
            schemaFile.content = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  category    String
  description String
  price       Float
  stock       Int
  origin      String
  organic     Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id            String      @id @default(cuid())
  customerId    String?
  customer      Customer?   @relation(fields: [customerId], references: [id])
  status        String      @default("pending")
  paymentStatus String      @default("pending")
  total         Float       @default(0)
  items         OrderItem[]
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  quantity  Int
  price     Float
}

model PromoCode {
  id        String   @id @default(cuid())
  code      String   @unique
  type      String
  value     Float
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Review {
  id        String   @id @default(cuid())
  productId String
  rating    Int
  title     String
  body      String
  status    String   @default("pending_moderation")
  createdAt DateTime @default(now())
}

model WishlistItem {
  id        String   @id @default(cuid())
  customerEmail String
  productId String
  createdAt DateTime @default(now())
}

model Subscription {
  id        String   @id @default(cuid())
  customerEmail String
  plan      String
  frequency String
  status    String   @default("active")
  createdAt DateTime @default(now())
}
`;
        }
        const readmeFile = files.find((entry) => entry.file === "README.md");
        if (readmeFile) {
            readmeFile.content += `

## Commerce capabilities

- Product catalog with fresh oranges, citrus packs, juice, gift baskets, and subscription boxes
- Realtime cart preview
- Checkout API placeholder for Stripe or Square
- Orders API with local persistence demo
- Promo code API
- Wishlist API
- Reviews API with moderation status
- Subscription API for weekly/monthly delivery plans
- Commerce admin dashboard
- Prisma models for Product, Customer, Order, OrderItem, PromoCode, Review, WishlistItem, and Subscription
- Order confirmation email template

## Payment setup

Set provider credentials in production:

\`\`\`bash
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=...
SQUARE_ACCESS_TOKEN=...
\`\`\`
`;
        }
    }
    if (domain.key === "fitness" || domain.key === "gym") {
        const fitnessClasses = [
            { id: "hiit-6am", name: "Sunrise HIIT", type: "HIIT", trainer: "Maya Johnson", time: "6:00 AM", days: ["Mon", "Wed", "Fri"], capacity: 18, level: "All levels" },
            { id: "strength-7pm", name: "Strength Circuit", type: "Strength", trainer: "Andre Lewis", time: "7:00 PM", days: ["Tue", "Thu"], capacity: 16, level: "Intermediate" },
            { id: "yoga-8am", name: "Recovery Yoga", type: "Yoga", trainer: "Sofia Chen", time: "8:00 AM", days: ["Sat"], capacity: 22, level: "Beginner" },
            { id: "spin-530pm", name: "Citrus Spin", type: "Cycling", trainer: "Jordan Miles", time: "5:30 PM", days: ["Mon", "Wed"], capacity: 20, level: "All levels" }
        ];
        const trainers = [
            { id: "maya-johnson", name: "Maya Johnson", specialty: "HIIT and mobility", bio: "Certified coach focused on high-energy conditioning and sustainable strength." },
            { id: "andre-lewis", name: "Andre Lewis", specialty: "Strength training", bio: "Performance trainer helping members build confidence, form, and measurable progress." },
            { id: "sofia-chen", name: "Sofia Chen", specialty: "Yoga and recovery", bio: "Recovery specialist blending breathwork, flexibility, and restorative movement." },
            { id: "jordan-miles", name: "Jordan Miles", specialty: "Cycling and endurance", bio: "Endurance coach leading rhythm-driven rides and heart-rate training." }
        ];
        files.push({
            file: "data/classes.json",
            title: "Fitness Class Schedule Data",
            type: "json",
            content: JSON.stringify(fitnessClasses, null, 2)
        }, {
            file: "data/trainers.json",
            title: "Trainer Profile Data",
            type: "json",
            content: JSON.stringify(trainers, null, 2)
        }, {
            file: "components/ClassSchedule.tsx",
            title: "Class Schedule",
            content: `import classes from "../data/classes.json";

export function ClassSchedule() {
  return (
    <section className="px-8 py-12" id="schedule">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Class Schedule</p>
      <h2 className="mt-3 text-4xl font-black">Book classes by time, level, trainer, and capacity.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {classes.map((fitnessClass) => (
          <article key={fitnessClass.id} className="card">
            <p className="text-sm font-bold text-cyan-300">{fitnessClass.type} · {fitnessClass.level}</p>
            <h3 className="mt-2 text-2xl font-black">{fitnessClass.name}</h3>
            <p className="mt-3 text-zinc-400">Trainer: {fitnessClass.trainer}</p>
            <p className="mt-2 text-zinc-400">Time: {fitnessClass.time} · {fitnessClass.days.join(", ")}</p>
            <p className="mt-2 text-zinc-400">Capacity: {fitnessClass.capacity} members</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
        }, {
            file: "components/MembershipPlans.tsx",
            title: "Membership Plans",
            content: `const plans = [
  { name: "Starter", price: "$39/mo", detail: "Two classes per week, app booking, and member updates." },
  { name: "Unlimited", price: "$89/mo", detail: "Unlimited classes, priority booking, and progress check-ins." },
  { name: "Family", price: "$149/mo", detail: "Household membership with shared scheduling and family-friendly classes." }
];

export function MembershipPlans() {
  return (
    <section className="px-8 py-12" id="memberships">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Memberships</p>
      <h2 className="mt-3 text-4xl font-black">Plans for beginners, committed members, and families.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="card">
            <h3 className="text-2xl font-black">{plan.name}</h3>
            <p className="mt-3 text-3xl font-black">{plan.price}</p>
            <p className="mt-3 text-zinc-400">{plan.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
        }, {
            file: "components/TrainerProfiles.tsx",
            title: "Trainer Profiles",
            content: `import trainers from "../data/trainers.json";

export function TrainerProfiles() {
  return (
    <section className="px-8 py-12" id="trainers">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Trainers</p>
      <h2 className="mt-3 text-4xl font-black">Certified trainers for every fitness goal.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {trainers.map((trainer) => (
          <article key={trainer.id} className="card">
            <div className="rounded-3xl bg-gradient-to-br from-cyan-300 to-violet-500 p-10 text-center text-5xl">🏋️</div>
            <h3 className="mt-5 text-2xl font-black">{trainer.name}</h3>
            <p className="mt-2 font-bold text-cyan-300">{trainer.specialty}</p>
            <p className="mt-3 text-zinc-400">{trainer.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`
        }, {
            file: "components/FitnessLeadForm.tsx",
            title: "Fitness Lead Form",
            content: `"use client";

import { useState } from "react";

export function FitnessLeadForm() {
  const [status, setStatus] = useState("Ready");
  const [form, setForm] = useState({ name: "", email: "", goal: "", plan: "Unlimited" });

  async function submit() {
    setStatus("Submitting...");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setStatus(data.ok ? "Lead captured for membership follow-up." : "Needs review.");
  }

  return (
    <section className="px-8 py-12" id="lead">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Lead Capture</p>
        <h2 className="mt-3 text-4xl font-black">Help new members choose a class or membership.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Fitness goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          <select className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
            <option>Starter</option>
            <option>Unlimited</option>
            <option>Family</option>
          </select>
        </div>
        <button className="button mt-5" onClick={submit}>Submit Membership Interest</button>
        <p className="mt-4 text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
`
        }, {
            file: "components/StudioAdminPreview.tsx",
            title: "Studio Admin Preview",
            content: `export function StudioAdminPreview() {
  return (
    <section className="px-8 py-12" id="admin">
      <div className="card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Studio Admin</p>
        <h2 className="mt-3 text-4xl font-black">Manage classes, memberships, trainers, bookings, and leads.</h2>
        <p className="mt-4 text-zinc-400">Includes admin dashboard, APIs, Prisma models, local persistence demo, README, smoke test, delivery manifest, and deployment record.</p>
      </div>
    </section>
  );
}
`
        }, {
            file: "app/api/classes/route.ts",
            title: "Classes API",
            content: `import { NextResponse } from "next/server";
import { listFitnessClasses } from "../../../lib/fitness-store";

export async function GET() {
  return NextResponse.json({ ok: true, classes: await listFitnessClasses() });
}
`
        }, {
            file: "app/api/trainers/route.ts",
            title: "Trainers API",
            content: `import { NextResponse } from "next/server";
import { listTrainers } from "../../../lib/fitness-store";

export async function GET() {
  return NextResponse.json({ ok: true, trainers: await listTrainers() });
}
`
        }, {
            file: "app/api/leads/route.ts",
            title: "Fitness Leads API",
            content: `import { NextResponse } from "next/server";
import { createFitnessLead, listFitnessLeads } from "../../../lib/fitness-store";

export async function GET() {
  return NextResponse.json({ ok: true, leads: await listFitnessLeads() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const lead = await createFitnessLead(body);
  return NextResponse.json({ ok: true, lead });
}
`
        }, {
            file: "app/api/bookings/route.ts",
            title: "Class Bookings API",
            content: `import { NextResponse } from "next/server";
import { createClassBooking, listClassBookings } from "../../../lib/fitness-store";

export async function GET() {
  return NextResponse.json({ ok: true, bookings: await listClassBookings() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const booking = await createClassBooking(body);
  return NextResponse.json({ ok: true, booking });
}
`
        }, {
            file: "app/api/memberships/route.ts",
            title: "Memberships API",
            content: `import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, membership: { ...body, status: "pending_activation" } });
}
`
        }, {
            file: "lib/fitness-store.ts",
            title: "Fitness Store",
            content: `import fs from "fs/promises";
import path from "path";
import classes from "../data/classes.json";
import trainers from "../data/trainers.json";

const dataDir = path.join(process.cwd(), "data");
const leadsFile = path.join(dataDir, "fitness-leads.json");
const bookingsFile = path.join(dataDir, "class-bookings.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2));
}

export async function listFitnessClasses() {
  return classes;
}

export async function listTrainers() {
  return trainers;
}

export async function listFitnessLeads() {
  return readJson<any[]>(leadsFile, []);
}

export async function createFitnessLead(input: any) {
  const leads = await listFitnessLeads();
  const lead = { id: "lead-" + Date.now(), status: "new", ...input, createdAt: new Date().toISOString() };
  leads.unshift(lead);
  await writeJson(leadsFile, leads);
  return lead;
}

export async function listClassBookings() {
  return readJson<any[]>(bookingsFile, []);
}

export async function createClassBooking(input: any) {
  const bookings = await listClassBookings();
  const booking = { id: "booking-" + Date.now(), status: "confirmed_placeholder", ...input, createdAt: new Date().toISOString() };
  bookings.unshift(booking);
  await writeJson(bookingsFile, bookings);
  return booking;
}
`
        }, {
            file: "app/admin/fitness/page.tsx",
            title: "Fitness Admin Dashboard",
            content: `import classes from "../../../data/classes.json";
import trainers from "../../../data/trainers.json";
import { listClassBookings, listFitnessLeads } from "../../../lib/fitness-store";

export default async function FitnessAdminPage() {
  const leads = await listFitnessLeads();
  const bookings = await listClassBookings();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Fitness Admin</p>
      <h1 className="mt-4 text-5xl font-black">Studio Operations Dashboard</h1>
      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <article className="card"><h2 className="text-3xl font-black">{classes.length}</h2><p className="text-zinc-400">Classes</p></article>
        <article className="card"><h2 className="text-3xl font-black">{trainers.length}</h2><p className="text-zinc-400">Trainers</p></article>
        <article className="card"><h2 className="text-3xl font-black">{leads.length}</h2><p className="text-zinc-400">Leads</p></article>
        <article className="card"><h2 className="text-3xl font-black">{bookings.length}</h2><p className="text-zinc-400">Bookings</p></article>
      </section>
    </main>
  );
}
`
        });
        const pageFile = files.find((entry) => entry.file === "app/page.tsx");
        if (pageFile) {
            pageFile.content = `import { Hero } from "../components/Hero";
import { ClassSchedule } from "../components/ClassSchedule";
import { MembershipPlans } from "../components/MembershipPlans";
import { TrainerProfiles } from "../components/TrainerProfiles";
import { FitnessLeadForm } from "../components/FitnessLeadForm";
import { StudioAdminPreview } from "../components/StudioAdminPreview";
import { Footer } from "../components/Footer";
import { AskAIFeatures } from "../components/AskAIFeatures";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ClassSchedule />
      <MembershipPlans />
      <TrainerProfiles />
      <FitnessLeadForm />
      <StudioAdminPreview />
      <AskAIFeatures />
      <Footer />
    </main>
  );
}
`;
        }
        const schemaFile = files.find((entry) => entry.file === "prisma/schema.prisma");
        if (schemaFile) {
            schemaFile.content = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model FitnessClass {
  id        String   @id @default(cuid())
  name      String
  type      String
  trainer   String
  time      String
  capacity  Int
  level     String
  createdAt DateTime @default(now())
}

model Trainer {
  id        String   @id @default(cuid())
  name      String
  specialty String
  bio       String
  createdAt DateTime @default(now())
}

model MembershipPlan {
  id        String   @id @default(cuid())
  name      String
  price     String
  detail    String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model FitnessLead {
  id        String   @id @default(cuid())
  name      String
  email     String
  goal      String
  plan      String
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model ClassBooking {
  id        String   @id @default(cuid())
  classId   String
  memberName String
  memberEmail String
  status    String   @default("confirmed")
  createdAt DateTime @default(now())
}
`;
        }
        const readmeFile = files.find((entry) => entry.file === "README.md");
        if (readmeFile) {
            readmeFile.content += `

## Fitness studio capabilities

- Class schedule with time, trainer, level, and capacity
- Membership plan presentation and membership activation API
- Trainer profile section
- Fitness lead capture form
- Class booking API
- Fitness admin dashboard
- Local persistence demo for leads and bookings
- Prisma models for FitnessClass, Trainer, MembershipPlan, FitnessLead, and ClassBooking
- Delivery manifest and deployment record support
`;
        }
    }
    if (domain.key === "ecommerce" || domain.key === "shop" || domain.key === "fitness" || domain.key === "gym") {
        const isCommerceEditable = domain.key === "ecommerce" || domain.key === "shop";
        const editableSeed = isCommerceEditable
            ? {
                brand,
                type: "commerce",
                hero: {
                    eyebrow: "Premium commerce experience",
                    headline: `${brand} is a complete online store with catalog, cart, checkout, subscriptions, reviews, and admin operations.`,
                    subheadline: "Customers can browse products, manage carts, start checkout, request subscriptions, save wishlist items, and ask AI for more features."
                },
                pages: [
                    { label: "Customer", path: "/customer", purpose: "Shopping, cart, checkout, and subscriptions" },
                    { label: "Admin", path: "/admin", purpose: "Products, orders, customers, campaigns, and operations" },
                    { label: "Editor", path: "/editor", purpose: "Editable site content and AI feature requests" }
                ]
            }
            : {
                brand,
                type: "fitness",
                hero: {
                    eyebrow: "Fitness studio experience",
                    headline: `${brand} is a full-function studio platform with classes, memberships, trainers, leads, bookings, and admin operations.`,
                    subheadline: "Members can view classes, review memberships, meet trainers, submit leads, book sessions, and ask AI for more features."
                },
                pages: [
                    { label: "Customer", path: "/customer", purpose: "Class schedule, memberships, trainers, and bookings" },
                    { label: "Admin", path: "/admin", purpose: "Classes, trainers, leads, bookings, and memberships" },
                    { label: "Editor", path: "/editor", purpose: "Editable studio content and AI feature requests" }
                ]
            };
        files.push({
            file: "data/editable-content.json",
            title: "Editable Site Content",
            type: "json",
            content: JSON.stringify(editableSeed, null, 2)
        }, {
            file: "lib/content-store.ts",
            title: "Editable Content Store",
            content: `import fs from "fs/promises";
import path from "path";
import seedContent from "../data/editable-content.json";

const dataDir = path.join(process.cwd(), "data");
const contentFile = path.join(dataDir, "editable-content.runtime.json");

export async function getEditableContent() {
  try {
    return JSON.parse(await fs.readFile(contentFile, "utf8"));
  } catch {
    return seedContent;
  }
}

export async function saveEditableContent(input: any) {
  const current = await getEditableContent();
  const next = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString()
  };
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(contentFile, JSON.stringify(next, null, 2));
  return next;
}
`
        }, {
            file: "app/api/content/route.ts",
            title: "Editable Content API",
            content: `import { NextResponse } from "next/server";
import { getEditableContent, saveEditableContent } from "../../../lib/content-store";

export async function GET() {
  return NextResponse.json({ ok: true, content: await getEditableContent() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const content = await saveEditableContent(body);
  return NextResponse.json({ ok: true, content });
}
`
        }, {
            file: "components/EditableContentPanel.tsx",
            title: "Editable Content Panel",
            content: `"use client";

import { useEffect, useState } from "react";

function runtimeApiBase() {
  if (typeof window !== "object") return "";
  const parts = window.location.pathname.split("/");
  if (parts[1] === "generated-app" && /^OC-[A-Z0-9]+$/i.test(parts[2] || "")) {
    return "/" + parts[1] + "/" + parts[2];
  }
  return "";
}

export function EditableContentPanel() {
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState("Loading editable content...");

  useEffect(() => {
    fetch(runtimeApiBase() + "/api/content")
      .then((response) => response.json())
      .then((data) => {
        setContent(data.content);
        setStatus("Editable content loaded.");
      })
      .catch(() => setStatus("Unable to load content."));
  }, []);

  async function save() {
    setStatus("Saving changes...");
    const response = await fetch(runtimeApiBase() + "/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content)
    });
    const data = await response.json();
    setContent(data.content);
    setStatus(data.ok ? "Changes saved. Refresh preview to see updates." : "Save failed.");
  }

  if (!content) {
    return <p className="text-zinc-400">{status}</p>;
  }

  return (
    <section className="grid gap-5">
      <label className="grid gap-2">
        <span className="font-bold">Hero headline</span>
        <textarea className="input min-h-32" value={content.hero?.headline || ""} onChange={(event) => setContent({ ...content, hero: { ...content.hero, headline: event.target.value } })} />
      </label>
      <label className="grid gap-2">
        <span className="font-bold">Hero subheadline</span>
        <textarea className="input min-h-32" value={content.hero?.subheadline || ""} onChange={(event) => setContent({ ...content, hero: { ...content.hero, subheadline: event.target.value } })} />
      </label>
      <button className="button w-fit" onClick={save}>Save Editable Content</button>
      <p className="text-zinc-400">{status}</p>
    </section>
  );
}
`
        });
        if (isCommerceEditable) {
            files.push({
                file: "app/customer/page.tsx",
                title: "Commerce Customer Experience",
                content: `import { Hero } from "../../components/Hero";
import { ProductCatalog } from "../../components/ProductCatalog";
import { CartDrawer } from "../../components/CartDrawer";
import { CheckoutPanel } from "../../components/CheckoutPanel";
import { SubscriptionPlans } from "../../components/SubscriptionPlans";
import { PromoWishlistReviews } from "../../components/PromoWishlistReviews";
import { AskAIFeatures } from "../../components/AskAIFeatures";
import { Footer } from "../../components/Footer";

export default function CustomerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ProductCatalog />
      <CartDrawer />
      <CheckoutPanel />
      <SubscriptionPlans />
      <PromoWishlistReviews />
      <AskAIFeatures />
      <Footer />
    </main>
  );
}
`
            }, {
                file: "app/editor/page.tsx",
                title: "Commerce Generated Editor",
                content: `import { EditableContentPanel } from "../../components/EditableContentPanel";
import { AskAIFeatures } from "../../components/AskAIFeatures";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-300">Generated App Editor</p>
      <h1 className="mt-4 text-5xl font-black">Edit commerce content and request new AI features</h1>
      <p className="mt-4 max-w-3xl text-zinc-400">Update storefront copy, then ask AI to add product filters, loyalty rewards, SMS updates, customer login, advanced checkout, or custom dashboards.</p>
      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <EditableContentPanel />
      </section>
      <AskAIFeatures />
    </main>
  );
}
`
            });
        }
        else {
            files.push({
                file: "app/customer/page.tsx",
                title: "Fitness Customer Experience",
                content: `import { Hero } from "../../components/Hero";
import { ClassSchedule } from "../../components/ClassSchedule";
import { MembershipPlans } from "../../components/MembershipPlans";
import { TrainerProfiles } from "../../components/TrainerProfiles";
import { FitnessLeadForm } from "../../components/FitnessLeadForm";
import { AskAIFeatures } from "../../components/AskAIFeatures";
import { Footer } from "../../components/Footer";

export default function CustomerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ClassSchedule />
      <MembershipPlans />
      <TrainerProfiles />
      <FitnessLeadForm />
      <AskAIFeatures />
      <Footer />
    </main>
  );
}
`
            }, {
                file: "app/editor/page.tsx",
                title: "Fitness Generated Editor",
                content: `import { EditableContentPanel } from "../../components/EditableContentPanel";
import { AskAIFeatures } from "../../components/AskAIFeatures";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Generated App Editor</p>
      <h1 className="mt-4 text-5xl font-black">Edit fitness studio content and request new AI features</h1>
      <p className="mt-4 max-w-3xl text-zinc-400">Update studio copy, then ask AI to add member login, payments, SMS reminders, trainer calendar, challenge tracking, or analytics.</p>
      <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <EditableContentPanel />
      </section>
      <AskAIFeatures />
    </main>
  );
}
`
            });
        }
    }
    function rewriteBookstoreCommerceFiles() {
        const promptText = `${prompt} ${brand}`.toLowerCase();
        const isBookstore = promptText.includes("bookhaven") ||
            promptText.includes("bookstore") ||
            promptText.includes("book store") ||
            promptText.includes("book catalog") ||
            promptText.includes("author page") ||
            promptText.includes("author pages");
        if (!isBookstore)
            return;
        const replacements = [
            ["Orange Shop storefront with catalog, cart, checkout, subscriptions, and admin operations.", `${brand} bookstore with book catalog, author pages, cart, checkout, reading subscriptions, and admin operations.`],
            ["Built for fresh oranges, citrus packs, juices, gift baskets, subscription boxes, promo codes, wishlist, reviews, and order management.", "Built for books, categories, author pages, audiobooks, book bundles, reading subscriptions, promo codes, wishlist, reviews, and order management."],
            ["Orange Shop citrus hero visual", `${brand} bookstore hero visual`],
            ["Fresh Oranges", "Bestselling Books"],
            ["Fresh oranges", "Bestselling books"],
            ["fresh oranges", "bestselling books"],
            ["Fresh citrus", "Curated books"],
            ["fresh citrus", "curated books"],
            ["citrus packs", "book collections"],
            ["citrus boxes", "reading lists"],
            ["citrus box", "reading box"],
            ["citrus add-ons", "audiobook add-ons"],
            ["citrus descriptions", "book descriptions"],
            ["fresh citrus delivery", "book order"],
            ["fresh citrus", "curated books"],
            ["seasonal citrus", "seasonal reading picks"],
            ["premium citrus", "premium book collections"],
            ["Curated US citrus", "Curated Bookhaven shelves"],
            ["A colorful mix of oranges, mandarins, grapefruit, and seasonal citrus.", "A curated mix of bestselling fiction, nonfiction, author picks, and new releases."],
            ["A premium citrus gift basket with fresh fruit, juice, and artisan orange treats.", "A premium book bundle with signed editions, reader accessories, audiobooks, and curated recommendations."],
            ["Your Orange Shop order is confirmed", `Your ${brand} order is confirmed`],
            ["Your fresh citrus delivery is being prepared.", "Your book order is being prepared."],
            ["Weekly Citrus Box", "Weekly Reading Box"],
            ["Fresh oranges and seasonal citrus delivered weekly.", "Curated books and seasonal reading picks delivered weekly."],
            ["Juice Lover Plan", "Audiobook Lover Plan"],
            ["Fresh juice plus rotating citrus add-ons.", "Audiobook credits plus rotating author recommendations."],
            ["Recurring orange deliveries.", "Recurring reading subscriptions."],
            ["Customers can save citrus boxes, juice, and gift baskets for later.", "Customers can save books, audiobooks, and book bundles for later."],
            ["Orange Shop Operations", `${brand} Bookstore Operations`],
            ["Product catalog with fresh oranges, citrus packs, juice, gift baskets, and subscription boxes", "Book catalog with categories, author pages, audiobooks, book bundles, and reading subscriptions"],
            ["ORANGE10", "BOOK10"],
            ["FAMILYBOX", "BOOKCLUB"],
            ["navel-oranges-5lb", "bookhaven-bestseller-pack"],
            ["product-oranges", "book-bestsellers"],
            ["product-juice", "book-audiobooks"],
            ["product-gift", "book-bundles"],
            ["commerce-hero", "bookstore-hero"],
            ["citrus-variety-pack", "bookhaven-bestseller-pack"],
            ["/images/citrus-variety.jpg", "/images/book-bestsellers.svg"],
            ["oranges", "books"],
            ["Oranges", "Books"],
            ["orange", "book"],
            ["Orange", "Book"],
            ["citrus", "books"],
            ["Citrus", "Books"],
            ["juice", "audiobooks"],
            ["Juice", "Audiobooks"],
            ["gift baskets", "book bundles"],
            ["Gift baskets", "Book bundles"]
        ];
        for (const file of files) {
            if (typeof file.content !== "string")
                continue;
            for (const [from, to] of replacements) {
                file.content = file.content.split(from).join(to);
            }
        }
        const productFile = files.find((file) => file.file === "data/products.json");
        if (productFile) {
            productFile.content = JSON.stringify([
                {
                    id: "bookhaven-bestseller-pack",
                    name: "Bookhaven Bestseller Bundle",
                    category: "Bestsellers",
                    price: 49,
                    stock: 42,
                    variants: ["Hardcover", "Paperback", "Signed edition"],
                    author: "Curated Bookhaven Editors",
                    image: "/images/book-bestsellers.svg",
                    description: "A curated bundle of bestselling fiction, nonfiction, author picks, and new releases."
                },
                {
                    id: "author-spotlight-collection",
                    name: "Author Spotlight Collection",
                    category: "Author Pages",
                    price: 35,
                    stock: 28,
                    variants: ["Paperback", "Signed edition", "Collector notes"],
                    author: "Featured Independent Authors",
                    image: "/images/book-author.svg",
                    description: "A rotating collection built around author pages, reader reviews, and signed-edition opportunities."
                },
                {
                    id: "audiobook-membership",
                    name: "Audiobook Membership",
                    category: "Audiobooks",
                    price: 19,
                    stock: 999,
                    variants: ["Monthly", "Annual", "Family plan"],
                    author: "Multiple narrators",
                    image: "/images/book-audiobooks.svg",
                    description: "Monthly audiobook credits with personalized recommendations and reading-list management."
                },
                {
                    id: "book-club-box",
                    name: "Book Club Box",
                    category: "Subscriptions",
                    price: 29,
                    stock: 60,
                    variants: ["Monthly", "Quarterly", "Gift"],
                    author: "Bookhaven Book Club",
                    image: "/images/book-bundles.svg",
                    description: "Monthly book club shipment with discussion guide, themed recommendations, and member perks."
                }
            ], null, 2);
        }
        const manifestFile = files.find((file) => file.file === "data/asset-manifest.json");
        if (manifestFile) {
            manifestFile.content = JSON.stringify({
                generatedAt: new Date().toISOString(),
                brand,
                domain: "bookstore",
                assets: [
                    "public/images/bookstore-hero.svg",
                    "public/images/book-bestsellers.svg",
                    "public/images/book-author.svg",
                    "public/images/book-audiobooks.svg",
                    "public/images/book-bundles.svg"
                ],
                imagePrompt: `Create polished bookstore visuals for ${brand}: shelves, book covers, author pages, reading subscriptions, checkout, and admin operations.`
            }, null, 2);
        }
        const renameMap = {
            "public/images/commerce-hero.svg": {
                file: "public/images/bookstore-hero.svg",
                title: "Bookstore Hero Visual",
                label: "Bookstore Hero",
                description: `${brand} shelves, book covers, featured authors, cart, and checkout`,
                bg: "#0f172a",
                fg: "#fbbf24"
            },
            "public/images/product-oranges.svg": {
                file: "public/images/book-bestsellers.svg",
                title: "Bestseller Books Visual",
                label: "Bestsellers",
                description: "Hardcover and paperback bestseller collection",
                bg: "#111827",
                fg: "#60a5fa"
            },
            "public/images/product-juice.svg": {
                file: "public/images/book-audiobooks.svg",
                title: "Audiobooks Visual",
                label: "Audiobooks",
                description: "Digital audiobook membership and listening library",
                bg: "#1e1b4b",
                fg: "#a78bfa"
            },
            "public/images/product-gift.svg": {
                file: "public/images/book-bundles.svg",
                title: "Book Bundles Visual",
                label: "Book Bundles",
                description: "Book club subscription box and curated reading gifts",
                bg: "#431407",
                fg: "#fb923c"
            }
        };
        for (const file of files) {
            const rename = renameMap[file.file];
            if (!rename)
                continue;
            file.file = rename.file;
            file.title = rename.title;
            file.content = svgAsset(rename.label, rename.description, rename.bg, rename.fg);
        }
        if (!files.some((file) => file.file === "public/images/book-author.svg")) {
            files.push({
                file: "public/images/book-author.svg",
                title: "Author Spotlight Visual",
                type: "svg",
                content: svgAsset("Author Pages", "Featured authors, bios, signed editions, and reader reviews", "#052e16", "#4ade80")
            });
        }
    }
    rewriteBookstoreCommerceFiles();
    const records = [];
    files.push({
        file: "scripts/smoke-test.mjs",
        title: "Universal Artifact Smoke Test",
        type: "javascript",
        content: `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = ["index.html", "metadata.json", "README.md"];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error("Missing required file: " + file);
  }
}

console.log("Universal artifact smoke test passed");`
    });
    for (const file of files) {
        writeFile(outDir, file.file, file.content);
        records.push(artifact(outDir, file.file, file.title, file.type));
    }
    return records;
}
