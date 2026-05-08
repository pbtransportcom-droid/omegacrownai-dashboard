# OmegaCrownAI Dashboard Scaffold

Production-oriented Next.js App Router scaffold for the OmegaCrownAI dashboard.

## Included
- Global app shell with top nav and contextual sidebars
- Routes for login, signup, forgot password, chat, trade, create, build, automate, and projects
- Dedicated workspaces for website and app projects
- Typed API clients aligned to your backend contracts
- Dark futuristic styling with Tailwind CSS
- Mock fallbacks so screens stay useful before backend integration is complete

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Expected API base
Set:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.omegacrownai.com
```

The `next.config.mjs` rewrite proxies `/api/*` to your gateway.

## Build order after scaffold
1. Wire auth endpoints
2. Replace mock fallbacks with real API responses
3. Add charts on `/trade`
4. Add file persistence for build workspaces
5. Add polling and job history for `/create`
6. Add toast notifications and loading skeletons
