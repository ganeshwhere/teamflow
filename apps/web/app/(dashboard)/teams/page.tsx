import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, FolderKanban, Users } from "lucide-react";
import type { TeamListItem } from "@repo/types";

import { getMyTeams } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { Card } from "@/components/ui/card";

async function TeamsList() {
  const result = await getMyTeams();
  const teams: TeamListItem[] = result.data ?? [];

  return (
    <div className="grid gap-3">
      {teams.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">No teams yet. Create your first team.</p>
        </Card>
      ) : (
        teams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className="group transition hover:-translate-y-0.5 hover:border-primary">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{team.name}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{team.description ?? "No description"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <Users className="h-3.5 w-3.5" />
                  {team.memberCount} members
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <FolderKanban className="h-3.5 w-3.5" />
                  {team.projectCount} projects
                </span>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
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
          <TeamsList />
        </Suspense>
      </section>
    </main>
  );
}
