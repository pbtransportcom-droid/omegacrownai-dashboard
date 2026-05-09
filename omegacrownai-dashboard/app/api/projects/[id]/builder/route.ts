import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const prompt = String(body.prompt || "");

    if (!prompt.trim()) {
      return Response.json({ ok: false, error: "Prompt is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!project || project.owner.email !== session.user.email) {
      return Response.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const buildPrompt = `
You are OmegaCrownAI Premium Website Builder.

The user wants:
"${prompt}"

Create a premium, modern, conversion-focused website concept.

Important design requirements:
- Make it visually beautiful, not plain.
- Use a strong hero section.
- Include real sections, real copywriting, and realistic business features.
- Include cards, badges, menu/product items, testimonials, and a call to action.
- Use a tasteful color palette.
- Use luxury SaaS / premium startup design quality.
- Return ONLY valid JSON. No markdown. No commentary.

Return this exact JSON shape:

{
  "type": "website_build",
  "title": "Premium website title",
  "business": "Business name",
  "style": "premium, modern, warm, luxury, playful, etc.",
  "tagline": "short tagline",
  "pages": ["Home", "Menu", "About", "Contact"],
  "theme": {
    "background": "#0f0a05",
    "surface": "#1b1208",
    "primary": "#fff7ed",
    "secondary": "#facc15",
    "accent": "#f97316",
    "muted": "#d6b98c"
  },
  "navigation": ["Home", "Menu", "Story", "Reviews", "Contact"],
  "hero": {
    "eyebrow": "small label",
    "headline": "powerful headline",
    "subheadline": "supporting text",
    "primaryCta": "Order Now",
    "secondaryCta": "View Menu"
  },
  "trustBadges": ["Fresh Daily", "Local Ingredients", "Custom Orders"],
  "features": [
    {
      "title": "Feature title",
      "description": "Feature description"
    }
  ],
  "products": [
    {
      "name": "Product name",
      "description": "Product description",
      "price": "$12",
      "badge": "Best Seller"
    }
  ],
  "sections": [
    {
      "name": "Section name",
      "headline": "headline text",
      "body": "body text",
      "cta": "button text"
    }
  ],
  "testimonials": [
    {
      "quote": "customer quote",
      "name": "Customer name"
    }
  ],
  "footer": {
    "headline": "footer headline",
    "cta": "footer CTA",
    "links": ["Instagram", "Contact", "Order"]
  },
  "code": {
    "app/page.tsx": "A complete single-file React/Next.js page component using Tailwind CSS classes. It must look premium with gradient background, cards, rounded corners, shadows, navigation, hero, product cards, feature cards, testimonials, CTA, and footer."
  }
}
`;

    const aiRes = await fetch("http://127.0.0.1:4000/api/ai/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: buildPrompt }),
    });

    const ai = await aiRes.json();
    const raw = String(ai.reply || ai.error || "");
    const parsed = extractJson(raw);

    const result = parsed || {
      type: "website_build",
      title: "Premium Generated Website",
      business: project.name,
      style: "premium modern",
      tagline: "Built by OmegaCrownAI",
      pages: ["Home", "Menu", "About", "Contact"],
      theme: {
        background: "#0f0a05",
        surface: "#1b1208",
        primary: "#fff7ed",
        secondary: "#facc15",
        accent: "#f97316",
        muted: "#d6b98c",
      },
      navigation: ["Home", "Menu", "Story", "Reviews", "Contact"],
      hero: {
        eyebrow: "Freshly crafted",
        headline: prompt,
        subheadline: raw.slice(0, 240),
        primaryCta: "Get Started",
        secondaryCta: "Learn More",
      },
      trustBadges: ["Premium Design", "AI Generated", "Project Saved"],
      features: [
        {
          title: "Beautiful Structure",
          description: "A polished landing page structure generated from your prompt.",
        },
        {
          title: "Conversion Focused",
          description: "Designed with clear sections and call-to-action areas.",
        },
      ],
      products: [],
      sections: [
        {
          name: "Hero",
          headline: prompt,
          body: raw,
          cta: "Get Started",
        },
      ],
      testimonials: [],
      footer: {
        headline: "Ready to launch?",
        cta: "Build More",
        links: ["Home", "Contact"],
      },
      code: {
        "app/page.tsx": raw,
      },
    };

    const saved = await prisma.agentExecution.create({
      data: {
        projectId: project.id,
        prompt,
        intents: ["builder"],
        agents: [
          {
            agent: "Premium Website Builder Agent",
            intent: "builder",
          },
        ],
        execution: result,
        reply: raw,
      },
    });

    return Response.json({
      ok: true,
      project: {
        id: project.id,
        name: project.name,
      },
      result,
      saved,
    });
  } catch (error: any) {
    return Response.json(
      {
        ok: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const buildId = String(body.buildId || "");
    const kind = String(body.kind || "website_draft_v1");
    const draft = body.draft;

    if (!buildId) {
      return Response.json({ ok: false, error: "buildId is required" }, { status: 400 });
    }

    if (!draft || typeof draft !== "object") {
      return Response.json({ ok: false, error: "Valid draft is required" }, { status: 400 });
    }

    const artifact = await prisma.projectBuildArtifact.findFirst({
      where: {
        projectId: id,
        buildId,
        kind,
      },
    });

    if (!artifact) {
      await prisma.projectBuildArtifact.create({
        data: {
          projectId: id,
          buildId,
          kind,
          payload: draft,
        },
      });
    } else {
      await prisma.projectBuildArtifact.update({
        where: {
          id: artifact.id,
        },
        data: {
          payload: draft,
        },
      });
    }

    await prisma.projectBuild.updateMany({
      where: {
        id: buildId,
        projectId: id,
      },
      data: {
        status: "draft",
      },
    });

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json(
      {
        ok: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
