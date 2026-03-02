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

  return (
    <div className="h-screen overflow-hidden bg-background dark:bg-sidebar">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--secondary),transparent_35%),radial-gradient(circle_at_bottom_right,var(--accent),transparent_40%)] opacity-30 dark:opacity-0" />

      <DashboardSidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} user={user} />

      <div className="relative h-full overflow-y-auto md:ml-[296px]">
        <main className="min-h-full px-4 py-4 pb-8 md:px-8 md:py-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <Button
              variant="ghost"
              className="h-9 w-9 p-0"
              aria-label="Open sidebar menu"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
