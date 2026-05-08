import { apiFetch } from "./http";

export type ProjectType =
  | "website"
  | "app"
  | "video"
  | "trading"
  | "workflow";

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  updated_at: string;
}

export async function listProjects(token?: string) {
  return apiFetch<Project[]>("/api/projects/list", {
    method: "GET",
    token,
  });
}
