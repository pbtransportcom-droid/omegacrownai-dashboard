import { prisma } from "@/lib/db";
import { setDepartmentKPI, writeDepartmentMemory } from "@/lib/sugent/company/departments";

function asArray(value: any, fallback: string[]) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return fallback;
}

export function buildMarketingBrief({
  companyName,
  objective,
  offer,
  audience,
  channels,
}: {
  companyName: string;
  objective: string;
  offer?: string | null;
  audience?: any;
  channels?: any;
}) {
  const channelList = asArray(channels, ["website", "email", "social"]);
  const audienceName = audience?.name || audience?.segment || "business owners and operators";
  const campaignOffer = offer || "OmegaCrown AI autonomous company operating system";

  return {
    headline: `${companyName} Growth Campaign`,
    objective,
    audience: audienceName,
    offer: campaignOffer,
    positioning:
      "A premium AI company operating system that combines agents, secure execution, browser automation, cloud jobs, departments, memory, and workforce loops.",
    channels: channelList,
    coreMessage:
      `${companyName} helps teams turn AI from a chat tool into a working company OS with departments, workers, task loops, and measurable KPIs.`,
    callToAction: "Start building your autonomous company system today.",
  };
}

export function generateMarketingAssets(brief: any) {
  return [
    {
      type: "landing_page",
      channel: "website",
      title: `${brief.headline} Landing Page Copy`,
      content: `Hero headline: Build your autonomous company OS.\n\nSubheadline: ${brief.coreMessage}\n\nOffer: ${brief.offer}\n\nCTA: ${brief.callToAction}`,
    },
    {
      type: "email",
      channel: "email",
      title: `${brief.headline} Email Campaign`,
      content: `Subject: Your AI should run workflows, not just answer questions\n\nHi,\n\n${brief.coreMessage}\n\nWith OmegaCrown AI, your business can create departments, assign workers, run tasks, and track KPIs automatically.\n\n${brief.callToAction}`,
    },
    {
      type: "social_post",
      channel: "social",
      title: `${brief.headline} Social Post`,
      content: `AI is evolving from chat into operations.\n\nOmegaCrown AI brings agents, departments, memory, secure execution, cloud jobs, and workforce loops into one Company OS.\n\n${brief.callToAction}`,
    },
    {
      type: "ad_copy",
      channel: "ads",
      title: `${brief.headline} Ad Copy`,
      content: `Stop using AI as only a chatbot. Build a working AI company OS with OmegaCrown AI. Departments. Workers. KPIs. Automation. Start now.`,
    },
  ];
}

export async function createMarketingCampaign({
  companyId,
  departmentId,
  name,
  objective,
  offer,
  audience = {},
  channels = ["website", "email", "social", "ads"],
  createAssets = true,
}: {
  companyId: string;
  departmentId?: string | null;
  name: string;
  objective: string;
  offer?: string | null;
  audience?: any;
  channels?: any;
  createAssets?: boolean;
}) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  const brief = buildMarketingBrief({
    companyName: company?.name || "OmegaCrown AI",
    objective,
    offer,
    audience,
    channels,
  });

  const campaign = await prisma.marketingCampaign.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      name,
      objective,
      offer: offer || null,
      audience,
      channels,
      status: createAssets ? "ready" : "draft",
      brief,
      metrics: {
        assetsCreated: createAssets ? 4 : 0,
        generatedAt: new Date().toISOString(),
      },
    },
  });

  let assets: any[] = [];

  if (createAssets) {
    const generated = generateMarketingAssets(brief);

    assets = await Promise.all(
      generated.map((asset) =>
        prisma.marketingAsset.create({
          data: {
            campaignId: campaign.id,
            type: asset.type,
            channel: asset.channel,
            title: asset.title,
            content: asset.content,
            status: "draft",
          },
        })
      )
    );
  }

  if (departmentId) {
    await setDepartmentKPI({
      departmentId,
      metric: "marketing_campaigns",
      value: 1,
      period: "week",
      note: `Campaign created: ${name}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "marketing_assets",
      value: assets.length,
      period: "week",
      note: `Assets generated for campaign: ${name}`,
    });

    await writeDepartmentMemory({
      departmentId,
      kind: "campaign",
      content: `Marketing campaign created: ${name}. Objective: ${objective}`,
      tags: {
        source: "marketing_engine",
        campaignId: campaign.id,
      },
    });
  }

  return {
    ok: true,
    campaign,
    assets,
    brief,
  };
}

export async function getMarketingDashboard(companyId: string) {
  const [campaigns, audiences] = await Promise.all([
    prisma.marketingCampaign.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        assets: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.marketingAudience.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    companyId,
    campaigns,
    audiences,
    summary: {
      campaigns: campaigns.length,
      assets: campaigns.reduce((sum, campaign) => sum + campaign.assets.length, 0),
      audiences: audiences.length,
      ready: campaigns.filter((campaign) => campaign.status === "ready").length,
      draft: campaigns.filter((campaign) => campaign.status === "draft").length,
    },
  };
}
