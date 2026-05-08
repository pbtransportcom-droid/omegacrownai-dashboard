import { apiFetch } from '@/lib/api/http';

export async function createWebsite(
  description: string,
  framework = 'nextjs-tailwind',
  token?: string
) {
  return apiFetch<{ files: { name: string; content: string }[]; preview_url?: string }>(
    '/api/ai/website/build',
    {
      method: 'POST',
      token,
      body: JSON.stringify({ description, framework }),
    }
  );
}

export async function createAppSpec(
  description: string,
  stack = 'nextjs-node',
  token?: string
) {
  return apiFetch<{ spec: string }>(
    '/api/ai/app/spec',
    {
      method: 'POST',
      token,
      body: JSON.stringify({ description, stack }),
    }
  );
}

export async function generateAppFromSpec(
  spec: string,
  token?: string
) {
  return apiFetch<{ files: { name: string; content: string }[]; preview_url?: string }>(
    '/api/ai/app/generate',
    {
      method: 'POST',
      token,
      body: JSON.stringify({ spec }),
    }
  );
}
