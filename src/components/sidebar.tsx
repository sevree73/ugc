"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderKanban,
  MessageSquare,
  Wallet,
  Settings,
  Sparkles,
  Search,
  ClipboardList,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavRole = "COMPANY" | "CREATOR" | "ADMIN";

type NavItem = { href: string; label: string; icon: React.ElementType; exact?: boolean };

const NAV_ITEMS: Record<NavRole, NavItem[]> = {
  COMPANY: [
    { href: "/company", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/company/briefs", label: "Briefs", icon: FileText },
    { href: "/company/marketplace", label: "Créateurs", icon: Search },
    { href: "/company/projects", label: "Projets", icon: FolderKanban },
    { href: "/company/messages", label: "Messages", icon: MessageSquare },
    { href: "/company/payments", label: "Paiements", icon: Wallet },
    { href: "/company/settings", label: "Paramètres", icon: Settings },
  ],
  CREATOR: [
    { href: "/creator", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/creator/briefs", label: "Briefs disponibles", icon: ClipboardList },
    { href: "/creator/applications", label: "Mes candidatures", icon: Users },
    { href: "/creator/projects", label: "Mes projets", icon: FolderKanban },
    { href: "/creator/messages", label: "Messages", icon: MessageSquare },
    { href: "/creator/profile", label: "Mon portfolio", icon: ImageIcon },
    { href: "/creator/settings", label: "Paramètres", icon: Settings },
  ],
  ADMIN: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
};

export function Sidebar({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const home = items[0].href;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-slate-50 lg:flex">
      <Link href={home} className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-400 text-white">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <span className="font-heading text-base font-bold text-slate-700">UGCLink</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-pink-200 text-slate-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              )}
            >
              <Icon className={cn("h-4.5 w-4.5", active && "text-pink-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileSidebarNav({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              active ? "bg-pink-200 text-slate-700" : "text-slate-600",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
