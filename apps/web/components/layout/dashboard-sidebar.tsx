"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  House,
  LogOut,
  MoreVertical,
  Settings,
  UserRound,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarUser = {
  name?: string | null;
  email?: string | null;
};

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  activeMatch?: "exact" | "prefix" | "none";
};

type DashboardSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  user?: SidebarUser;
};

type SidebarLinkProps = {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
};

const NAV_ITEMS: NavItem[] = [
  { id: "main-dashboard", href: "/dashboard", label: "Home", icon: House },
  { id: "main-teams", href: "/teams", label: "Teams", icon: Users, activeMatch: "prefix" },
  {
    id: "main-notifications",
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell
  }
];

const SidebarLink = memo(function SidebarLink({ item, active, onNavigate }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <div className="group flex items-center gap-1 rounded-lg px-1">
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.92rem] transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    </div>
  );
});

SidebarLink.displayName = "SidebarLink";

function isPathActive(pathname: string, href: string, mode: NavItem["activeMatch"] = "exact"): boolean {
  if (mode === "none") {
    return false;
  }

  if (mode === "prefix") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href;
}

function getUserInitials(user?: SidebarUser): string {
  const source = user?.name?.trim() || user?.email?.trim();
  if (!source) {
    return "TF";
  }

  const segments = source.split(/\s+/).filter(Boolean);
  if (segments.length > 1) {
    return `${segments[0]?.[0] ?? ""}${segments[1]?.[0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function SidebarContent({
  pathname,
  onNavigate,
  user
}: {
  pathname: string;
  onNavigate?: () => void;
  user?: SidebarUser;
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [accountMenuOpen]);

  const userName = user?.name ?? "Team Flow User";
  const userEmail = user?.email ?? "workspace@teamflow.app";

  return (
    <>
      <div className="flex items-start gap-3 px-3 pb-3 pt-3">
        <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-foreground shadow-sm">
          TF
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-sidebar-foreground">Team Flow</p>
          <p className="truncate text-xs text-muted-foreground">Workspace</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <nav className="grid gap-1 pt-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              active={isPathActive(pathname, item.href, item.activeMatch)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>

      <div className="px-3 pb-3">
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent px-2.5 py-2 text-left transition-colors hover:bg-sidebar"
            onClick={() => setAccountMenuOpen((current) => !current)}
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {getUserInitials(user)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{userName}</p>
              <p className="truncate text-xs text-sidebar-foreground/65">{userEmail}</p>
            </div>
            <span className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70">
              <MoreVertical className="h-4 w-4" />
            </span>
          </button>

          {accountMenuOpen ? (
            <div className="absolute bottom-[calc(100%+0.45rem)] right-0 z-10 w-52 rounded-lg border border-sidebar-border bg-sidebar p-1 shadow-lg">
              <Link
                href="/dashboard/account"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={onNavigate}
              >
                <UserRound className="h-4 w-4" />
                Account
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={onNavigate}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                onClick={async () => {
                  setAccountMenuOpen(false);
                  onNavigate?.();
                  await signOut({ callbackUrl: "/login" });
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function DashboardSidebar({ mobileOpen, onMobileClose, user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[296px] overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg md:flex md:flex-col">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close sidebar"
          className={cn(
            "absolute inset-0 bg-black/45 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onMobileClose}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[90%] max-w-sm border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-end border-b border-sidebar-border px-3 py-2">
            <Button variant="ghost" className="h-8 w-8 p-0 text-sidebar-foreground/70 hover:bg-sidebar-accent" onClick={onMobileClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[calc(100%-49px)] overflow-hidden">
            <SidebarContent pathname={pathname} onNavigate={onMobileClose} user={user} />
          </div>
        </aside>
      </div>
    </>
  );
}
