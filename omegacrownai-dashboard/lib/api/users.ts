import { apiFetch } from "./http";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/users/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
