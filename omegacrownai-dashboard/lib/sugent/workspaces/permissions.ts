export type WorkspaceRole = "owner" | "admin" | "editor" | "reviewer" | "viewer";

export type Permission =
  | "manage_workspace"
  | "edit_project"
  | "view_project"
  | "review_project"
  | "approve_version"
  | "trigger_render"
  | "trigger_publish"
  | "run_agents";

const rolePermissions: Record<WorkspaceRole, Permission[]> = {
  owner: [
    "manage_workspace",
    "edit_project",
    "view_project",
    "review_project",
    "approve_version",
    "trigger_render",
    "trigger_publish",
    "run_agents",
  ],
  admin: [
    "manage_workspace",
    "edit_project",
    "view_project",
    "review_project",
    "approve_version",
    "trigger_render",
    "trigger_publish",
    "run_agents",
  ],
  editor: [
    "edit_project",
    "view_project",
    "trigger_render",
    "run_agents",
  ],
  reviewer: [
    "view_project",
    "review_project",
    "approve_version",
  ],
  viewer: [
    "view_project",
  ],
};

export function normalizeRole(role: string | null | undefined): WorkspaceRole {
  const value = String(role || "viewer").toLowerCase();

  if (["owner", "admin", "editor", "reviewer", "viewer"].includes(value)) {
    return value as WorkspaceRole;
  }

  return "viewer";
}

export function roleHasPermission(role: string, permission: Permission) {
  return rolePermissions[normalizeRole(role)].includes(permission);
}

export function getRolePermissions(role: string) {
  return rolePermissions[normalizeRole(role)];
}
