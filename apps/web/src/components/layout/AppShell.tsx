"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bot, CheckSquare, HeartPulse, Workflow } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/health", label: "Health", icon: HeartPulse }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3">
          <Link href="/assistant" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
              <Workflow className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4 text-ink">FollowBrief</span>
              <span className="block text-xs text-slate-500">AI follow-up assistant</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 rounded-md border border-line bg-white p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded px-3 py-2 text-sm transition",
                    active
                      ? "bg-ink text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-5">{children}</main>
    </div>
  );
}
