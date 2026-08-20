export type OmegaProductStatus =
  | "live"
  | "beta"
  | "internal"
  | "needs-connection"
  | "legacy";

export type OmegaProductArea =
  | "build"
  | "agents"
  | "automation"
  | "creative"
  | "trading"
  | "business-os"
  | "marketplace"
  | "runtime"
  | "solutions"
  | "executive"
  | "company-os"
  | "security"
  | "public";

export type OmegaProduct = {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  area: OmegaProductArea;
  href: string;
  status: OmegaProductStatus;
  visible: boolean;
  featured?: boolean;
  aliases?: string[];
  capabilities: string[];
  relatedRoutes?: string[];
};
