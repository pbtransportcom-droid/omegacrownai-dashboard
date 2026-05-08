import Link from 'next/link';
import type { Route } from 'next';

type Section =
  | 'chat'
  | 'build'
  | 'trade'
  | 'create'
  | 'automate'
  | 'projects';

type NavItem = {
  label: string;
  href: Route;
};

type SidebarConfig = {
  title: string;
  items: NavItem[];
};

const sidebarMap: Record<Section, SidebarConfig> = {
  chat: {
    title: 'Context',
    items: [
      { label: 'Chat', href: '/chat' },
      { label: 'Projects', href: '/projects' }
    ]
  },
  build: {
    title: 'Builder',
    items: [
      { label: 'Overview', href: '/build' },
      { label: 'Projects', href: '/projects' }
    ]
  },
  trade: {
    title: 'Watchlist',
    items: [
      { label: 'Trade', href: '/trade' },
      { label: 'Projects', href: '/projects' }
    ]
  },
  create: {
    title: 'Video',
    items: [
      { label: 'Create', href: '/create' },
      { label: 'Projects', href: '/projects' }
    ]
  },
  automate: {
    title: 'Automation',
    items: [
      { label: 'Automate', href: '/automate' },
      { label: 'Projects', href: '/projects' }
    ]
  },
  projects: {
    title: 'Projects',
    items: [
      { label: 'All Projects', href: '/projects' },
      { label: 'Chat', href: '/chat' }
    ]
  }
};

export function ContextSidebar({ section }: { section: Section }) {
  const config = sidebarMap[section];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-panel/60 xl:block">
      <div className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          {config.title}
        </h2>

        <div className="mt-4 space-y-2">
          {config.items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-xl border border-border bg-white/3 px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
