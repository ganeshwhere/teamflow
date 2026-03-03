"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

type DashboardFrameProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

export function DashboardFrame({ children, user }: DashboardFrameProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mobileIconButtonClass =
    "h-12 w-12 shrink-0 rounded-2xl border border-border bg-popover p-0 text-foreground shadow-sm hover:bg-accent";

  return (
    <div className="h-screen overflow-hidden bg-background dark:bg-sidebar">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--secondary),transparent_35%),radial-gradient(circle_at_bottom_right,var(--accent),transparent_40%)] opacity-30 dark:opacity-0" />

      <DashboardSidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} user={user} />

      <div className="relative h-full overflow-y-auto md:ml-[296px]">
        <main className="min-h-full px-4 py-4 pb-8 md:px-8 md:py-8">
          <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className={mobileIconButtonClass}
                aria-label="Open sidebar menu"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-foreground" strokeWidth={2.4} />
              </Button>
              <p className="text-sm font-semibold text-foreground">Team Flow</p>
              <ThemeToggle className={mobileIconButtonClass} iconClassName="h-6 w-6 text-foreground" />
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
