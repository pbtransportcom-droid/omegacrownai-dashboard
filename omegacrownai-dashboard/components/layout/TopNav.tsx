"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Briefcase,
  Clapperboard,
  Gauge,
  Home,
  LayoutDashboard,
  Workflow,
} from "lucide-react";

type NavItem = {
  label: string;
  href: Route;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Build", href: "/build", icon: LayoutDashboard },
  { label: "Trade", href: "/trade", icon: Gauge },
  { label: "Create", href: "/create", icon: Clapperboard },
  { label: "Automate", href: "/automate", icon: Workflow },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Chat", href: "/chat", icon: Bot },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  function goBack() {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1
    ) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-2 lg:flex"
    >
      <button
        type="button"
        onClick={goBack}
        aria-label="Go back"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-muted transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div
        aria-hidden="true"
        className="mx-1 h-6 w-px bg-white/10"
      />

      {navItems.map(({ label, href, icon: Icon }) => {
        const active = isRouteActive(pathname, href);

        return (
          <Link
            key={href}
            href={href as any}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              active
                ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                : "border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-text"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>

            {active ? (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
