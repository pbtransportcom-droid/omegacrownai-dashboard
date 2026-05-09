export type SugentRole = "owner" | "admin" | "editor" | "viewer";

export type PermissionDomain =
  | "project"
  | "builder"
  | "cloud"
  | "marketplace"
  | "agents"
  | "memory"
  | "runtime";

export const PermissionMatrix: Record<SugentRole, Record<PermissionDomain, string[]>> = {
  owner: {
    project: ["view", "create", "edit", "delete", "publish", "manage_roles"],
    builder: ["view", "edit", "publish"],
    cloud: ["view", "run", "deploy"],
    marketplace: ["view", "install", "publish"],
    agents: ["view", "control", "override", "kill", "restart"],
    memory: ["view", "write", "delete"],
    runtime: ["view", "control"],
  },

  admin: {
    project: ["view", "edit", "publish", "manage_roles"],
    builder: ["view", "edit", "publish"],
    cloud: ["view", "run"],
    marketplace: ["view", "install"],
    agents: ["view", "control"],
    memory: ["view", "write"],
    runtime: ["view", "control"],
  },

  editor: {
    project: ["view", "edit"],
    builder: ["view", "edit"],
    cloud: ["view"],
    marketplace: ["view"],
    agents: ["view"],
    memory: ["view", "write"],
    runtime: ["view"],
  },

  viewer: {
    project: ["view"],
    builder: ["view"],
    cloud: ["view"],
    marketplace: ["view"],
    agents: ["view"],
    memory: ["view"],
    runtime: ["view"],
  },
};

export function roleAllows(role: string, domain: PermissionDomain, action: string) {
  const allowed = PermissionMatrix[role as SugentRole]?.[domain] || [];
  return allowed.includes(action);
}
