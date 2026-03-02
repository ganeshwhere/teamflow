import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, FolderKanban, Users } from "lucide-react";
import type { ProjectItem, TeamDetail } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog";
import { TeamMembersDialog } from "@/components/teams/team-members-dialog";
import { TeamQuickActionsMenu } from "@/components/teams/team-quick-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

async function TeamOverview({ teamId }: { teamId: string }) {
  const [teamResult, projectsResult] = await Promise.all([getTeam(teamId), getProjects(teamId)]);

  const team: TeamDetail | null = teamResult.data;
  const projects: ProjectItem[] = projectsResult.data ?? [];

  if (!team) {
    return (
      <Card>
        <p className="text-sm text-red-600">Failed to load team details.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Team"
        title={team.name}
        description={team.description ?? "No description provided."}
        actions={
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/70 p-1.5">
            <TeamMembersDialog members={team.members ?? []} />
            <TeamQuickActionsMenu teamId={teamId} />
            <InviteMemberDialog teamId={teamId} />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Members</p>
          <p className="text-2xl font-semibold text-foreground">{(team.members ?? []).length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Active collaborators
          </p>
        </Card>

        <Card className="grid gap-1 border-border bg-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Projects</p>
          <p className="text-2xl font-semibold text-foreground">{projects.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5" />
            Delivery workstreams
          </p>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Link href={`/teams/${teamId}/projects`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <FolderKanban className="h-4 w-4" />
            View all
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {projects.slice(0, 8).map((project) => (
              <Link key={project.id} href={`/teams/${teamId}/projects/${project.id}`} className="group">
                <div className="rounded-md border border-border bg-popover p-3 transition-colors hover:bg-accent">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{project.name}</p>
                    <Badge>{project.status ?? "ACTIVE"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{project.description ?? "No description provided."}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No projects yet. Use quick actions to create one.</p>
        )}
      </Card>
    </div>
  );
}

export default async function TeamPage({
  params
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <TeamOverview teamId={teamId} />
    </Suspense>
  );
}
