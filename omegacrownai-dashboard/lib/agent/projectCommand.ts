import { prisma } from "@/lib/db";

function isWebsiteBuildCommand(message: string) {
  const text = String(message || "").toLowerCase();

  return (
    text.includes("build me") ||
    text.includes("create me") ||
    text.includes("make me") ||
    text.includes("create a website") ||
    text.includes("build a website") ||
    text.includes("website") ||
    text.includes("landing page") ||
    text.includes("homepage")
  );
}

function titleCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildProjectName(message: string) {
  const text = String(message || "").trim();

  if (/limo|airport|transport|chauffeur|black car/i.test(text)) {
    return "Luxury Limo Airport Transportation Website";
  }

  if (/restaurant|food|cafe|bar/i.test(text)) {
    return "Restaurant Business Website";
  }

  if (/real estate|realtor|property/i.test(text)) {
    return "Real Estate Website";
  }

  if (/crypto|trading|stock/i.test(text)) {
    return "Trading Platform Website";
  }

  const cleaned = titleCase(
    text
      .replace(/build me/gi, "")
      .replace(/create me/gi, "")
      .replace(/make me/gi, "")
      .replace(/website/gi, "")
      .replace(/landing page/gi, "")
  );

  return cleaned ? `${cleaned} Website` : "Omega Crown AI Website Project";
}

function buildWebsiteBrief(message: string, projectName: string) {
  const isLimo = /limo|airport|transport|chauffeur|black car/i.test(message);

  if (isLimo) {
    return {
      type: "website_build",
      projectName,
      industry: "Luxury Transportation",
      goal: "Create a premium limo and airport transportation website.",
      style: "Luxury, royal, polished, trustworthy, mobile-first.",
      suggestedSections: [
        "Hero with luxury airport transportation headline",
        "O'Hare airport transfer service",
        "Fleet / luxury vehicles",
        "Online booking call-to-action",
        "Service areas",
        "Testimonials",
        "Phone contact section",
      ],
      suggestedCopy: {
        headline: "Luxury Airport Transportation, Built Around Your Schedule",
        subheadline:
          "Professional black car and limo service for airport transfers, business travel, and special events.",
        cta: "Book Your Ride",
      },
    };
  }

  return {
    type: "website_build",
    projectName,
    industry: "General Business",
    goal: `Create a professional website based on this request: ${message}`,
    style: "Modern, clean, trustworthy, conversion-focused.",
    suggestedSections: [
      "Hero section",
      "Services",
      "About",
      "Benefits",
      "Testimonials",
      "Contact",
    ],
    suggestedCopy: {
      headline: projectName,
      subheadline: "A professional website created by Omega Crown AI.",
      cta: "Get Started",
    },
  };
}

async function findOrCreateOwner(userId: string, sessionId: string) {
  const raw = String(userId || "").trim();

  const email =
    raw.includes("@") && raw !== "anonymous"
      ? raw.toLowerCase()
      : `guest-${sessionId}@omegacrownai.local`;

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email.includes("omegacrownai.local") ? "Guest User" : null,
      passwordHash: "agent-created-user",
    },
  });
}

export async function runProjectCommand({
  userId,
  sessionId,
  message,
  context = {},
}: {
  userId: string;
  sessionId: string;
  message: string;
  context?: any;
}) {
  if (!isWebsiteBuildCommand(message)) {
    return null;
  }

  const projectName = buildProjectName(message);
  const owner = await findOrCreateOwner(userId, sessionId);

  const project = await prisma.project.create({
    data: {
      name: projectName,
      ownerId: owner.id,
    },
  });

  const brief = buildWebsiteBrief(message, projectName);

  return {
    ok: true,
    intent: "website_build",
    plan: [
      "Understand the website request",
      "Create a project workspace",
      "Generate a starter website brief",
      "Prepare next editing and publishing steps",
    ],
    reply:
      `I created a new website project: ${project.name}.\n\n` +
      `Project workspace: /projects/${project.id}\n\n` +
      `Starter direction:\n` +
      `- Industry: ${brief.industry}\n` +
      `- Goal: ${brief.goal}\n` +
      `- Style: ${brief.style}\n\n` +
      `Suggested homepage sections:\n` +
      brief.suggestedSections.map((section) => `- ${section}`).join("\n"),
    actions: [
      {
        type: "project_created",
        projectId: project.id,
        projectName: project.name,
        openUrl: `/projects/${project.id}`,
        buildUrl: `/build/website/${project.id}`,
        brief,
      },
    ],
    nextSuggestions: [
      "Open project",
      "Edit homepage",
      "Add booking section",
      "Upload logo",
      "Publish website",
    ],
  };
}
