import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <section className="grid gap-6 pb-10">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Workspace-level preferences and personal defaults."
      />

      <Card className="grid gap-4 border-border bg-card">
        <div>
          <p className="text-sm font-semibold text-foreground">Theme</p>
          <p className="mt-1 text-sm text-muted-foreground">Switch between light and dark mode for your workspace.</p>
          <div className="mt-3">
            <ThemeToggle
              showLabel
              className="h-9 rounded-md border border-border bg-popover text-foreground hover:bg-accent hover:text-accent-foreground"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Visit the Notifications page to monitor overdue, review, and upcoming items.
          </p>
        </div>
      </Card>
    </section>
  );
}
