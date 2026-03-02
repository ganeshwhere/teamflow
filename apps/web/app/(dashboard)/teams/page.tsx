import { Suspense } from "react";
import { FolderKanban, LayoutGrid, Users } from "lucide-react";
import type { TeamListItem } from "@repo/types";

import { getMyTeams } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { TeamsBrowser } from "@/components/teams/teams-browser";
import { Card } from "@/components/ui/card";

async function TeamsContent() {
  const result = await getMyTeams();
  const teams: TeamListItem[] = result.data ?? [];
  const totalMembers = teams.reduce((accumulator, team) => accumulator + team.memberCount, 0);
  const totalProjects = teams.reduce((accumulator, team) => accumulator + team.projectCount, 0);

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Teams</p>
          <p className="text-2xl font-semibold text-foreground">{teams.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <LayoutGrid className="h-3.5 w-3.5" />
            Active workspaces
          </p>
        </Card>

        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Members</p>
          <p className="text-2xl font-semibold text-foreground">{totalMembers}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Across all teams
          </p>
        </Card>

        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Projects</p>
          <p className="text-2xl font-semibold text-foreground">{totalProjects}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            Across all teams
          </p>
        </Card>
      </div>

      <TeamsBrowser teams={teams} />
    </section>
  );
}

export default function TeamsPage() {
  return (
    <main className="grid gap-6">
      <section className="grid gap-4">
        <PageHeader
          eyebrow="Workspace"
          title="Teams"
          description="Manage cross-functional groups, ownership, and project structure."
          actions={<CreateTeamDialog />}
        />
        <Suspense fallback={<SectionSkeleton />}>
          <TeamsContent />
        </Suspense>
      </section>
    </main>
  );
}
