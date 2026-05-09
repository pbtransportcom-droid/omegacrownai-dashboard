import { prisma } from "@/lib/db";
import { buildWebsiteDraft } from "./websiteDraft";
import { logSugentEvent } from "@/lib/sugent/events/logEvent";

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
  const draft = buildWebsiteDraft({
    message,
    projectName,
    brief,
  });

  const build = await prisma.projectBuild.create({
    data: {
      projectId: project.id,
      label: "Initial website draft",
      status: "draft",
      source: "brain_auto",
      domain: "website",
    },
  });

  const artifact = await prisma.projectBuildArtifact.create({
    data: {
      projectId: project.id,
      buildId: build.id,
      kind: "website_draft_v1",
      payload: draft,
    },
  });

  const execution = await prisma.agentExecution.create({
    data: {
      projectId: project.id,
      prompt: message,
      intents: {
        primary: "website_build",
        confidence: 0.95,
      },
      agents: {
        creator: "Omega Crown Super Agent",
        builder: "Sugent Website Builder",
      },
      execution: {
        type: "website_build",
        projectId: project.id,
        buildId: build.id,
        artifactId: artifact.id,
        brief,
        draftVersion: "website_draft_v1",
      },
      reply: `Created project and generated first website draft for ${projectName}.`,
    },
  });

  await logSugentEvent({
    projectId: project.id,
    buildId: build.id,
    artifactId: artifact.id,
    executionId: execution.id,
    type: "website_build_created",
    domain: "website",
    actor: userId,
    message: `Created website draft: ${project.name}`,
    payload: {
      projectName: project.name,
      buildLabel: build.label,
      artifactKind: "website_draft_v1",
      brief,
    },
  });

  return {
    ok: true,
    intent: "website_build",
    plan: [
      "Understand the website request",
      "Create a project workspace",
      "Generate a starter website brief",
      "Create ProjectBuild",
      "Create ProjectBuildArtifact website_draft_v1",
      "Log AgentExecution",
      "Prepare builder workspace",
    ],
    reply:
      `I created your project and generated the first website draft: ${project.name}.\n\n` +
      `Project workspace: /projects/${project.id}\n` +
      `Website builder: /build/website/${project.id}?buildId=${build.id}\n\n` +
      `Starter direction:\n` +
      `- Industry: ${brief.industry}\n` +
      `- Goal: ${brief.goal}\n` +
      `- Style: ${brief.style}\n\n` +
      `First draft sections:\n` +
      draft.pages[0].sections.map((section) => `- ${section.type}: ${section.content?.heading || section.content?.headline || section.id}`).join("\n"),
    actions: [
      {
        type: "project_created",
        projectId: project.id,
        projectName: project.name,
        openUrl: `/projects/${project.id}`,
        buildUrl: `/build/website/${project.id}?buildId=${build.id}`,
        buildId: build.id,
        artifactId: artifact.id,
        executionId: execution.id,
        previewReady: true,
        brief,
        draft,
      },
    ],
    nextSuggestions: [
      "Open project",
      "Open website builder",
      "Edit homepage",
      "Add booking section",
      "Upload logo",
      "Publish website",
    ],
  };
}
