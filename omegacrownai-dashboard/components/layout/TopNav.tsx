import Link from 'next/link';
import type { Route } from 'next';
import {
  Bot,
  Briefcase,
  Clapperboard,
  Gauge,
  LayoutDashboard,
  Workflow
} from 'lucide-react';

type NavItem = {
  label: string;
  href: Route;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { label: 'Build', href: '/build', icon: LayoutDashboard },
  { label: 'Trade', href: '/trade', icon: Gauge },
  { label: 'Create', href: '/create', icon: Clapperboard },
  { label: 'Automate', href: '/automate', icon: Workflow },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Chat', href: '/chat', icon: Bot }
];

export function TopNav({ pathname = '/' }: { pathname?: string }) {
  return (
    <nav className="hidden items-center gap-2 lg:flex">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href as any}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
              active
                ? 'bg-white/8 text-text'
                : 'text-muted hover:bg-white/5 hover:text-text'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
