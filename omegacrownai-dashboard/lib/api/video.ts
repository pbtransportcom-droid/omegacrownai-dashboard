import { apiFetch } from "./http";

export interface GenerateVideoRequest {
  prompt: string;
  duration: number;
  style: string;
  resolution: string;
}

export interface VideoJob {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  video_url?: string;
}

export async function generateVideo(
  payload: GenerateVideoRequest,
  token?: string
) {
  return apiFetch<VideoJob>("/api/ai/video/generate", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
