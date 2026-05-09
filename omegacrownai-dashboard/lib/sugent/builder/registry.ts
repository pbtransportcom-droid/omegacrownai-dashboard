export type SugentBuilderId = "website" | "trading" | "automation";

export type SugentBuilderRegistryItem = {
  id: SugentBuilderId;
  label: string;
  shortLabel: string;
  description: string;
  domain: string;
  draftKind: string;
  accent: string;
  examplePrompt: string;
  builderPath: (projectId: string, buildId?: string) => string;
};

export const BuilderRegistry: Record<SugentBuilderId, SugentBuilderRegistryItem> = {
  website: {
    id: "website",
    label: "Website Builder",
    shortLabel: "Website",
    description: "Create landing pages, business websites, and polished public pages.",
    domain: "website",
    draftKind: "website_draft_v1",
    accent: "cyan",
    examplePrompt: "Build me a luxury limo website for airport transportation",
    builderPath: (projectId: string, buildId?: string) =>
      `/build/website/${projectId}${buildId ? `?buildId=${buildId}` : ""}`,
  },

  trading: {
    id: "trading",
    label: "Trading Strategy Builder",
    shortLabel: "Trading",
    description: "Create saved King Trading System strategies, signals, and watch plans.",
    domain: "trading",
    draftKind: "strategy_draft_v1",
    accent: "emerald",
    examplePrompt: "Create trading strategy for LINK 40 days",
    builderPath: (projectId: string, buildId?: string) =>
      `/build/trading/${projectId}${buildId ? `?buildId=${buildId}` : ""}`,
  },

  automation: {
    id: "automation",
    label: "Automation Builder",
    shortLabel: "Automation",
    description: "Create workflows, follow-ups, triggers, email steps, and business automations.",
    domain: "automation",
    draftKind: "automation_flow_v1",
    accent: "violet",
    examplePrompt:
      "Create automation for booking follow up email after a customer requests a limo ride",
    builderPath: (projectId: string, buildId?: string) =>
      `/build/automation/${projectId}${buildId ? `?buildId=${buildId}` : ""}`,
  },
};

export const BUILDER_LIST = Object.values(BuilderRegistry);

export function getBuilderByDomain(domain?: string | null) {
  return BUILDER_LIST.find((builder) => builder.domain === domain) || null;
}

export function getBuilderByDraftKind(kind?: string | null) {
  return BUILDER_LIST.find((builder) => builder.draftKind === kind) || null;
}

export function getBuilderPath(domain: string, projectId: string, buildId?: string) {
  const builder = getBuilderByDomain(domain);
  if (!builder) return `/projects/${projectId}`;
  return builder.builderPath(projectId, buildId);
}
