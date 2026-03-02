"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Command,
  FolderKanban,
  House,
  KanbanSquare,
  ListTodo,
  LogOut,
  MoreVertical,
  PlusCircle,
  Search,
  Settings,
  Star,
  UserRound,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  section: "main" | "team" | "project" | "actions";
  canFavorite?: boolean;
  activeMatch?: "exact" | "prefix" | "none";
};

type SectionId = NavItem["section"];

type SectionMeta = {
  id: SectionId;
  label: string;
};

type DashboardSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  user?: SidebarUser;
};

type SidebarLinkProps = {
  item: NavItem;
  active: boolean;
  isFavorite: boolean;
  onNavigate?: () => void;
  onToggleFavorite: (itemId: string) => void;
};

const FAVORITES_STORAGE_KEY = "teamflow-sidebar-favorites";

const SECTIONS: SectionMeta[] = [
  { id: "main", label: "Workspace" },
  { id: "team", label: "Current Team" },
  { id: "project", label: "Current Project" },
  { id: "actions", label: "Quick Actions" }
];

function SidebarLink({ item, active, isFavorite, onNavigate, onToggleFavorite }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-lg px-1",
        active ? "bg-sidebar-accent" : ""
      )}
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.92rem] transition-colors",
          active
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
      {item.canFavorite ? (
        <button
          type="button"
          aria-label={`${isFavorite ? "Remove" : "Add"} ${item.label} favourite`}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            isFavorite
              ? "text-amber-500 hover:bg-amber-500/10"
              : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-amber-500"
          )}
          onClick={() => onToggleFavorite(item.id)}
        >
          <Star className={cn("h-3.5 w-3.5", isFavorite ? "fill-current" : "")} />
        </button>
      ) : null}
    </div>
  );
}

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

function SidebarSection({
  id,
  title,
  items,
  open,
  pathname,
  favorites,
  onToggleOpen,
  onToggleFavorite,
  onNavigate
}: {
  id: SectionId;
  title: string;
  items: NavItem[];
  open: boolean;
  pathname: string;
  favorites: string[];
  onToggleOpen: (sectionId: SectionId) => void;
  onToggleFavorite: (itemId: string) => void;
  onNavigate?: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <button
        type="button"
        className="flex w-full items-center justify-between px-2 py-1 text-left text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55"
        onClick={() => onToggleOpen(id)}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open ? (
        <div className="mt-1 grid gap-0.5">
          {items.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              active={isPathActive(pathname, item.href, item.activeMatch)}
              isFavorite={favorites.includes(item.id)}
              onNavigate={onNavigate}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
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
  const segments = pathname.split("/").filter(Boolean);
  const teamId = segments[0] === "teams" && segments[1] && segments[1] !== "new" ? segments[1] : null;
  const projectId = teamId && segments[2] === "projects" && segments[3] && segments[3] !== "new" ? segments[3] : null;
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sectionOpen, setSectionOpen] = useState<Record<SectionId, boolean>>({
    main: true,
    team: true,
    project: true,
    actions: true
  });
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavorites(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
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
  }, []);

  const allItems = useMemo<NavItem[]>(
    () => [
      { id: "main-dashboard", href: "/dashboard", label: "Home", icon: House, section: "main", canFavorite: true },
      { id: "main-teams", href: "/teams", label: "Teams", icon: Users, section: "main", canFavorite: true },
      {
        id: "main-notifications",
        href: "/dashboard/notifications",
        label: "Notifications",
        icon: Bell,
        section: "main"
      },
      ...(teamId
        ? [
            {
              id: "team-overview",
              href: `/teams/${teamId}`,
              label: "Team Overview",
              icon: BriefcaseBusiness,
              section: "team",
              canFavorite: true
            } as NavItem,
            {
              id: "team-projects",
              href: `/teams/${teamId}/projects`,
              label: "Projects",
              icon: FolderKanban,
              section: "team",
              canFavorite: true
            } as NavItem
          ]
        : []),
      ...(teamId && projectId
        ? [
            {
              id: "project-board",
              href: `/teams/${teamId}/projects/${projectId}`,
              label: "Board",
              icon: KanbanSquare,
              section: "project",
              canFavorite: true
            } as NavItem,
            {
              id: "project-tasks",
              href: `/teams/${teamId}/projects/${projectId}/tasks`,
              label: "Task List",
              icon: ListTodo,
              section: "project",
              canFavorite: true
            } as NavItem
          ]
        : []),
      {
        id: "action-new-team",
        href: "/teams/new",
        label: "Create Team",
        icon: PlusCircle,
        section: "actions",
        activeMatch: "none"
      },
      ...(teamId
        ? [
            {
              id: "action-new-project",
              href: `/teams/${teamId}/projects/new`,
              label: "Create Project",
              icon: PlusCircle,
              section: "actions",
              activeMatch: "none"
            } as NavItem
          ]
        : []),
      ...(teamId && projectId
        ? [
            {
              id: "action-new-task",
              href: `/teams/${teamId}/projects/${projectId}?newTask=1`,
              label: "Add Task",
              icon: PlusCircle,
              section: "actions",
              activeMatch: "none"
            } as NavItem
          ]
        : [])
    ],
    [teamId, projectId]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const isMatch = (item: NavItem) => normalizedSearch.length === 0 || item.label.toLowerCase().includes(normalizedSearch);

  const visibleItems = allItems.filter(isMatch);
  const favoriteItems = visibleItems.filter((item) => item.canFavorite && favorites.includes(item.id));

  const sectionItems = (sectionId: SectionId) => visibleItems.filter((item) => item.section === sectionId);

  const toggleFavorite = (itemId: string): void => {
    setFavorites((previous) => {
      const next = previous.includes(itemId) ? previous.filter((id) => id !== itemId) : [...previous, itemId];
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleSection = (sectionId: SectionId): void => {
    setSectionOpen((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  };

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
          <p className="truncate text-xs text-muted-foreground">{teamId ? "Project operations" : "Foundation"}</p>
        </div>
        <button
          type="button"
          aria-label="Toggle workspace navigation"
          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => {
            setSectionOpen((current) => ({
              ...current,
              main: true,
              team: teamId ? current.team : false,
              project: projectId ? current.project : false
            }));
          }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/45" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search navigation..."
            className="h-9 rounded-lg border-sidebar-border bg-sidebar-accent pl-9 pr-12 text-sm text-sidebar-foreground shadow-none placeholder:text-sidebar-foreground/45 focus:border-sidebar-ring focus:ring-sidebar-ring"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded bg-sidebar px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sidebar-foreground/55">
            <Command className="h-3 w-3" />K
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid gap-3">
          {favoriteItems.length > 0 ? (
            <section>
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">Favourites</p>
              <div className="mt-1 grid gap-0.5">
                {favoriteItems.map((item) => (
                  <SidebarLink
                    key={`fav-${item.id}`}
                    item={item}
                    active={isPathActive(pathname, item.href, item.activeMatch)}
                    isFavorite={favorites.includes(item.id)}
                    onNavigate={onNavigate}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {SECTIONS.map((section) => (
            <SidebarSection
              key={section.id}
              id={section.id}
              title={section.label}
              items={sectionItems(section.id)}
              open={sectionOpen[section.id]}
              pathname={pathname}
              favorites={favorites}
              onToggleOpen={toggleSection}
              onToggleFavorite={toggleFavorite}
              onNavigate={onNavigate}
            />
          ))}

          {visibleItems.length === 0 ? (
            <p className="px-2 py-4 text-sm text-sidebar-foreground/60">No navigation items match your search.</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-sidebar-border px-3 py-2">
        <div className="flex items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent px-2.5 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">Appearance</span>
          <ThemeToggle
            showLabel
            className="h-8 rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar hover:text-sidebar-foreground"
          />
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
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
